import { isTextSkillFilePath, normalizeSkillPath, throwIfSkillLoadCancelled } from './utils'
import type { ArchiveSkillLoadOptions, LoadableSkillFile, SkillLoadContext } from './type'

const DEFAULT_MAX_UNCOMPRESSED_SIZE = 10 * 1024 * 1024
const UTF8 = new TextDecoder()

type ZipEntry = {
  path: string
  method: number
  crc32: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
  directory: boolean
}

export async function loadArchiveSkillFiles(
  options: ArchiveSkillLoadOptions,
  context: SkillLoadContext,
): Promise<LoadableSkillFile[]> {
  if (!/\.zip$/i.test(options.file.name)) {
    throw new Error('Unsupported skill archive format. Use a .zip file.')
  }

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('ZIP import requires a runtime with DecompressionStream support.')
  }

  const bytes = new Uint8Array(await options.file.arrayBuffer())
  const entries = readCentralDirectory(bytes)
  const limit = options.maxUncompressedSize ?? DEFAULT_MAX_UNCOMPRESSED_SIZE
  const totalSize = entries.reduce((total, entry) => total + (entry.directory ? 0 : entry.uncompressedSize), 0)
  if (totalSize > limit) throw new Error(`Skill archive expands beyond the ${limit}-byte limit.`)

  const files: LoadableSkillFile[] = []
  for (const entry of entries) {
    throwIfSkillLoadCancelled(context.signal)
    if (entry.directory) continue
    if (entry.path.split(/[\\/]/).includes('__MACOSX') || entry.path.split(/[\\/]/).at(-1) === '.DS_Store') continue

    const path = normalizeArchivePath(entry.path)
    const data = await readEntry(bytes, entry)
    throwIfSkillLoadCancelled(context.signal)
    const kind = isTextSkillFilePath(path) ? 'text' : 'binary'

    files.push({
      path,
      kind,
      content: kind === 'text' ? UTF8.decode(data) : data,
      size: data.byteLength,
    })
  }

  return stripSingleRootDirectory(files)
}

function readCentralDirectory(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const minimumOffset = Math.max(0, bytes.length - 22 - 0xffff)
  let endOffset = -1

  for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      endOffset = offset
      break
    }
  }
  if (endOffset < 0) throw new Error('Invalid ZIP archive: end record was not found.')

  const disk = view.getUint16(endOffset + 4, true)
  const centralDisk = view.getUint16(endOffset + 6, true)
  const diskEntries = view.getUint16(endOffset + 8, true)
  const entryCount = view.getUint16(endOffset + 10, true)
  const centralSize = view.getUint32(endOffset + 12, true)
  const centralOffset = view.getUint32(endOffset + 16, true)
  if (disk || centralDisk || diskEntries !== entryCount || entryCount === 0xffff || centralOffset === 0xffffffff) {
    throw new Error('Unsupported ZIP archive layout.')
  }
  if (centralOffset + centralSize > endOffset)
    throw new Error('Invalid ZIP archive: central directory is out of bounds.')

  const entries: ZipEntry[] = []
  let offset = centralOffset
  for (let index = 0; index < entryCount; index += 1) {
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
    const nameStart = offset + 46
    const nameEnd = nameStart + nameLength
    if (nameEnd + extraLength + commentLength > centralOffset + centralSize) {
      throw new Error('Invalid ZIP archive: entry metadata is out of bounds.')
    }
    if (flags & 1) throw new Error('Encrypted ZIP entries are not supported.')
    if (
      startDisk ||
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      localHeaderOffset === 0xffffffff
    ) {
      throw new Error('ZIP64 and split ZIP archives are not supported.')
    }
    if (method !== 0 && method !== 8) throw new Error(`Unsupported ZIP compression method: ${method}.`)

    const rawName = UTF8.decode(bytes.subarray(nameStart, nameEnd))
    entries.push({
      path: rawName,
      method,
      crc32,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      directory: rawName.endsWith('/'),
    })
    offset = nameEnd + extraLength + commentLength
  }

  if (offset !== centralOffset + centralSize) throw new Error('Invalid ZIP archive: central directory size mismatch.')
  return entries
}

function normalizeArchivePath(rawPath: string) {
  const path = rawPath.replace(/\\/g, '/')
  if (!path || path.startsWith('/') || /^[a-zA-Z]:/.test(path) || path.split('/').some((part) => part === '..')) {
    throw new Error(`Invalid path in ZIP archive: ${rawPath}`)
  }
  const normalized = normalizeSkillPath(path)
  if (!normalized) throw new Error(`Invalid path in ZIP archive: ${rawPath}`)
  return normalized
}

async function readEntry(bytes: Uint8Array, entry: ZipEntry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const offset = entry.localHeaderOffset
  if (offset + 30 > bytes.length || view.getUint32(offset, true) !== 0x04034b50) {
    throw new Error(`Invalid ZIP archive: malformed local header for ${entry.path}.`)
  }
  const nameLength = view.getUint16(offset + 26, true)
  const extraLength = view.getUint16(offset + 28, true)
  const dataOffset = offset + 30 + nameLength + extraLength
  const dataEnd = dataOffset + entry.compressedSize
  if (dataEnd > bytes.length) throw new Error(`Invalid ZIP archive: data is out of bounds for ${entry.path}.`)

  const compressed = bytes.slice(dataOffset, dataEnd)
  let result: Uint8Array
  if (entry.method === 0) result = compressed
  else {
    try {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      const reader = stream.getReader()
      const chunks: Uint8Array[] = []
      let size = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > entry.uncompressedSize) {
          await reader.cancel()
          throw new Error(`ZIP entry exceeds its declared size: ${entry.path}.`)
        }
        chunks.push(value)
      }
      result = new Uint8Array(size)
      let cursor = 0
      for (const chunk of chunks) {
        result.set(chunk, cursor)
        cursor += chunk.byteLength
      }
    } catch {
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

function stripSingleRootDirectory(files: LoadableSkillFile[]) {
  const roots = new Set(files.map((file) => file.path.split('/')[0]))
  if (roots.size !== 1) return files

  const [root] = roots
  if (!root || !files.some((file) => file.path === `${root}/SKILL.md`)) return files
  return files.map((file) => ({ ...file, path: file.path.slice(root.length + 1) }))
}
