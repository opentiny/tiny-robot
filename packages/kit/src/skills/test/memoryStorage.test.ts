import { describe, expect, it } from 'vitest'
import { createMemorySkillStorage, importSkill } from '../storage'

type TestFile = File & {
  webkitRelativePath?: string
}

const createTestFile = (path: string, content: string): TestFile =>
  ({
    name: path.split('/').at(-1) ?? path,
    webkitRelativePath: path,
    type: 'text/markdown',
    size: content.length,
    lastModified: 123,
    text: async () => content,
    arrayBuffer: async () => {
      const bytes = new TextEncoder().encode(content)
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    },
  }) as TestFile

describe('MemorySkillStorage', () => {
  it('add, get, has, delete, and list', async () => {
    const storage = createMemorySkillStorage()

    const saved = await storage.add({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
    })

    expect(saved.name).toBe('demo')
    expect(await storage.has('demo')).toBe(true)
    expect(await storage.get('demo')).toMatchObject({
      name: 'demo',
      description: 'Demo skill',
      instructions: '# Demo',
    })

    const summaries = await storage.list()
    expect(summaries).toEqual([
      {
        name: 'demo',
        description: 'Demo skill',
        resourceCount: 0,
        metadata: undefined,
      },
    ])

    expect(await storage.delete('demo')).toBe(true)
    expect(await storage.has('demo')).toBe(false)
    expect(await storage.get('demo')).toBeUndefined()
  })

  it('imports skill from browser source', async () => {
    const storage = createMemorySkillStorage()

    const { name, skill, warnings } = await storage.import({
      source: 'browser',
      fileList: [
        createTestFile(
          'weather/SKILL.md',
          ['---', 'name: weather', 'description: Weather skill', '---', '', '# Weather Skill'].join('\n'),
        ),
      ],
    })

    expect(name).toBe('weather')
    expect(skill.name).toBe('weather')
    expect(skill.instructions).toContain('# Weather Skill')
    expect(warnings).toEqual([])

    const storedSkill = await storage.get('weather')
    expect(storedSkill?.instructions).toContain('# Weather Skill')
    expect(storedSkill?.resources?.some((resource) => resource.path === 'SKILL.md')).toBeFalsy()
  })

  it('imports multi-file skill with readable resources', async () => {
    const storage = createMemorySkillStorage()

    await storage.import({
      source: 'browser',
      fileList: [
        createTestFile(
          'vue-best-practices/SKILL.md',
          [
            '---',
            'name: vue-best-practices',
            'description: Vue.js tasks',
            '---',
            '',
            '# Vue Best Practices Workflow',
          ].join('\n'),
        ),
        createTestFile('vue-best-practices/references/reactivity.md', '# Reactivity'),
      ],
    })

    const skill = await storage.get('vue-best-practices')
    const resource = skill?.resources?.find((item) => item.path === 'references/reactivity.md')

    expect(resource).toBeDefined()
    await expect(resource?.readText?.()).resolves.toContain('# Reactivity')
  })

  it('supports cancel on import task', async () => {
    let releaseWait!: () => void
    const waitForText = new Promise<string>((resolve) => {
      releaseWait = () => resolve('# Cancelled')
    })
    const task = importSkill({
      source: 'browser',
      fileList: [
        {
          ...createTestFile(
            'cancelled/SKILL.md',
            ['---', 'name: cancelled', 'description: Cancelled skill', '---', '', '# Cancelled'].join('\n'),
          ),
          text: async () => waitForText,
        },
      ],
    })
    task.cancel()
    releaseWait()

    await expect(task).rejects.toMatchObject({
      name: 'SkillLoadCancelledError',
    })
  })
})
