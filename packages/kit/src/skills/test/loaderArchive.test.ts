import { deflateRawSync, gzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import { describe, expect, it, vi } from 'vitest'
import { loadSkill, loadSkillWithDetails } from '../loader'
import { loadSkill as loadNodeSkill } from '../loader/node'
import { createMemorySkillStorage } from '../storage'

const readArchiveFixture = (name: string) => readFile(new URL(`./fixtures/archives/${name}`, import.meta.url))

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

const createTar = (entries: Record<string, string | Uint8Array>) => {
  const blocks: Uint8Array[] = []
  const encoder = new TextEncoder()
  for (const [path, content] of Object.entries(entries)) {
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

  it.each([false, true])('rejects invalid UTF-8 ZIP names with language flag %s', async (flagged) => {
    const bytes = new Uint8Array(await createZip({ 'SKILL.md': skillMd }).arrayBuffer())
    const view = new DataView(bytes.buffer)
    const centralOffset = view.getUint32(bytes.length - 6, true)
    view.setUint16(6, flagged ? 0x800 : 0, true)
    view.setUint16(centralOffset + 8, flagged ? 0x800 : 0, true)
    bytes[30] = 0xff
    bytes[centralOffset + 46] = 0xff
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })).rejects.toThrow(
      flagged ? 'not valid UTF-8' : 'cannot be reliably decoded',
    )
  })

  it.each(['zip', 'tgz'])('cancels the underlying %s decompression reader while a read is pending', async (format) => {
    const file =
      format === 'zip'
        ? createZip({ 'SKILL.md': skillMd })
        : new File([gzipSync(createTar({ 'SKILL.md': skillMd }))], 'skill.tgz')
    let started!: () => void
    const reading = new Promise<void>((resolve) => {
      started = resolve
    })
    const cancel = vi.fn()
    const stream = new ReadableStream<Uint8Array>(
      {
        pull() {
          started()
        },
        cancel,
      },
      { highWaterMark: 0 },
    )
    const pipe = vi.spyOn(ReadableStream.prototype, 'pipeThrough').mockReturnValue(stream)
    try {
      const job = loadSkill({ source: 'archive', file })
      const rejected = expect(job).rejects.toMatchObject({ name: 'SkillLoadCancelledError' })
      await reading
      job.cancel()
      await rejected
      expect(cancel).toHaveBeenCalledOnce()
    } finally {
      pipe.mockRestore()
    }
  })

  it.each(['../SKILL.md', '/SKILL.md', 'C:/SKILL.md', 'bad\0/SKILL.md'])(
    'rejects unsafe archive path %s',
    async (path) => {
      await expect(loadSkill({ source: 'archive', file: createZip({ [path]: skillMd }) })).rejects.toThrow(
        'Invalid path',
      )
    },
  )

  it('normalizes dot segments and rejects colliding resource paths', async () => {
    await expect(
      loadSkill({
        source: 'archive',
        file: createZip({ 'SKILL.md': skillMd, 'refs/./a.txt': 'a', 'refs/a.txt': 'b' }),
      }),
    ).rejects.toThrow('Duplicate path')
  })

  it('rejects an unrelated empty directory beside the wrapper', async () => {
    await expect(
      loadSkill({ source: 'archive', file: createZip({ 'package/SKILL.md': skillMd, 'unrelated/': '' }) }),
    ).rejects.toThrow('Invalid skill archive structure')
  })

  it('rejects a corrupt stored payload by its actual CRC', async () => {
    const bytes = new Uint8Array(await createZip({ 'SKILL.md': skillMd }, 0).arrayBuffer())
    bytes[38] ^= 1
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.zip') })).rejects.toThrow(
      'Invalid checksum for ZIP entry',
    )
  })

  it('rejects a truncated archive', async () => {
    const bytes = await createZip({ 'SKILL.md': skillMd }).arrayBuffer()
    await expect(loadSkill({ source: 'archive', file: new File([bytes.slice(0, -8)], 'skill.zip') })).rejects.toThrow(
      'Invalid ZIP',
    )
  })
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

  it('applies archive and file-count limits independently', async () => {
    const archive = createZip({ 'SKILL.md': skillMd, 'refs/a.md': 'A', 'refs/b.md': 'B' })
    await expect(loadSkill({ source: 'archive', file: archive, maxArchiveSize: archive.size })).resolves.toBeTruthy()
    await expect(loadSkill({ source: 'archive', file: archive, maxArchiveSize: archive.size - 1 })).rejects.toThrow(
      'file is too large',
    )
    await expect(loadSkill({ source: 'archive', file: archive, maxFileCount: 3 })).resolves.toBeTruthy()
    await expect(loadSkill({ source: 'archive', file: archive, maxFileCount: 2 })).rejects.toThrow('more than 2 files')
  })

  it('accepts exact uncompressed size and file-count boundaries', async () => {
    const contents = { 'SKILL.md': skillMd, 'refs/a.md': 'A' }
    const archive = createZip(contents)
    const exactSize = Object.values(contents).reduce(
      (size, value) => size + new TextEncoder().encode(value).byteLength,
      0,
    )
    await expect(
      loadSkill({ source: 'archive', file: archive, maxUncompressedSize: exactSize, maxFileCount: 2 }),
    ).resolves.toBeTruthy()
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid archive limits: %s',
    async (limit) => {
      await expect(
        loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }), maxArchiveSize: limit }),
      ).rejects.toThrow('maxArchiveSize must be a non-negative safe integer')
    },
  )

  it('rejects oversized files before reading their contents', async () => {
    const archive = createZip({ 'SKILL.md': skillMd })
    let readAttempted = false
    const unreadyFile = Object.create(Object.getPrototypeOf(archive), {
      name: { value: 'skill.zip' },
      size: { value: archive.size },
      arrayBuffer: {
        value: () => {
          readAttempted = true
          return archive.arrayBuffer()
        },
      },
    }) as File
    await expect(loadSkill({ source: 'archive', file: unreadyFile, maxArchiveSize: 0 })).rejects.toThrow(
      'file is too large',
    )
    expect(readAttempted).toBe(false)
  })

  it('filters system metadata before charging size and file-count limits', async () => {
    const skill = await loadSkill({
      source: 'archive',
      file: createZip({ 'SKILL.md': skillMd, '.DS_Store': 'ignored', '__MACOSX/junk': 'ignored', '.keep': 'kept' }),
      maxFileCount: 2,
      maxUncompressedSize: new TextEncoder().encode(skillMd).length + 4,
    })
    expect(skill.resources?.map((resource) => resource.path)).toEqual(['.keep'])
  })

  it('returns the same skill content as an equivalent browser file list', async () => {
    const archive = await loadSkillWithDetails({
      source: 'archive',
      file: createZip({
        'package/SKILL.md': skillMd,
        'package/references/guide.md': '# Guide',
        'package/assets/raw.bin': 'binary-data',
        'package/__MACOSX/._guide': 'ignored',
      }),
    })
    const browser = await loadSkillWithDetails({
      source: 'browser',
      fileList: [
        new File([skillMd], 'SKILL.md'),
        Object.assign(new File(['# Guide'], 'guide.md'), { webkitRelativePath: 'package/references/guide.md' }),
        Object.assign(new File([new TextEncoder().encode('binary-data')], 'raw.bin'), {
          webkitRelativePath: 'package/assets/raw.bin',
        }),
      ],
    })
    const summarize = (skill: typeof archive.skill) => ({
      name: skill.name,
      description: skill.description,
      instructions: skill.instructions,
      resources: skill.resources?.map((resource) => ({
        path: resource.path,
        kind: resource.kind,
        text: resource.text,
        binary: resource.binary ? Array.from(resource.binary) : undefined,
      })),
    })
    expect(summarize(archive.skill)).toEqual(summarize(browser.skill))
    expect(archive.warnings).toEqual(browser.warnings)
  })

  it('cancels archive entry loading through the returned load job', async () => {
    const job = loadSkill({ source: 'archive', file: createZip({ 'SKILL.md': skillMd }) })
    job.cancel()
    await expect(job).rejects.toMatchObject({ name: 'SkillLoadCancelledError' })
  })

  it('requires root SKILL.md or one single wrapper directory', async () => {
    const wrapped = await loadSkill({ source: 'archive', file: createZip({ '套件/SKILL.md': skillMd }) })
    expect(wrapped.name).toBe('archive-skill')
    await expect(
      loadSkill({ source: 'archive', file: createZip({ 'a/SKILL.md': skillMd, 'b/x': 'x' }) }),
    ).rejects.toThrow('Invalid skill archive structure')
    await expect(loadSkill({ source: 'archive', file: createZip({ 'a/b/SKILL.md': skillMd }) })).rejects.toThrow(
      'Invalid skill archive structure',
    )
  })

  it('rejects duplicate paths and explicitly rejects ZIP64 sentinels', async () => {
    const duplicated = createZip({ 'SKILL.md': skillMd, 'refs/abc': 'x' })
    const duplicateBytes = new Uint8Array(await duplicated.arrayBuffer())
    const duplicateView = new DataView(duplicateBytes.buffer)
    const centralOffset = duplicateView.getUint32(duplicateBytes.length - 6, true)
    const firstNameLength = duplicateView.getUint16(centralOffset + 28, true)
    const secondCentralOffset = centralOffset + 46 + firstNameLength
    duplicateBytes.set(new TextEncoder().encode('SKILL.md'), secondCentralOffset + 46)
    await expect(loadSkill({ source: 'archive', file: new File([duplicateBytes], 'skill.zip') })).rejects.toThrow(
      'Duplicate path',
    )

    const zip64 = new Uint8Array(await createZip({ 'SKILL.md': skillMd }).arrayBuffer())
    new DataView(zip64.buffer).setUint32(zip64.length - 6, 0xffffffff, true)
    await expect(loadSkill({ source: 'archive', file: new File([zip64], 'skill.zip') })).rejects.toThrow('ZIP64')
  })

  it('rejects unsupported archive extensions', async () => {
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

  it('enforces the extracted file size limit after gzip decompression', async () => {
    const content = gzipSync(createTar({ 'SKILL.md': skillMd }))
    await expect(
      loadSkill({ source: 'archive', file: new File([content], 'skill.tgz'), maxUncompressedSize: 10 }),
    ).rejects.toThrow('expands beyond')
  })

  it.each(['deflate.zip', 'stored.zip', 'ustar.tar', 'skill.tar.gz', 'pax.tar', 'gnu.tar'])(
    'imports an independently generated %s fixture through browser and Node loaders',
    async (name) => {
      const file = new File([await readArchiveFixture(name)], name)
      for (const loader of [loadSkill, loadNodeSkill]) {
        const skill = await loader({ source: 'archive', file })
        expect(skill).toMatchObject({
          name: 'archive-fixture',
          description: 'Real archive fixture',
          instructions: '# Import from archive',
        })
        const guide = skill.resources?.find((resource) => resource.path === 'references/guide.md')
        await expect(guide?.readText?.()).resolves.toBe('Reference: 中文资源\n')
        const image = skill.resources?.find((resource) => resource.path === 'assets/icon.png')
        await expect(image?.readBinary?.()).resolves.toEqual(new Uint8Array([0, 137, 80, 78, 71, 255]))
        if (name === 'pax.tar' || name === 'gnu.tar') {
          const longPath = `references/${'long-directory/'.repeat(9)}说明.md`
          const reference = skill.resources?.find((resource) => resource.path === longPath)
          await expect(reference?.readText?.()).resolves.toBe('Long path reference\n')
        }
      }
    },
  )

  it.each(['deflate.zip', 'ustar.tar', 'skill.tar.gz'])('persists resources imported from %s', async (name) => {
    const storage = createMemorySkillStorage()
    await storage.import({ source: 'archive', file: new File([await readArchiveFixture(name)], name) })
    const saved = await storage.get('archive-fixture')
    const guide = saved?.resources?.find((resource) => resource.path === 'references/guide.md')
    await expect(guide?.readText?.()).resolves.toBe('Reference: 中文资源\n')
    const image = saved?.resources?.find((resource) => resource.path === 'assets/icon.png')
    await expect(image?.readBinary?.()).resolves.toEqual(new Uint8Array([0, 137, 80, 78, 71, 255]))
  })

  it.each(['tar', 'tar.gz', 'tgz'])(
    'filters AppleDouble metadata before %s structure and resource limits',
    async (format) => {
      const metadata = new Uint8Array(38)
      const view = new DataView(metadata.buffer)
      view.setUint32(0, 0x00051607)
      view.setUint32(4, 0x00020000)
      view.setUint16(24, 1)
      view.setUint32(26, 9)
      view.setUint32(30, 38)
      const tar = createTar({
        '._技能包': metadata,
        '技能包/SKILL.md': skillMd,
        '技能包/._SKILL.md': metadata,
        '技能包/._notes.txt': 'normal resource',
      })
      const skill = await loadSkill({
        source: 'archive',
        file: new File([format === 'tar' ? tar : gzipSync(tar)], `skill.${format}`),
        maxFileCount: 2,
        maxUncompressedSize: new TextEncoder().encode(skillMd + 'normal resource').length,
      })
      expect(skill.resources?.map((resource) => resource.path)).toEqual(['._notes.txt'])
    },
  )

  it('preserves dot-underscore resources with incomplete or invalid AppleDouble headers', async () => {
    const magicOnly = new Uint8Array([0, 5, 22, 7])
    const invalidVersion = new Uint8Array(26)
    invalidVersion.set(magicOnly)
    const incompleteTable = invalidVersion.slice()
    new DataView(incompleteTable.buffer).setUint32(4, 0x00020000)
    new DataView(incompleteTable.buffer).setUint16(24, 1)
    const file = new File(
      [
        createTar({
          'SKILL.md': skillMd,
          '._magic.bin': magicOnly,
          '._version.bin': invalidVersion,
          '._table.bin': incompleteTable,
        }),
      ],
      'skill.tar',
    )
    const skill = await loadSkill({ source: 'archive', file })
    expect(skill.resources).toHaveLength(3)
  })

  it('stops gzip output at the stream buffer limit before TAR parsing', async () => {
    const limit = 1
    const content = gzipSync(Buffer.alloc(limit + 10000 * 1024 + 10240 + 1, 65))
    await expect(
      loadSkill({ source: 'archive', file: new File([content], 'skill.tgz'), maxUncompressedSize: limit }),
    ).rejects.toThrow('expands beyond')
  })

  it.each(['tar', 'tar.gz', 'tgz'])('rejects a corrupted TAR header in %s', async (extension) => {
    const bytes = createTar({ 'SKILL.md': skillMd })
    bytes[0] ^= 1
    const content = extension === 'tar' ? bytes : gzipSync(bytes)
    await expect(loadSkill({ source: 'archive', file: new File([content], `skill.${extension}`) })).rejects.toThrow(
      'Invalid TAR archive header or checksum',
    )
  })

  it('rejects truncated TAR file data', async () => {
    const bytes = createTar({ 'SKILL.md': skillMd }).subarray(0, 520)
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.tar') })).rejects.toThrow(
      'truncated entry',
    )
  })

  it('rejects a partial TAR header after a valid skill', async () => {
    const bytes = createTar({ 'SKILL.md': skillMd }).subarray(0, 1024 + 100)
    bytes[1024] = 65
    await expect(loadSkill({ source: 'archive', file: new File([bytes], 'skill.tar') })).rejects.toThrow(
      'truncated header',
    )
  })

  it('rejects a TAR without the required zero block end marker', async () => {
    const valid = createTar({ 'SKILL.md': skillMd })
    const missingEnd = valid.subarray(0, valid.length - 1024)
    await expect(loadSkill({ source: 'archive', file: new File([missingEnd], 'skill.tar') })).rejects.toThrow(
      'end marker is missing',
    )
  })

  it.each(['tar.gz', 'tgz'])('rejects truncated and corrupted gzip data in %s', async (extension) => {
    const bytes = gzipSync(createTar({ 'SKILL.md': skillMd }))
    const corrupt = Buffer.from(bytes)
    corrupt[corrupt.length - 8] ^= 1
    for (const content of [bytes.subarray(0, bytes.length - 5), corrupt]) {
      await expect(loadSkill({ source: 'archive', file: new File([content], `skill.${extension}`) })).rejects.toThrow(
        'Could not decompress TAR.GZ',
      )
    }
  })

  it('accepts 10000 TAR entries and rejects the next entry', async () => {
    const entries = Object.fromEntries(Array.from({ length: 9999 }, (_, index) => [`files/${index}.txt`, '']))
    entries['SKILL.md'] = skillMd
    await expect(
      loadSkill({ source: 'archive', file: new File([createTar(entries)], 'skill.tar') }),
    ).resolves.toMatchObject({
      name: 'archive-skill',
    })
    entries['files/extra.txt'] = ''
    await expect(loadSkill({ source: 'archive', file: new File([createTar(entries)], 'skill.tar') })).rejects.toThrow(
      'too many entries',
    )
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
