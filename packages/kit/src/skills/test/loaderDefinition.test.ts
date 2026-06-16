import { describe, expect, it } from 'vitest'
import { createSkillDefinition } from '../loader/definition'

describe('createSkillDefinition', () => {
  it('creates a SkillDefinition from skill entry frontmatter and instructions', () => {
    const loadedSkill = createSkillDefinition(
      [
        {
          path: 'SKILL.md',
          kind: 'text',
          content: [
            '---',
            'name: weather',
            'description: Get weather information',
            'homepage: https://wttr.in/:help',
            '---',
            '',
            '# Weather Skill',
          ].join('\n'),
        },
      ],
      {},
    )
    const { skill } = loadedSkill

    expect(skill.name).toBe('weather')
    expect(skill.description).toContain('weather')
    expect(skill.instructions).toContain('# Weather Skill')
    expect(skill.metadata?.homepage).toBe('https://wttr.in/:help')
    expect(loadedSkill.warnings).toEqual([])
  })

  it('creates resources from multi-file skill references', () => {
    const loadedSkill = createSkillDefinition(
      [
        {
          path: 'SKILL.md',
          kind: 'text',
          content: [
            '---',
            'name: vue-best-practices',
            'description: Vue.js tasks',
            'metadata:',
            '  author: github.com/vuejs-ai',
            '  version: 18.0.0',
            '---',
            '',
            '# Vue Best Practices Workflow',
          ].join('\n'),
        },
        {
          path: 'references/reactivity.md',
          kind: 'text',
          content: '# Reactivity',
        },
        {
          path: 'references/sfc.md',
          kind: 'text',
          content: '# SFC',
        },
      ],
      {},
    )
    const { skill } = loadedSkill

    expect(skill.name).toBe('vue-best-practices')
    expect(skill.description).toContain('Vue.js tasks')
    expect(skill.instructions).toContain('# Vue Best Practices Workflow')
    expect(skill.metadata).toMatchObject({
      author: 'github.com/vuejs-ai',
      version: '18.0.0',
    })
    expect(skill.resources).toHaveLength(2)
    expect(skill.resources?.map((file) => file.path)).toEqual(['references/reactivity.md', 'references/sfc.md'])
    expect(skill.resources?.find((file) => file.path === 'references/reactivity.md')).toMatchObject({
      path: 'references/reactivity.md',
      kind: 'text',
      text: expect.stringContaining('# Reactivity'),
    })
    expect(loadedSkill.warnings).toEqual([])
  })

  it('keeps binary files as skill resources', () => {
    const image = new Uint8Array([1, 2, 3])
    const loadedSkill = createSkillDefinition(
      [
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
      ],
      {},
    )

    expect(loadedSkill.skill.resources).toEqual([
      expect.objectContaining({
        path: 'assets/icon.png',
        kind: 'binary',
        binary: image,
        mimeType: 'image/png',
        size: 3,
        lastModified: 123,
      }),
    ])
    expect(loadedSkill.warnings).toEqual([])
  })

  it('throws when the entry file is missing', () => {
    expect(() => createSkillDefinition([], {})).toThrow('Skill entry file "SKILL.md" is missing.')
  })

  it('throws when the entry file is binary', () => {
    expect(() =>
      createSkillDefinition(
        [
          {
            path: 'SKILL.md',
            kind: 'binary',
            content: new Uint8Array([1, 2, 3]),
          },
        ],
        {},
      ),
    ).toThrow('Skill entry file "SKILL.md" must be a text file.')
  })

  it('throws when the entry file has no instructions', () => {
    expect(() =>
      createSkillDefinition(
        [
          {
            path: 'SKILL.md',
            kind: 'text',
            content: ['---', 'name: empty-skill', 'description: Empty skill', '---', ''].join('\n'),
          },
        ],
        {},
      ),
    ).toThrow('Skill entry file "SKILL.md" must contain instructions.')
  })

  it('reports duplicate and unsupported file warnings', () => {
    const loadedSkill = createSkillDefinition(
      [
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
      ],
      {},
    )

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
    expect(loadedSkill.skill.resources?.map((file) => file.path)).toEqual(['notes.md'])
  })

  it('throws warnings as errors in strict mode', () => {
    expect(() =>
      createSkillDefinition(
        [
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
        ],
        { strict: true },
      ),
    ).toThrow('notes.md: Duplicate skill file path: notes.md')
  })

  it('keeps json files as regular skill resources', () => {
    const loadedSkill = createSkillDefinition(
      [
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
      ],
      {},
    )

    expect(loadedSkill.skill.resources?.map((file) => file.path)).toEqual(['references/weather-format.json'])
    expect(loadedSkill.warnings).toEqual([])
  })
})
