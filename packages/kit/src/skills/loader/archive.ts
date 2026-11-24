import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'
import type { ArchiveSkillLoadOptions, LoadableSkillFile, LoadableSkillFiles, SkillLoadContext } from './type'

const DEFAULT_MAX_UNCOMPRESSED_SIZE = 10 * 1024 * 1024
const DEFAULT_MAX_ARCHIVE_EXTRA_SIZE = 10 * 1024 * 1024
const MAX_ARCHIVE_ENTRIES = 10000
const UTF8 = new TextDecoder()
const CP437_HIGH_BYTES =
  'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\u00a0'

type ZipEntry = {
  path: string
  rawName: Uint8Array
  method: number
  crc32: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
  directory: boolean
  flags: number
  dataOffset: number
}

async function loadGzipTar(
  bytes: Uint8Array,
  limit: number,
  fileLimit: number,
  context: SkillLoadContext,
  entryFile: string,
) {
  let tarBytes: Uint8Array
  const containerLimit = Math.min(Number.MAX_SAFE_INTEGER, limit + MAX_ARCHIVE_ENTRIES * 1024 + 10240)
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    tarBytes = await readBoundedStream(stream, containerLimit, context)
  } catch (error) {
    if (context.signal.aborted) throwIfSkillLoadCancelled(context.signal)
    if (error instanceof Error && error.message.includes('limit')) {
      throw new Error(`TAR.GZ container exceeds the ${containerLimit}-byte limit, including headers and metadata.`)
    }
    throw new Error(
      'Could not decompress TAR.GZ skill archive because it is corrupt or contains multiple GZIP members. Recompress the TAR as a single gzip member and retry.',
    )
  }
  return loadTar(tarBytes, limit, fileLimit, context, entryFile)
}

async function loadTar(
  bytes: Uint8Array,
  limit: number,
  fileLimit: number,
  context: SkillLoadContext,
  entryFile: string,
) {
  const files: LoadableSkillFile[] = []
  let offset = 0
  let totalSize = 0
  let entryCount = 0
  let fileCount = 0
  const seen = new Set<string>()
  const directories: string[] = []
  const globalPax = new Map<string, string>()
  const localPax = new Map<string, string>()
  let sawEndMarker = false
  while (offset < bytes.length) {
    if (entryCount % 128 === 0) await yieldToCancellation(context)
    throwIfSkillLoadCancelled(context.signal)
    const header = bytes.subarray(offset, offset + 512)
    if (header.length === 512 && header.every((byte) => byte === 0)) {
      const secondBlock = bytes.subarray(offset + 512, offset + 1024)
      if (secondBlock.length !== 512 || !secondBlock.every((byte) => byte === 0)) {
        throw new Error('Invalid TAR archive: incomplete end marker.')
      }
      sawEndMarker = true
      break
    }
    if (header.length < 512) throw new Error('Invalid TAR archive: truncated header.')
    if (!isValidTarHeader(header)) throw new Error('Invalid TAR archive header or checksum.')

    const name = readTarString(header, 0, 100)
    const prefix = readTarString(header, 345, 155)
    const headerPath = prefix ? `${prefix}/${name}` : name
    const type = header[156] ?? 0
    const metadataHeader = type === 120 || type === 103 || type === 76
    const path = metadataHeader ? headerPath : (localPax.get('path') ?? globalPax.get('path') ?? headerPath)
    const physicalSize = parseTarOctal(header.subarray(124, 136))
    const sizeOverride = metadataHeader ? undefined : (localPax.get('size') ?? globalPax.get('size'))
    const size = sizeOverride === undefined ? physicalSize : parsePaxSize(sizeOverride)
    if (!metadataHeader) localPax.clear()
    const normalizedPath = normalizeArchivePath(path, type === 53)
    const dataOffset = offset + 512
    const paddedSize = Math.ceil(size / 512) * 512
    if (dataOffset + paddedSize > bytes.length) throw new Error(`Invalid TAR archive: truncated entry ${path}.`)
    entryCount += 1
    if (entryCount > MAX_ARCHIVE_ENTRIES) throw new Error('Skill archive contains too many entries (maximum 10000).')

    if (type === 0 || type === 48) {
      if (!isMetadataFile(path)) {
        const appleDoubleMetadata = isAppleDoubleMetadata(path, bytes.subarray(dataOffset, dataOffset + size))
        if (appleDoubleMetadata) {
          offset = dataOffset + paddedSize
          continue
        }
        if (seen.has(normalizedPath)) throw new Error(`Duplicate path in skill archive: ${normalizedPath}`)
        seen.add(normalizedPath)
        fileCount += 1
        if (fileCount > fileLimit) throw new Error(`Skill archive contains more than ${fileLimit} files.`)
        totalSize += size
        if (totalSize > limit) throw new Error(`Skill archive expands beyond the ${limit}-byte limit.`)
        files.push(toLoadableFile(normalizedPath, bytes.slice(dataOffset, dataOffset + size)))
      }
    } else if (type === 120 || type === 103) {
      const records = parsePaxRecords(bytes.subarray(dataOffset, dataOffset + size))
      const target = type === 103 ? globalPax : localPax
      for (const [keyword, value] of records) target.set(keyword, value)
    } else if (type === 76) {
      localPax.set('path', readTarString(bytes.subarray(dataOffset, dataOffset + size), 0, size))
    } else if (type === 53) {
      if (normalizedPath && !isMetadataFile(path)) directories.push(normalizedPath)
    } else {
      throw new Error(`Unsupported TAR entry type in ${path}.`)
    }

    offset = dataOffset + paddedSize
  }
  if (!sawEndMarker) throw new Error('Invalid TAR archive: end marker is missing.')
  return normalizeSkillArchiveStructure(files, directories, entryFile)
}

