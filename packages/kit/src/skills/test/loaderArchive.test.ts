import { deflateRawSync } from 'node:zlib'
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
      'Invalid path in ZIP archive',
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
    const tarball = new File([zip], 'skill.tar.gz')
    await expect(loadSkill({ source: 'archive', file: tarball })).rejects.toThrow('Unsupported skill archive format')
  })
})
