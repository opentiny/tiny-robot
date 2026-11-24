import { deflateRawSync, gzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import { describe, expect, it, vi } from 'vitest'
import { loadSkill, loadSkillWithDetails } from '../loader'
import { loadSkill as loadNodeSkill } from '../loader/node'
import { createMemorySkillStorage } from '../storage'

const readArchiveFixture = (name: string) => readFile(new URL(`./fixtures/archives/${name}`, import.meta.url))

const createZip = (entries: Record<string, string | Uint8Array>, method: 0 | 8 = 8) => {
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
    const content = typeof text === 'string' ? encoder.encode(text) : text
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

type TarEntry = { path: string; content: string | Uint8Array; type?: number; headerSize?: number }

const createPaxRecord = (keyword: string, value: string) => {
  const body = ` ${keyword}=${value}\n`
  const bodySize = new TextEncoder().encode(body).length
  let length = bodySize + 1
  while (String(length).length + bodySize !== length) length = String(length).length + bodySize
  return `${length}${body}`
}

const createTar = (entries: Record<string, string | Uint8Array> | TarEntry[]) => {
  const blocks: Uint8Array[] = []
  const encoder = new TextEncoder()
  const members = Array.isArray(entries)
    ? entries
    : Object.entries(entries).map(([path, content]) => ({ path, content }))
  for (const { path, content, type = 48, headerSize } of members as TarEntry[]) {
    const data = typeof content === 'string' ? encoder.encode(content) : content
    const header = new Uint8Array(512)
    const write = (offset: number, length: number, value: string) =>
      header.set(encoder.encode(value).subarray(0, length), offset)
    const octal = (offset: number, length: number, value: number) =>
      write(offset, length, `${value.toString(8).padStart(length - 1, '0')}\0`)
    write(0, 100, path)
    octal(100, 8, 0o644)
    octal(108, 8, 0)
    octal(116, 8, 0)
    octal(124, 12, headerSize ?? data.length)
    octal(136, 12, 0)
    header.fill(32, 148, 156)
    header[156] = type
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
  it('rejects ZIP symbolic links before loading resources', async () => {
    const bytes = new Uint8Array(await createZip({ 'SKILL.md': skillMd }).arrayBuffer())
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    view.setUint32(centralOffset + 38, 0xa1ff0000, true)
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })).rejects.toThrow(
      'symbolic links',
    )
  })

  it('stops reading when actual decompressed output exceeds the limit', async () => {
    const cancel = vi.fn()
    const pull = vi.fn((controller: ReadableStreamDefaultController<Uint8Array>) => {
      controller.enqueue(new Uint8Array(skillMd.length + 1))
    })
    const stream = new ReadableStream<Uint8Array>({ pull, cancel }, { highWaterMark: 0 })
    const pipe = vi.spyOn(ReadableStream.prototype, 'pipeThrough').mockReturnValue(stream)
    try {
      await expect(
        loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }), maxUncompressedSize: skillMd.length }),
      ).rejects.toThrow('limit')
      expect(cancel).toHaveBeenCalledOnce()
      expect(pull).toHaveBeenCalledOnce()
    } finally {
      pipe.mockRestore()
    }
  })

  it('reports a ZIP entry size mismatch when output exceeds its declared size but not the remaining budget', async () => {
    const bytes = new Uint8Array(await createZip({ 'SKILL.md': skillMd }).arrayBuffer())
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    view.setUint32(22, 5, true)
    view.setUint32(centralOffset + 24, 5, true)

    await expect(
      loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip'), maxUncompressedSize: 1024 }),
    ).rejects.toThrow('Invalid uncompressed size for ZIP entry: SKILL.md.')
  })

  it.each(['maxArchiveSize', 'maxUncompressedSize', 'maxFileCount'] as const)(
    'rejects invalid %s values',
    async (option) => {
      for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        await expect(
          loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }), [option]: value }),
        ).rejects.toThrow('non-negative safe integer')
      }
    },
  )
  it.each([
    'root-stored.zip',
    'root-deflate.zip',
    'wrapped-stored.zip',
    'wrapped-deflate.zip',
    'root.tar',
    'root.tar.gz',
  ])('loads independently generated archive %s with directories and exact resource content', async (name) => {
    const bytes = await readFile(new URL(`./fixtures/archives/${name}`, import.meta.url))
    const { skill, warnings } = await loadSkillWithDetails({ source: 'archive', file: new File([bytes], name) })
    expect(skill.name).toBe('archive-skill')
    expect(warnings).toEqual([])
    expect(skill.resources).toHaveLength(3)
    const guide = skill.resources?.find((resource) => resource.path === 'references/说明.md')
    await expect(guide?.readText?.()).resolves.toBe('# 使用说明')
    const icon = skill.resources?.find((resource) => resource.path === 'assets/icon.bin')
    await expect(icon?.readBinary?.()).resolves.toEqual(new Uint8Array([0, 128, 255, 1]))
    expect(skill.resources?.some((resource) => resource.path === '.hidden.txt')).toBe(true)
  })

  it('accepts macOS ZIP filenames encoded as UTF-8 without the UTF-8 flag', async () => {
    const bytes = new Uint8Array(await readArchiveFixture('macos.zip'))
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    expect(view.getUint16(centralOffset + 8, true) & 0x800).toBe(0)
    const skill = await loadSkill({ source: 'archive', file: new File([bytes], 'macos.zip') })
    expect(skill.resources?.map((resource) => resource.path)).toContain('references/说明.md')
  })

  it.each(['zip', 'tar', 'tar.gz', 'tgz'])('uses custom entryFile in root and wrapped %s layouts', async (format) => {
    for (const entryFile of ['ENTRY.md', 'config/ENTRY.md', '.\\config\\ENTRY.md']) {
      for (const prefix of ['', 'skill/']) {
        const entryPath = entryFile.replace(/\\/g, '/').replace(/^\.\//, '')
        const entries = { [`${prefix}${entryPath}`]: skillMd, [`${prefix}references/guide.md`]: 'guide' }
        const tar = createTar(entries)
        const file =
          format === 'zip' ? createZip(entries) : new File([format === 'tar' ? tar : gzipSync(tar)], `skill.${format}`)
        const skill = await loadSkill({ source: 'archive', file, entryFile })
        expect(skill.name).toBe('archive-skill')
        expect(skill.resources?.map((resource) => resource.path)).toEqual(['references/guide.md'])
      }
    }
  })

  it.each(['', '../ENTRY.md', '/ENTRY.md', 'bad\0.md'])('rejects invalid archive entryFile %j', async (entryFile) => {
    await expect(loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }), entryFile })).rejects.toThrow(
      'Invalid skill entry file path',
    )
  })

  it.each([false, true])('decodes legacy ZIP names only when the UTF-8 flag is clear (%s)', async (flagged) => {
    const bytes = new Uint8Array(await createZip({ 'cafX.md': 'guide', 'SKILL.md': skillMd }).arrayBuffer())
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    view.setUint16(6, flagged ? 0x800 : 0, true)
    view.setUint16(centralOffset + 8, flagged ? 0x800 : 0, true)
    bytes[33] = 0x82
    bytes[centralOffset + 49] = 0x82
    const job = loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })
    if (flagged) await expect(job).rejects.toThrow('not valid UTF-8')
    else expect((await job).resources?.map((resource) => resource.path)).toEqual(['café.md'])
  })

  it.each([false, true])('uses checked Unicode Path fields only for unflagged ZIP names (%s)', async (flagged) => {
    const rawPath = 'ENTRY.md'
    const original = new Uint8Array(await createZip({ [rawPath]: skillMd }, 0).arrayBuffer())
    const originalView = new DataView(original.buffer)
    const centralOffset = originalView.getUint32(original.length - 6, true)
    const unicodeName = new TextEncoder().encode('SKILL.md')
    const extra = new Uint8Array(9 + unicodeName.length)
    const extraView = new DataView(extra.buffer)
    extraView.setUint16(0, 0x7075, true)
    extraView.setUint16(2, 5 + unicodeName.length, true)
    extra[4] = 1
    let checksum = 0xffffffff
    for (const byte of new TextEncoder().encode(rawPath)) {
      checksum ^= byte
      for (let bit = 0; bit < 8; bit += 1) checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0)
    }
    extraView.setUint32(5, (checksum ^ 0xffffffff) >>> 0, true)
    extra.set(unicodeName, 9)
    const bytes = new Uint8Array(original.length + extra.length * 2)
    const localNameEnd = 30 + rawPath.length
    const endOffset = original.length - 22
    bytes.set(original.subarray(0, localNameEnd))
    bytes.set(extra, localNameEnd)
    bytes.set(original.subarray(localNameEnd, endOffset), localNameEnd + extra.length)
    bytes.set(extra, endOffset + extra.length)
    bytes.set(original.subarray(endOffset), endOffset + extra.length * 2)
    const view = new DataView(bytes.buffer)
    view.setUint16(6, flagged ? 0x800 : 0, true)
    view.setUint16(28, extra.length, true)
    view.setUint16(centralOffset + extra.length + 8, flagged ? 0x800 : 0, true)
    view.setUint16(centralOffset + extra.length + 30, extra.length, true)
    view.setUint32(bytes.length - 10, endOffset - centralOffset + extra.length, true)
    view.setUint32(bytes.length - 6, centralOffset + extra.length, true)
    await expect(
      loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip'), entryFile: flagged ? rawPath : 'SKILL.md' }),
    ).resolves.toMatchObject({ name: 'archive-skill' })
    if (!flagged) {
      bytes[localNameEnd + 5] ^= 1
      bytes[endOffset + extra.length + 5] ^= 1
      await expect(
        loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip'), entryFile: rawPath }),
      ).resolves.toBeTruthy()
    }
  })

  it.each(['zip', 'tar', 'tgz'])('rejects a regular file conflicting with the %s wrapper', async (format) => {
    const entries = { bundle: 'conflict', 'bundle/SKILL.md': skillMd }
    const tar = createTar(entries)
    const file =
      format === 'zip' ? createZip(entries) : new File([format === 'tar' ? tar : gzipSync(tar)], `skill.${format}`)
    await expect(loadSkill({ source: 'archive', file })).rejects.toThrow('Invalid skill archive structure')
  })

  it.each([false, true])('accepts a ZIP descriptor with signature=%s and a signature-valued CRC', async (signed) => {
    const content = new Uint8Array([172, 10, 122, 213])
    const original = new Uint8Array(await createZip({ 'SKILL.md': skillMd, 'crc.bin': content }, 0).arrayBuffer())
    const originalView = new DataView(original.buffer)
    const centralOffset = originalView.getUint32(original.length - 6, true)
    const resourceCentral = centralOffset + 46 + 'SKILL.md'.length
    const localOffset = originalView.getUint32(resourceCentral + 42, true)
    const descriptor = new Uint8Array(signed ? 16 : 12)
    const descriptorView = new DataView(descriptor.buffer)
    const fieldOffset = signed ? 4 : 0
    if (signed) descriptorView.setUint32(0, 0x08074b50, true)
    descriptorView.setUint32(fieldOffset, 0x08074b50, true)
    descriptorView.setUint32(fieldOffset + 4, content.length, true)
    descriptorView.setUint32(fieldOffset + 8, content.length, true)
    const bytes = new Uint8Array(original.length + descriptor.length)
    bytes.set(original.subarray(0, centralOffset))
    bytes.set(descriptor, centralOffset)
    bytes.set(original.subarray(centralOffset), centralOffset + descriptor.length)
    const view = new DataView(bytes.buffer)
    view.setUint16(localOffset + 6, 0x808, true)
    view.setUint16(resourceCentral + descriptor.length + 8, 0x808, true)
    view.setUint32(bytes.length - 6, centralOffset + descriptor.length, true)
    const skill = await loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })
    await expect(skill.resources?.[0]?.readBinary?.()).resolves.toEqual(content)
    bytes[centralOffset + fieldOffset + 4] ^= 1
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })).rejects.toThrow(
      'data descriptor',
    )
  })

  it('rejects mismatched Stored sizes before copying the payload', async () => {
    const bytes = new Uint8Array(await createZip({ 'SKILL.md': skillMd }, 0).arrayBuffer())
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    view.setUint32(22, 1, true)
    view.setUint32(centralOffset + 24, 1, true)
    const slice = vi.spyOn(Uint8Array.prototype, 'slice')
    try {
      await expect(
        loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip'), maxUncompressedSize: 1 }),
      ).rejects.toThrow('Invalid uncompressed size')
      expect(slice).not.toHaveBeenCalled()
    } finally {
      slice.mockRestore()
    }
  })

  it('reports missing raw Deflate runtime support through the Node loader', async () => {
    const file = createZip({ 'SKILL.md': skillMd })
    vi.stubGlobal(
      'DecompressionStream',
      class {
        constructor() {
          throw new TypeError('unsupported format')
        }
      },
    )
    try {
      await expect(loadNodeSkill({ source: 'archive', file })).rejects.toThrow('deflate-raw')
      await expect(
        loadNodeSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }, 0) }),
      ).resolves.toBeTruthy()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it.each(['tar', 'tgz'])('uses PAX size for %s content, padding, truncation and limits', async (format) => {
    const content = 'a'.repeat(600)
    const tar = createTar([
      { path: 'SKILL.md', content: skillMd },
      { path: 'PaxHeader', type: 120, content: createPaxRecord('path', 'notes.md') + createPaxRecord('size', '600') },
      { path: 'placeholder', content, headerSize: 1 },
      { path: 'after.md', content: 'after' },
    ])
    const file = new File([format === 'tar' ? tar : gzipSync(tar)], `skill.${format}`)
    const skill = await loadSkill({ source: 'archive', file, maxUncompressedSize: skillMd.length + 605 })
    await expect(skill.resources?.find((resource) => resource.path === 'notes.md')?.readText?.()).resolves.toBe(content)
    expect(skill.resources?.map((resource) => resource.path)).toEqual(['after.md', 'notes.md'])
    await expect(loadSkill({ source: 'archive', file, maxUncompressedSize: skillMd.length + 604 })).rejects.toThrow(
      'expands beyond',
    )
    const truncated = tar.subarray(0, 512 * 5)
    await expect(
      loadSkill({
        source: 'archive',
        file: new File([format === 'tar' ? truncated : gzipSync(truncated)], `skill.${format}`),
      }),
    ).rejects.toThrow('truncated entry')
  })
})
