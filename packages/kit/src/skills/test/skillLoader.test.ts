import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadSkillFilesFromFs } from '../fsSkillFiles'
import { SkillLoader } from '../skillLoader'

describe('SkillLoader', () => {
  it('loads weather skill directory as SkillDefinition', async () => {
    const skillDirectory = fileURLToPath(new URL('./.cache/weather', import.meta.url))
    const files = await loadSkillFilesFromFs(skillDirectory)
    const loadedSkill = new SkillLoader().load(files)
    const { skill } = loadedSkill

    expect(skill.name).toBe('weather')
    expect(skill.description).toContain('weather')
    expect(skill.instructions).toContain('# Weather Skill')
    expect(skill.metadata?.homepage).toBe('https://wttr.in/:help')
    expect(loadedSkill.warnings).toEqual([])
  })

  it('loads multi-file skill references as files', async () => {
    const skillDirectory = fileURLToPath(new URL('./.cache/vue-best-practices', import.meta.url))
    const files = await loadSkillFilesFromFs(skillDirectory)
    const loadedSkill = new SkillLoader().load(files)
    const { skill } = loadedSkill

    expect(skill.name).toBe('vue-best-practices')
    expect(skill.description).toContain('Vue.js tasks')
    expect(skill.instructions).toContain('# Vue Best Practices Workflow')
    expect(skill.metadata).toMatchObject({
      author: 'github.com/vuejs-ai',
      version: '18.0.0',
    })
    expect(skill.files).toBeDefined()
    expect(skill.files).toHaveLength(files.length - 1)
    expect(skill.files?.map((file) => file.id)).toEqual(
      expect.arrayContaining([
        'references/reactivity.md',
        'references/sfc.md',
        'references/component-data-flow.md',
        'references/composables.md',
      ]),
    )
    expect(skill.files?.find((file) => file.id === 'references/reactivity.md')).toMatchObject({
      path: 'references/reactivity.md',
      kind: 'text',
      content: expect.stringContaining('# Reactivity'),
    })
    expect(loadedSkill.warnings).toEqual([])
  })

  it('keeps binary files as skill files', () => {
    const image = new Uint8Array([1, 2, 3])
    const loadedSkill = new SkillLoader().load([
      {
        path: 'SKILL.md',
        kind: 'text',
        content: [
          '---',
          'name: binary-skill',
          'description: Skill with binary assets',
          '---',
          '',
          '# Binary Skill',
        ].join('\n'),
      },
      {
        path: 'assets/icon.png',
        kind: 'binary',
        content: image,
        mimeType: 'image/png',
        size: image.byteLength,
        lastModified: 123,
      },
    ])

    expect(loadedSkill.skill.files).toEqual([
      {
        id: 'assets/icon.png',
        path: 'assets/icon.png',
        kind: 'binary',
        content: image,
        mimeType: 'image/png',
        size: 3,
        lastModified: 123,
      },
    ])
    expect(loadedSkill.warnings).toEqual([])
  })

  it('throws when the entry file is missing', () => {
    expect(() => new SkillLoader().load([])).toThrow('Skill entry file "SKILL.md" is missing.')
  })

  it('throws when the entry file is binary', () => {
    expect(() =>
      new SkillLoader().load([
        {
          path: 'SKILL.md',
          kind: 'binary',
          content: new Uint8Array([1, 2, 3]),
        },
      ]),
    ).toThrow('Skill entry file "SKILL.md" must be a text file.')
  })

  it('throws when the entry file has no instructions', () => {
    expect(() =>
      new SkillLoader().load([
        {
          path: 'SKILL.md',
          kind: 'text',
          content: ['---', 'name: empty-skill', 'description: Empty skill', '---', ''].join('\n'),
        },
      ]),
    ).toThrow('Skill entry file "SKILL.md" must contain instructions.')
  })

  it('reports duplicate and unsupported file warnings', () => {
    const loadedSkill = new SkillLoader().load([
      {
        path: 'SKILL.md',
        kind: 'text',
        content: ['---', 'name: warning-skill', 'description: Warning skill', '---', '', '# Warning'].join('\n'),
      },
      {
        path: 'notes.md',
        kind: 'text',
        content: 'first',
      },
      {
        path: 'notes.md',
        kind: 'text',
        content: 'second',
      },
      {
        path: 'script.ts',
        kind: 'text',
        content: 'export {}',
      },
    ])

    expect(loadedSkill.warnings).toEqual([
      {
        code: 'duplicate-path',
        message: 'Duplicate skill file path: notes.md',
        path: 'notes.md',
      },
      {
        code: 'unsupported-text-file-ignored',
        message: 'Only markdown, text, and json files are converted to text skill files.',
        path: 'script.ts',
      },
    ])
    expect(loadedSkill.skill.files?.map((file) => file.path)).toEqual(['notes.md'])
  })

  it('throws warnings as errors in strict mode', () => {
    expect(() =>
      new SkillLoader({ strict: true }).load([
        {
          path: 'SKILL.md',
          kind: 'text',
          content: ['---', 'name: strict-skill', 'description: Strict skill', '---', '', '# Strict'].join('\n'),
        },
        {
          path: 'notes.md',
          kind: 'text',
          content: 'first',
        },
        {
          path: 'notes.md',
          kind: 'text',
          content: 'second',
        },
      ]),
    ).toThrow('notes.md: Duplicate skill file path: notes.md')
  })

  it('keeps json files as regular skill files', () => {
    const loadedSkill = new SkillLoader().load([
      {
        path: 'SKILL.md',
        kind: 'text',
        content: ['---', 'name: tool-skill', 'description: Tool skill', '---', '', '# Tool'].join('\n'),
      },
      {
        path: 'references/weather-format.json',
        kind: 'text',
        content: JSON.stringify({
          type: 'function',
          function: {
            name: 'run_tool',
            description: 'Run tool',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
        }),
      },
    ])

    expect(loadedSkill.skill.files?.map((file) => file.path)).toEqual(['references/weather-format.json'])
    expect(loadedSkill.warnings).toEqual([])
  })
})
