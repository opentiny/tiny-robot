import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createFsSkillStorage } from '../storage/node'

const createTempRoot = () => mkdtemp(join(tmpdir(), 'tiny-robot-skill-storage-'))

describe('FsSkillStorage', () => {
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