function parsePaxRecords(bytes: Uint8Array) {
  const records = new Map<string, string>()
  let offset = 0
  while (offset < bytes.length) {
    const space = bytes.indexOf(32, offset)
    const lengthText = UTF8.decode(bytes.subarray(offset, space < 0 ? offset : space))
    const length = Number(lengthText)
    const end = offset + length
    if (
      !/^[0-9]+$/.test(lengthText) ||
      !Number.isSafeInteger(length) ||
      end > bytes.length ||
      end <= space + 2 ||
      bytes[end - 1] !== 10
    ) {
      throw new Error('Invalid TAR PAX record length.')
    }
    const equals = bytes.indexOf(61, space + 1)
    if (equals <= space + 1 || equals >= end - 1) throw new Error('Invalid TAR PAX record keyword.')
    const keyword = UTF8.decode(bytes.subarray(space + 1, equals))
    if (keyword === 'path' || keyword === 'size') {
      let value: string
      try {
        value = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(equals + 1, end - 1))
      } catch {
        throw new Error('Invalid TAR PAX record encoding.')
      }
      if (keyword === 'size' && value !== '') parsePaxSize(value)
      records.set(keyword, value)
    }
    offset = end
  }
  return records
}

function parsePaxSize(value: string) {
  const size = Number(value)
  if (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(size)) throw new Error('Invalid TAR PAX size.')
  return size
}

function isValidTarHeader(header: Uint8Array) {
  const expected = parseTarOctal(header.subarray(148, 156))
  let checksum = 0
  for (let index = 0; index < 512; index += 1) checksum += index >= 148 && index < 156 ? 32 : header[index]!
  return checksum === expected
}

function readTarString(bytes: Uint8Array, start: number, length: number) {
  const end = bytes.subarray(start, start + length).indexOf(0)
  return UTF8.decode(bytes.subarray(start, end < 0 ? start + length : start + end))
}

function parseTarOctal(bytes: Uint8Array) {
  const value = UTF8.decode(bytes).replace(/\0.*$/, '').trim()
  if (!value) return 0
  if (!/^[0-7]+$/.test(value)) throw new Error('Invalid TAR numeric field.')
  const parsed = Number.parseInt(value, 8)
  if (!Number.isSafeInteger(parsed)) throw new Error('TAR entry size is not supported.')
  return parsed
}

async function yieldToCancellation(context: SkillLoadContext) {
  throwIfSkillLoadCancelled(context.signal)
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  throwIfSkillLoadCancelled(context.signal)
}

