import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'
import type { ArchiveSkillLoadOptions, LoadableSkillFile, SkillLoadContext } from './type'

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

export async function loadArchiveSkillFiles(
  options: ArchiveSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFile[]> {
  const limit = options.maxUncompressedSize ?? DEFAULT_MAX_UNCOMPRESSED_SIZE
  const archiveLimit =
    options.maxArchiveSize ?? Math.min(Number.MAX_SAFE_INTEGER, limit + DEFAULT_MAX_ARCHIVE_EXTRA_SIZE)
  const fileLimit = options.maxFileCount ?? MAX_ARCHIVE_ENTRIES
  validateLimit('maxUncompressedSize', limit)
  validateLimit('maxArchiveSize', archiveLimit)
  validateLimit('maxFileCount', fileLimit)
  if (options.file.size > archiveLimit) {
    throw new Error('Skill archive file is too large to process.')
  }
  throwIfSkillLoadCancelled(context.signal)
  const bytes = new Uint8Array(await options.file.arrayBuffer())
  throwIfSkillLoadCancelled(context.signal)
  const filename = options.file.name.toLowerCase()
  const rawEntryFile = options.entryFile ?? 'SKILL.md'
  const entryFile = normalizeSkillPath(rawEntryFile)
  if (!entryFile) throw new Error(`Invalid skill entry file path: "${rawEntryFile}".`)
  if (filename.endsWith('.zip')) return loadZip(bytes, limit, fileLimit, context, entryFile)
  if (filename.endsWith('.tar')) return loadTar(bytes, limit, fileLimit, context, entryFile)
  if (filename.endsWith('.tar.gz') || filename.endsWith('.tgz')) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('TAR.GZ import requires a runtime with DecompressionStream support.')
    }
    return loadGzipTar(bytes, limit, fileLimit, context, entryFile)
  }
  throw new Error('Unsupported skill archive format. Use .zip, .tar, .tar.gz, or .tgz.')
}

