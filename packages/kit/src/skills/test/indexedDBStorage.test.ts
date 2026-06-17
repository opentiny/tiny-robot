import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { createIndexedDBSkillStorage } from '../storage'
import type { SkillDefinition } from '../types'

const databaseName = () => `tiny-robot-skills-test-${crypto.randomUUID()}`

describe('IndexedDBSkillStorage', () => {
  it('adds, gets, lists, checks, and deletes skills', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    const saved = await storage.add({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
      metadata: {
        homepage: 'https://example.com',
      },
    })

    expect(saved).toMatchObject({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
      metadata: {
        homepage: 'https://example.com',
      },
    })
    expect(await storage.has('demo')).toBe(true)
    expect(await storage.list()).toEqual([
      {
        name: 'demo',
        description: 'Demo skill',
        resourceCount: 0,
        metadata: {
          homepage: 'https://example.com',
        },
      },
    ])

    expect(await storage.delete('demo')).toBe(true)
    expect(await storage.delete('demo')).toBe(false)
    expect(await storage.has('demo')).toBe(false)
    expect(await storage.get('demo')).toBeUndefined()
  })

  it('restores resources as lazy readers without eager content', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    await storage.add({
      name: 'docs',
      description: 'Docs skill',
      instructions: '# Docs',
      resources: [
        {
          path: 'references/guide.md',
          kind: 'text',
          resourceId: 'references/guide.md',
          text: '# Guide',
          readText: async () => '# Guide',
        },
        {
          path: 'assets/icon.png',
          kind: 'binary',
          resourceId: 'assets/icon.png',
          binary: new Uint8Array([1, 2, 3]),
          readBinary: async () => new Uint8Array([1, 2, 3]),
          mimeType: 'image/png',
        },
      ],
    })

    const skill = await storage.get('docs')
    const textResource = skill?.resources?.find((resource) => resource.path === 'references/guide.md')
    const binaryResource = skill?.resources?.find((resource) => resource.path === 'assets/icon.png')

    expect(textResource).toMatchObject({
      path: 'references/guide.md',
      kind: 'text',
      resourceId: 'references/guide.md',
    })
    expect(textResource).not.toHaveProperty('text')
    await expect(textResource?.readText?.()).resolves.toBe('# Guide')
    await expect(textResource?.readBinary?.()).resolves.toEqual(new TextEncoder().encode('# Guide'))

    expect(binaryResource).toMatchObject({
      path: 'assets/icon.png',
      kind: 'binary',
      resourceId: 'assets/icon.png',
      mimeType: 'image/png',
    })
    expect(binaryResource).not.toHaveProperty('binary')
    await expect(binaryResource?.readBinary?.()).resolves.toEqual(new Uint8Array([1, 2, 3]))
    await expect(binaryResource?.readText?.()).resolves.toBe(new TextDecoder().decode(new Uint8Array([1, 2, 3])))
  })

  it('overwrites stale resource records when replacing a skill', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    await storage.add({
      name: 'docs',
      description: 'Docs skill',
      instructions: '# Docs',
      resources: [
        {
          path: 'old.md',
          kind: 'text',
          resourceId: 'old.md',
          text: 'old',
        },
      ],
    })

    await storage.add({
      name: 'docs',
      description: 'Updated docs skill',
      instructions: '# Updated',
      resources: [
        {
          path: 'new.md',
          kind: 'text',
          resourceId: 'new.md',
          text: 'new',
        },
      ],
    })

    const skill = await storage.get('docs')

    expect(skill?.description).toBe('Updated docs skill')
    expect(skill?.resources?.map((resource) => resource.path)).toEqual(['new.md'])
    await expect(skill?.resources?.[0]?.readText?.()).resolves.toBe('new')
  })

  it('imports skills from browser sources', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })

    const file = new File(
      [['---', 'name: browser-docs', 'description: Browser docs skill', '---', '', '# Browser Docs'].join('\n')],
      'SKILL.md',
      { type: 'text/markdown' },
    )

    const result = await storage.import({
      source: 'browser',
      fileList: [file],
    })

    expect(result.name).toBe('browser-docs')
    expect(await storage.get('browser-docs')).toMatchObject({
      name: 'browser-docs',
      instructions: '# Browser Docs',
    })
  })

  it('persists resources through lazy readers during add', async () => {
    const storage = createIndexedDBSkillStorage({ databaseName: databaseName() })
    const skill: SkillDefinition = {
      name: 'lazy',
      description: 'Lazy skill',
      instructions: '# Lazy',
      resources: [
        {
          path: 'lazy.md',
          kind: 'text',
          resourceId: 'lazy.md',
          readText: async () => 'lazy text',
        },
      ],
    }

    await storage.add(skill)

    const storedSkill = await storage.get('lazy')
    const resource = storedSkill?.resources?.[0]

    expect(resource).not.toHaveProperty('text')
    await expect(resource?.readText?.()).resolves.toBe('lazy text')
  })
})