async function readBoundedStream(
  stream: ReadableStream<Uint8Array>,
  limit: number,
  context: SkillLoadContext,
  expectedSize?: number,
) {
  const reader = stream.getReader()
  const cancelReader = () => void reader.cancel(context.signal.reason).catch(() => undefined)
  context.signal.addEventListener('abort', cancelReader, { once: true })
  let result = new Uint8Array(Math.min(expectedSize ?? limit, 65536))
  let size = 0
  try {
    while (true) {
      throwIfSkillLoadCancelled(context.signal)
      const { done, value } = await reader.read()
      throwIfSkillLoadCancelled(context.signal)
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new Error(`Skill archive expands beyond the ${limit}-byte limit.`)
      }
      if (size > result.length) {
        const grown = new Uint8Array(Math.min(limit, Math.max(size, result.length * 2)))
        grown.set(result)
        result = grown
      }
      result.set(value, size - value.byteLength)
    }
  } catch (error) {
    await reader.cancel(error).catch(() => undefined)
    throw error
  } finally {
    context.signal.removeEventListener('abort', cancelReader)
    reader.releaseLock()
  }
  return result.subarray(0, size)
}

function isMetadataFile(path: string) {
  return path.split(/[\\/]/).includes('__MACOSX') || path.split(/[\\/]/).at(-1) === '.DS_Store'
}

function isAppleDoubleMetadata(path: string, data: Uint8Array) {
  const filename = path.split(/[\\/]/).at(-1) ?? ''
  if (!filename.startsWith('._') || data.length < 26) return false
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const version = view.getUint32(4)
  return (
    view.getUint32(0) === 0x00051607 &&
    (version === 0x00010000 || version === 0x00020000) &&
    26 + view.getUint16(24) * 12 <= data.length
  )
}

function toLoadableFile(path: string, data: Uint8Array): LoadableSkillFile {
  const kind = isTextSkillFilePath(path) ? 'text' : 'binary'
  return { path, kind, content: kind === 'text' ? UTF8.decode(data) : data, size: data.byteLength }
}

function normalizeArchivePath(rawPath: string, directory = false) {
  const path = rawPath.replace(/\\/g, '/')
  if (
    !path ||
    path.includes('\0') ||
    path.startsWith('/') ||
    /^[a-zA-Z]:/.test(path) ||
    path.split('/').some((part) => part === '..')
  ) {
    throw new Error(`Invalid path in skill archive: ${rawPath}`)
  }
  const trimmed = directory ? path.replace(/\/$/, '') : path
  const parts = trimmed.split('/')
  if (parts.some((part) => part === '')) throw new Error(`Invalid path in skill archive: ${rawPath}`)
  const canonical = parts.filter((part) => part !== '.').join('/')
  if (directory && !canonical) return ''
  const normalized = normalizeSkillPath(canonical)
  if (!normalized) throw new Error(`Invalid path in skill archive: ${rawPath}`)
  return normalized
}

function normalizeSkillArchiveStructure(
  files: LoadableSkillFile[],
  directoryPaths: string[] = [],
  entryFile = 'SKILL.md',
): LoadableSkillFiles {
  const paths = [...files.map((file) => file.path), ...directoryPaths]
  if (files.some((file) => file.path === entryFile)) return { files, directories: directoryPaths }
  const roots = new Set(paths.map((path) => path.split('/')[0]).filter(Boolean))
  if (roots.size !== 1)
    throw new Error(`Invalid skill archive structure: expected ${entryFile} at root or in one top-level directory.`)
  const [root] = roots
  if (
    !root ||
    !files.some((file) => file.path === `${root}/${entryFile}`) ||
    files.some((file) => !file.path.startsWith(`${root}/`)) ||
    directoryPaths.some((path) => path !== root && !path.startsWith(`${root}/`))
  ) {
    throw new Error(
      `Invalid skill archive structure: ${entryFile} must be at root or directly inside one top-level directory.`,
    )
  }
  return {
    files: files.map((file) => ({ ...file, path: file.path.slice(root.length + 1) })),
    directories: directoryPaths.filter((path) => path !== root).map((path) => path.slice(root.length + 1)),
  }
}