function validateLimit(name: string, value: number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a non-negative safe integer.`)
}

async function loadZip(
  bytes: Uint8Array,
  limit: number,
  fileLimit: number,
  context: SkillLoadContext,
  entryFile: string,
) {
  const { entries, centralOffset } = await readCentralDirectory(bytes, context)
  let totalSize = 0
  let fileCount = 0
  for (const entry of entries) {
    throwIfSkillLoadCancelled(context.signal)
    if (isMetadataFile(entry.path)) continue
    if (entry.directory) continue
    fileCount += 1
    totalSize += entry.uncompressedSize
  }
  if (fileCount > fileLimit) throw new Error(`Skill archive contains more than ${fileLimit} files.`)
  if (totalSize > limit) throw new Error(`Skill archive expands beyond the ${limit}-byte limit.`)
  await validateZipEntries(bytes, entries, centralOffset, context)

  const files: LoadableSkillFile[] = []
  const directories: string[] = []
  let actualSize = 0
  for (const [index, entry] of entries.entries()) {
    if (index % 128 === 0) await yieldToCancellation(context)
    throwIfSkillLoadCancelled(context.signal)
    if (entry.directory) {
      if (entry.path && !isMetadataFile(entry.path)) directories.push(entry.path)
      continue
    }
    if (isMetadataFile(entry.path)) continue
    const data = await readEntry(bytes, entry, limit - actualSize, context)
    actualSize += data.byteLength
    throwIfSkillLoadCancelled(context.signal)
    files.push(toLoadableFile(entry.path, data))
  }
  return normalizeSkillArchiveStructure(files, directories, entryFile)
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
    throw new Error('Could not decompress TAR.GZ skill archive. Recompress the TAR as a single gzip member and retry.')
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

async function readCentralDirectory(bytes: Uint8Array, context: SkillLoadContext) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const minimumOffset = Math.max(0, bytes.length - 22 - 0xffff)
  let endOffset = -1

  for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
    if (offset % 4096 === 0) await yieldToCancellation(context)
    if (
      view.getUint32(offset, true) === 0x06054b50 &&
      offset + 22 + view.getUint16(offset + 20, true) === bytes.length &&
      (view.getUint32(offset + 12, true) === 0xffffffff ||
        view.getUint32(offset + 16, true) === 0xffffffff ||
        view.getUint32(offset + 12, true) + view.getUint32(offset + 16, true) === offset ||
        (offset >= 20 && view.getUint32(offset - 20, true) === 0x07064b50))
    ) {
      endOffset = offset
      break
    }
  }
  if (endOffset < 0) throw new Error('Invalid ZIP archive: end record was not found.')
  if (endOffset >= 20 && view.getUint32(endOffset - 20, true) === 0x07064b50) {
    throw new Error('ZIP64 archives are not supported.')
  }

  const disk = view.getUint16(endOffset + 4, true)
  const centralDisk = view.getUint16(endOffset + 6, true)
  const diskEntries = view.getUint16(endOffset + 8, true)
  const entryCount = view.getUint16(endOffset + 10, true)
  const centralSize = view.getUint32(endOffset + 12, true)
  const centralOffset = view.getUint32(endOffset + 16, true)
  if (diskEntries === 0xffff || entryCount === 0xffff || centralOffset === 0xffffffff || centralSize === 0xffffffff) {
    throw new Error('ZIP64 archives are not supported.')
  }
  if (disk || centralDisk || diskEntries !== entryCount) {
    throw new Error('Split ZIP archives are not supported.')
  }
  if (centralOffset + centralSize !== endOffset)
    throw new Error('Invalid ZIP archive: central directory is out of bounds.')

  const entries: ZipEntry[] = []
  if (entryCount > MAX_ARCHIVE_ENTRIES) throw new Error('Skill archive contains too many entries (maximum 10000).')
  let offset = centralOffset
  for (let index = 0; index < entryCount; index += 1) {
    if (index % 128 === 0) await yieldToCancellation(context)
    if (offset + 46 > centralOffset + centralSize || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error('Invalid ZIP archive: malformed central directory.')
    }

    const flags = view.getUint16(offset + 8, true)
    const method = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const uncompressedSize = view.getUint32(offset + 24, true)
    const crc32 = view.getUint32(offset + 16, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const startDisk = view.getUint16(offset + 34, true)
    const localHeaderOffset = view.getUint32(offset + 42, true)
    const externalAttributes = view.getUint32(offset + 38, true)
    const nameStart = offset + 46
    const nameEnd = nameStart + nameLength
    if (nameEnd + extraLength + commentLength > centralOffset + centralSize) {
      throw new Error('Invalid ZIP archive: entry metadata is out of bounds.')
    }
    if (flags & 0x41) throw new Error('Encrypted ZIP entries are not supported.')
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localHeaderOffset === 0xffffffff) {
      throw new Error('ZIP64 archives are not supported.')
    }
    if (startDisk === 0xffff) throw new Error('ZIP64 archives are not supported.')
    if (startDisk) throw new Error('Split ZIP archives are not supported.')
    if (method !== 0 && method !== 8) throw new Error(`Unsupported ZIP compression method: ${method}.`)

    const decodedName = decodeZipPath(
      bytes.subarray(nameStart, nameEnd),
      bytes.subarray(nameEnd, nameEnd + extraLength),
      flags,
    )
    const unixMode = externalAttributes >>> 16
    if ((unixMode & 0xf000) === 0xa000) throw new Error(`ZIP symbolic links are not supported: ${decodedName}`)
    const directory = /[\\/]$/.test(decodedName) || (unixMode & 0xf000) === 0x4000 || (externalAttributes & 0x10) !== 0
    const normalizedName = normalizeArchivePath(decodedName, directory)
    entries.push({
      path: normalizedName,
      rawName: bytes.subarray(nameStart, nameEnd),
      method,
      crc32,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      directory,
      flags,
      dataOffset: 0,
    })
    offset = nameEnd + extraLength + commentLength
  }

  if (offset !== centralOffset + centralSize) throw new Error('Invalid ZIP archive: central directory size mismatch.')
  const seenPaths = new Set<string>()
  for (const entry of entries) {
    if (!entry.path || isMetadataFile(entry.path)) continue
    const normalizedPath = entry.path
    if (seenPaths.has(normalizedPath)) throw new Error(`Duplicate path in skill archive: ${normalizedPath}`)
    seenPaths.add(normalizedPath)
  }
  return { entries, centralOffset }
}

async function validateZipEntries(
  bytes: Uint8Array,
  entries: ZipEntry[],
  centralOffset: number,
  context: SkillLoadContext,
) {
  const ranges: { start: number; end: number }[] = []
  for (const [index, entry] of entries.entries()) {
    if (index % 128 === 0) await yieldToCancellation(context)
    ranges.push(validateLocalEntry(bytes, entry, centralOffset))
  }
  ranges.sort((first, second) => first.start - second.start)
  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index]!.start < ranges[index - 1]!.end) throw new Error('Invalid ZIP archive: overlapping entries.')
  }
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

function validateLocalEntry(bytes: Uint8Array, entry: ZipEntry, centralStart: number) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const offset = entry.localHeaderOffset
  if (offset + 30 > centralStart || view.getUint32(offset, true) !== 0x04034b50) {
    throw new Error(`Invalid ZIP archive: malformed local header for ${entry.path}.`)
  }
  const nameLength = view.getUint16(offset + 26, true)
  const extraLength = view.getUint16(offset + 28, true)
  const localNameStart = offset + 30
  if (localNameStart + nameLength + extraLength > centralStart)
    throw new Error(`Invalid ZIP archive: local metadata is out of bounds for ${entry.path}.`)
  const rawLocalName = bytes.subarray(localNameStart, localNameStart + nameLength)
  const decodedLocalName = decodeZipPath(
    bytes.subarray(localNameStart, localNameStart + nameLength),
    bytes.subarray(localNameStart + nameLength, localNameStart + nameLength + extraLength),
    view.getUint16(offset + 6, true),
  )
  if (
    rawLocalName.length !== entry.rawName.length ||
    rawLocalName.some((byte, index) => byte !== entry.rawName[index]) ||
    normalizeArchivePath(decodedLocalName, entry.directory) !== entry.path ||
    view.getUint16(offset + 8, true) !== entry.method ||
    view.getUint16(offset + 6, true) !== entry.flags
  ) {
    throw new Error(`ZIP local header does not match central directory for ${entry.path}.`)
  }
  const dataDescriptor = (entry.flags & 0x8) !== 0
  const localCrc = view.getUint32(offset + 14, true)
  const localCompressedSize = view.getUint32(offset + 18, true)
  const localUncompressedSize = view.getUint32(offset + 22, true)
  if (localCompressedSize === 0xffffffff || localUncompressedSize === 0xffffffff)
    throw new Error('ZIP64 archives are not supported.')
  const localMetadataMismatch = dataDescriptor
    ? !(
        (localCrc === 0 || localCrc === entry.crc32) &&
        (localCompressedSize === 0 || localCompressedSize === entry.compressedSize) &&
        (localUncompressedSize === 0 || localUncompressedSize === entry.uncompressedSize)
      )
    : localCrc !== entry.crc32 ||
      localCompressedSize !== entry.compressedSize ||
      localUncompressedSize !== entry.uncompressedSize
  if (localMetadataMismatch) {
    throw new Error(`Invalid checksum or sizes in ZIP local header for ${entry.path}.`)
  }
  if (view.getUint16(offset + 6, true) & 1) throw new Error('Encrypted ZIP entries are not supported.')
  const localDataEnd = offset + 30 + nameLength + extraLength + entry.compressedSize
  if (localDataEnd > bytes.length || localDataEnd > centralStart)
    throw new Error(`Invalid ZIP archive: data is out of bounds for ${entry.path}.`)
  const dataOffset = offset + 30 + nameLength + extraLength
  const dataEnd = dataOffset + entry.compressedSize
  if (dataEnd > bytes.length) throw new Error(`Invalid ZIP archive: data is out of bounds for ${entry.path}.`)

  entry.dataOffset = dataOffset
  let rangeEnd = dataEnd
  if (dataDescriptor) {
    const matchesDescriptor = (offset: number) =>
      offset + 12 <= centralStart &&
      view.getUint32(offset, true) === entry.crc32 &&
      view.getUint32(offset + 4, true) === entry.compressedSize &&
      view.getUint32(offset + 8, true) === entry.uncompressedSize
    let descriptorOffset = dataEnd
    if (!matchesDescriptor(descriptorOffset)) {
      descriptorOffset += 4
      if (
        dataEnd + 4 > centralStart ||
        view.getUint32(dataEnd, true) !== 0x08074b50 ||
        !matchesDescriptor(descriptorOffset)
      ) {
        throw new Error(`Invalid ZIP data descriptor for ${entry.path}.`)
      }
    }
    rangeEnd = descriptorOffset + 12
  }
  return { start: offset, end: rangeEnd }
}

async function readEntry(bytes: Uint8Array, entry: ZipEntry, limit: number, context: SkillLoadContext) {
  const compressed = bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize)
  let result: Uint8Array
  if (entry.method === 0) {
    if (entry.compressedSize !== entry.uncompressedSize) {
      throw new Error(`Invalid uncompressed size for ZIP entry: ${entry.path}.`)
    }
    if (entry.uncompressedSize > limit) throw new Error(`Skill archive expands beyond the ${limit}-byte limit.`)
    result = compressed.slice()
  } else {
    let decompressor: DecompressionStream
    try {
      decompressor = new DecompressionStream('deflate-raw')
    } catch {
      throw new Error(
        'ZIP Deflate import requires DecompressionStream deflate-raw support (Node.js 20.12+ or a compatible browser).',
      )
    }
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(decompressor)
      result = await readBoundedStream(stream, Math.min(limit, entry.uncompressedSize), context, entry.uncompressedSize)
    } catch (error) {
      if (context.signal.aborted) throwIfSkillLoadCancelled(context.signal)
      if (error instanceof Error && error.message.includes('limit')) throw error
      throw new Error(`Could not decompress ZIP entry: ${entry.path}.`)
    }
  }

  if (result.byteLength !== entry.uncompressedSize)
    throw new Error(`Invalid uncompressed size for ZIP entry: ${entry.path}.`)
  if (calculateCrc32(result) !== entry.crc32) throw new Error(`Invalid checksum for ZIP entry: ${entry.path}.`)
  return result
}

function calculateCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function decodeZipPath(rawName: Uint8Array, extra: Uint8Array, flags: number) {
  let unicodePath: string | undefined
  let offset = 0
  while (offset < extra.length) {
    if (offset + 4 > extra.length) throw new Error('Invalid ZIP extra field.')
    const view = new DataView(extra.buffer, extra.byteOffset + offset, extra.length - offset)
    const id = view.getUint16(0, true)
    const size = view.getUint16(2, true)
    if (offset + 4 + size > extra.length) throw new Error('Invalid ZIP extra field.')
    if (id === 0x0001) throw new Error('ZIP64 archives are not supported.')
    if (id === 0x7075 && size >= 5 && extra[offset + 4] === 1) {
      const expectedCrc = new DataView(extra.buffer, extra.byteOffset + offset + 5, 4).getUint32(0, true)
      if (expectedCrc === calculateCrc32(rawName)) {
        try {
          unicodePath = new TextDecoder('utf-8', { fatal: true }).decode(extra.subarray(offset + 9, offset + 4 + size))
        } catch {}
      }
    }
    offset += 4 + size
  }
  if (!(flags & 0x800) && unicodePath) return unicodePath
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(rawName)
  } catch {
    if (!(flags & 0x800))
      return Array.from(rawName, (byte) =>
        byte < 128 ? String.fromCharCode(byte) : CP437_HIGH_BYTES[byte - 128],
      ).join('')
    throw new Error('ZIP contains a filename that is not valid UTF-8.')
  }
}

function normalizeSkillArchiveStructure(
  files: LoadableSkillFile[],
  directoryPaths: string[] = [],
  entryFile = 'SKILL.md',
) {
  const paths = [...files.map((file) => file.path), ...directoryPaths]
  if (files.some((file) => file.path === entryFile)) return files
  const roots = new Set(paths.map((path) => path.split('/')[0]).filter(Boolean))
  if (roots.size !== 1)
    throw new Error(`Invalid skill archive structure: expected ${entryFile} at root or in one top-level directory.`)
  const [root] = roots
  if (
    !root ||
    !files.some((file) => file.path === `${root}/${entryFile}`) ||
    files.some((file) => !file.path.startsWith(`${root}/`))
  ) {
    throw new Error(
      `Invalid skill archive structure: ${entryFile} must be at root or directly inside one top-level directory.`,
    )
  }
  return files.map((file) => ({ ...file, path: file.path.slice(root.length + 1) }))
}
