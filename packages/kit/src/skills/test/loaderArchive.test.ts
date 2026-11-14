import { deflateRawSync, gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { loadSkill } from '../loader'

const createZip = (entries: Record<string, string>, method: 0 | 8 = 8) => {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0
  const encoder = new TextEncoder()
  const u16 = (view: DataView, at: number, value: number) => view.setUint16(at, value, true)
  const u32 = (view: DataView, at: number, value: number) => view.setUint32(at, value, true)
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff
    for (const byte of bytes) {
      crc ^= byte
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  for (const [path, text] of Object.entries(entries)) {
    const name = encoder.encode(path)
    const content = encoder.encode(text)
    const compressed = method === 8 ? new Uint8Array(deflateRawSync(content)) : content
    const local = new Uint8Array(30 + name.length + compressed.length)
    const localView = new DataView(local.buffer)
    u32(localView, 0, 0x04034b50)
    u16(localView, 4, 20)
    u16(localView, 6, 0x800)
    u16(localView, 8, method)
    u32(localView, 14, crc32(content))
    u32(localView, 18, compressed.length)
    u32(localView, 22, content.length)
    u16(localView, 26, name.length)
    local.set(name, 30)
    local.set(compressed, 30 + name.length)
    localParts.push(local)

    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    u32(centralView, 0, 0x02014b50)
    u16(centralView, 4, 20)
    u16(centralView, 6, 20)
    u16(centralView, 8, 0x800)
    u16(centralView, 10, method)
    u32(centralView, 16, crc32(content))
    u32(centralView, 20, compressed.length)
    u32(centralView, 24, content.length)
    u16(centralView, 28, name.length)
    u32(centralView, 42, offset)
    central.set(name, 46)
    centralParts.push(central)
    offset += local.length
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  u32(endView, 0, 0x06054b50)
  u16(endView, 8, centralParts.length)
  u16(endView, 10, centralParts.length)
  u32(endView, 12, centralSize)
  u32(endView, 16, offset)
  const output = new Uint8Array(offset + centralSize + end.length)
  let cursor = 0
  for (const part of [...localParts, ...centralParts, end]) {
    output.set(part, cursor)
    cursor += part.length
  }
  return new File([output], 'skill.zip', { type: 'application/zip' })
}

const skillMd = '---\nname: archive-skill\ndescription: ZIP skill\n---\n\n# Archive skill'

const createTar = (entries: Record<string, string>) => {
  const blocks: Uint8Array[] = []
  const encoder = new TextEncoder()
  for (const [path, content] of Object.entries(entries)) {
    const data = encoder.encode(content)
    const header = new Uint8Array(512)
    const view = new DataView(header.buffer)
    const write = (offset: number, length: number, value: string) =>
      header.set(encoder.encode(value).subarray(0, length), offset)
    const octal = (offset: number, length: number, value: number) =>
      write(offset, length, `${value.toString(8).padStart(length - 1, '0')}\0`)
    write(0, 100, path)
    octal(100, 8, 0o644)
    octal(108, 8, 0)
    octal(116, 8, 0)
    octal(124, 12, data.length)
    octal(136, 12, 0)
    header.fill(32, 148, 156)
    header[156] = 48
    write(257, 6, 'ustar\0')
    write(263, 2, '00')
    const checksum = header.reduce((sum, byte) => sum + byte, 0)
    write(148, 8, `${checksum.toString(8).padStart(6, '0')}\0 `)
    blocks.push(header)
    const paddedData = new Uint8Array(Math.ceil(data.length / 512) * 512)
    paddedData.set(data)
    blocks.push(paddedData)
  }
  blocks.push(new Uint8Array(1024))
  const result = new Uint8Array(blocks.reduce((sum, block) => sum + block.length, 0))
  let offset = 0
  for (const block of blocks) {
    result.set(block, offset)
    offset += block.length
  }
  return result
}

describe('archive skill loader', () => {
  it.each([0, 8] as const)('loads ZIP compression method %i and strips one package root', async (method) => {
    const skill = await loadSkill({
      source: 'archive',
      file: createZip({ 'package/SKILL.md': skillMd, 'package/references/guide.md': '# Guide' }, method),
    })

    expect(skill.name).toBe('archive-skill')
    expect(skill.resources?.map((resource) => resource.path)).toEqual(['references/guide.md'])
  })

  it('rejects archive traversal paths', async () => {
    await expect(loadSkill({ source: 'archive', file: createZip({ '../SKILL.md': skillMd }) })).rejects.toThrow(
      'Invalid path in skill archive',
    )
  })

  it('rejects entries with an invalid checksum', async () => {
    const zip = createZip({ 'SKILL.md': skillMd })
    const bytes = new Uint8Array(await zip.arrayBuffer())
    const centralOffset = new DataView(bytes.buffer).getUint32(bytes.length - 6, true)
    bytes[centralOffset + 16] ^= 0xff
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })).rejects.toThrow(
      'Invalid checksum',
    )
  })

  it('enforces the uncompressed size limit before reading entries', async () => {
    await expect(
      loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }), maxUncompressedSize: 2 }),
    ).rejects.toThrow('expands beyond')
  })

  it('rejects non-ZIP archive extensions', async () => {
    const zip = createZip({ 'SKILL.md': skillMd })
    const tarball = new File([zip], 'skill.rar')
    await expect(loadSkill({ source: 'archive', file: tarball })).rejects.toThrow('Unsupported skill archive format')
  })

  it.each(['skill.tar', 'skill.tar.gz', 'skill.tgz'])('loads TAR archive format %s', async (name) => {
    const tar = createTar({ 'package/SKILL.md': skillMd, 'package/reference.md': 'Guide' })
    const content = name.endsWith('.gz') || name.endsWith('.tgz') ? gzipSync(tar) : tar
    const skill = await loadSkill({ source: 'archive', file: new File([content], name) })
    expect(skill.name).toBe('archive-skill')
    expect(skill.resources?.map((resource) => resource.path)).toEqual(['reference.md'])
  })

  it('enforces the uncompressed size limit while reading gzip streams', async () => {
    const content = gzipSync(createTar({ 'SKILL.md': skillMd }))
    await expect(
      loadSkill({ source: 'archive', file: new File([content], 'skill.tgz'), maxUncompressedSize: 10 }),
    ).rejects.toThrow('expands beyond')
  })

  it('rejects path traversal and unsupported TAR link entries', async () => {
    const traversal = createTar({ '../SKILL.md': skillMd })
    await expect(loadSkill({ source: 'archive', file: new File([traversal], 'skill.tar') })).rejects.toThrow(
      'Invalid path in skill archive',
    )

    const symlinkTar = createTar({ 'SKILL.md': skillMd })
    symlinkTar[156] = 50
    const header = symlinkTar.subarray(0, 512)
    header.fill(32, 148, 156)
    let checksum = 0
    for (const byte of header) checksum += byte
    const checksumText = checksum.toString(8).padStart(6, '0')
    header.set(new TextEncoder().encode(`${checksumText}\0 `), 148)
    await expect(loadSkill({ source: 'archive', file: new File([symlinkTar], 'skill.tar') })).rejects.toThrow(
      'Unsupported TAR entry type',
    )
  })
})
