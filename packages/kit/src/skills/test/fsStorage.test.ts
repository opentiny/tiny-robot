import { cp, mkdir, mkdtemp, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFsSkillStorage } from '../storage/node'

vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()

  return {
    ...fs,
    rename: vi.fn(fs.rename),
    stat: vi.fn(fs.stat),
  }
})

const { rename: actualRename, stat: actualStat } =
  await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')
const createTempRoot = () => mkdtemp(join(tmpdir(), 'tiny-robot-skill-storage-'))

describe('FsSkillStorage', () => {
  afterEach(() => {
    vi.mocked(rename).mockReset().mockImplementation(actualRename)
    vi.mocked(stat).mockReset().mockImplementation(actualStat)
  })

  it.each(['.', '.hidden'])('rejects invalid skill name %s', async (name) => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })

    await expect(
      storage.add({
        name,
        description: 'Invalid skill',
        instructions: '# Invalid',
      }),
    ).rejects.toThrow(`Invalid skill name for file storage: ${name}`)
  })

  it.each(['../outside.md', 'C:/Windows/x.dll', 'SKILL.md', 'skill.md'])(
    'rejects invalid resource path %s',
    async (path) => {
      const root = await createTempRoot()
      const storage = createFsSkillStorage({ root })

      await expect(
        storage.add({
          name: 'demo',
          description: 'Demo skill',
          instructions: '# Demo',
          resources: [
            {
              path,
              kind: 'text',
              resourceId: path,
              text: 'invalid',
            },
          ],
        }),
      ).rejects.toThrow(`Invalid skill resource path: ${path}`)
    },
  )

  it('adds and restores skills in native directory format with lazy resources', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })

    await storage.add({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo\n\nUse this skill.',
      metadata: {
        homepage: 'https://example.com/demo',
        version: '1.0.0',
      },
      resources: [
        {
          path: 'references/guide.md',
          kind: 'text',
          resourceId: 'references/guide.md',
          text: '# Guide',
        },
        {
          path: 'assets/icon.bin',
          kind: 'binary',
          resourceId: 'assets/icon.bin',
          binary: new Uint8Array([1, 2, 3]),
        },
      ],
    })

    await expect(readFile(join(root, 'demo', 'SKILL.md'), 'utf8')).resolves.toContain(
      'homepage: https://example.com/demo',
    )
    await expect(readFile(join(root, 'demo', 'references', 'guide.md'), 'utf8')).resolves.toBe('# Guide')

    const storedSkill = await storage.get('demo')
    const guide = storedSkill?.resources?.find((resource) => resource.path === 'references/guide.md')

    expect(storedSkill).toMatchObject({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo\n\nUse this skill.',
      metadata: {
        homepage: 'https://example.com/demo',
        version: '1.0.0',
      },
    })
    expect(guide).toMatchObject({
      path: 'references/guide.md',
      kind: 'text',
    })
    expect(guide).not.toHaveProperty('text')

    await writeFile(join(root, 'demo', 'references', 'guide.md'), '# Updated', 'utf8')
    await expect(guide?.readText?.()).resolves.toBe('# Updated')
  })

  it('keeps existing skill when replacing it fails', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })

    await storage.add({
      name: 'demo',
      description: 'Old skill',
      instructions: '# Old',
      resources: [
        {
          path: 'old.md',
          kind: 'text',
          resourceId: 'old.md',
          text: 'old',
        },
      ],
    })

    await expect(
      storage.add({
        name: 'demo',
        description: 'New skill',
        instructions: '# New',
        resources: [
          {
            path: 'new.md',
            kind: 'text',
            resourceId: 'new.md',
            readText: async () => {
              throw new Error('read failed')
            },
          },
        ],
      }),
    ).rejects.toThrow('read failed')

    const storedSkill = await storage.get('demo')
    const resource = storedSkill?.resources?.[0]

    expect(storedSkill?.description).toBe('Old skill')
    expect(resource?.path).toBe('old.md')
    await expect(resource?.readText?.()).resolves.toBe('old')
  })

  it('restores the existing skill when validation fails after installation', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })

    await storage.add({
      name: 'demo',
      description: 'Old skill',
      instructions: '# Old',
    })

    await expect(
      storage.add({
        name: 'demo',
        description: 'Invalid replacement',
        instructions: ' ',
      }),
    ).rejects.toThrow('must contain instructions')

    await expect(storage.get('demo')).resolves.toMatchObject({
      description: 'Old skill',
      instructions: '# Old',
    })
  })

  it('reports both errors and preserves the backup when restoration fails', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })

    await storage.add({
      name: 'demo',
      description: 'Old skill',
      instructions: '# Old',
    })

    vi.mocked(rename).mockImplementation(async (oldPath, newPath) => {
      if (basename(oldPath.toString()).includes('.bak-')) {
        throw new Error('restore failed')
      }

      return actualRename(oldPath, newPath)
    })

    const error = await storage
      .add({
        name: 'demo',
        description: 'Invalid replacement',
        instructions: ' ',
      })
      .catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(AggregateError)
    expect(error).toMatchObject({
      errors: [
        expect.objectContaining({ message: expect.stringContaining('must contain instructions') }),
        expect.objectContaining({ message: 'restore failed' }),
      ],
    })

    const backupDirectory = error instanceof Error ? error.message.match(/backup "([^"]+)"/)?.[1] : undefined
    expect(backupDirectory).toContain('.demo.bak-')
    await expect(readFile(join(backupDirectory!, 'SKILL.md'), 'utf8')).resolves.toContain('description: Old skill')
  })

  it('rejects mutations when readonly', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root, readonly: true })
    const readonlyError = 'File system skill storage is readonly.'

    await expect(
      storage.add({
        name: 'demo',
        description: 'Demo skill',
        instructions: '# Demo',
      }),
    ).rejects.toThrow(readonlyError)
    await expect(storage.delete('demo')).rejects.toThrow(readonlyError)
    expect(() =>
      storage.import({
        source: 'fs',
        root,
      }),
    ).toThrow(readonlyError)
  })

  it('checks entry existence without parsing and deletes a corrupt skill', async () => {
    const root = await createTempRoot()
    const directory = join(root, 'broken')
    const storage = createFsSkillStorage({ root })
    await mkdir(directory)
    await writeFile(
      join(directory, 'SKILL.md'),
      ['---', 'name: broken', 'description: Broken skill', '---', ''].join('\n'),
      'utf8',
    )

    await expect(storage.has('broken')).resolves.toBe(true)
    await expect(storage.get('broken')).rejects.toThrow('must contain instructions')
    await expect(storage.list()).rejects.toThrow('must contain instructions')
    await expect(storage.delete('broken')).resolves.toBe(true)
    await expect(storage.has('broken')).resolves.toBe(false)
  })

  it('lists summaries with exact resource counts without statting each resource', async () => {
    const root = await createTempRoot()
    const storage = createFsSkillStorage({ root })
    await storage.add({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
      resources: [
        {
          path: 'guide.md',
          kind: 'text',
          resourceId: 'guide.md',
          text: '# Guide',
        },
        {
          path: 'references/nested.md',
          kind: 'text',
          resourceId: 'references/nested.md',
          text: '# Nested',
        },
      ],
    })
    await mkdir(join(root, 'unrelated'))
    vi.mocked(stat).mockClear()

    await expect(storage.list()).resolves.toEqual([
      {
        name: 'demo',
        description: 'Demo skill',
        resourceCount: 2,
        metadata: {},
      },
    ])
    expect(stat).not.toHaveBeenCalled()
  })

  it('lists existing skill directories, imports another skill, and deletes skills', async () => {
    const root = await createTempRoot()
    const weatherRoot = fileURLToPath(new URL('./.cache/weather', import.meta.url))
    const vueRoot = fileURLToPath(new URL('./.cache/vue-best-practices', import.meta.url))
    await cp(weatherRoot, join(root, 'weather'), {
      recursive: true,
    })

    const storage = createFsSkillStorage({ root })

    await expect(storage.list()).resolves.toEqual([
      expect.objectContaining({
        name: 'weather',
        description: expect.stringContaining('weather'),
      }),
    ])
    const existingSkill = await storage.get('weather')
    expect(existingSkill?.instructions).toContain('# Weather Skill')

    const result = await storage.import({
      source: 'fs',
      root: vueRoot,
    })

    expect(result.skill.name).toBe('vue-best-practices')
    await expect(storage.list()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'weather',
        }),
        expect.objectContaining({
          name: 'vue-best-practices',
        }),
      ]),
    )
    expect(await storage.has('weather')).toBe(true)
    expect(await storage.delete('weather')).toBe(true)
    expect(await storage.get('weather')).toBeUndefined()
    expect(await storage.has('vue-best-practices')).toBe(true)
  })
})
