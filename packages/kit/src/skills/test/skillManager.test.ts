import { describe, expect, it } from 'vitest'
import { SkillManager } from '../manager'

const skill = (name: string, description = `${name} skill`) => ({
  name,
  description,
  instructions: `${name} instructions`,
})

describe('SkillManager', () => {
  it('sets, lists, and removes skills', () => {
    const manager = new SkillManager()

    manager.set(skill('weather'))
    expect(manager.has('weather')).toBe(true)
    expect(manager.get('weather')?.description).toBe('weather skill')
    expect(manager.list().map((item) => item.name)).toEqual(['weather'])

    manager.set(skill('weather', 'Updated weather skill'))
    expect(manager.get('weather')).toMatchObject({
      name: 'weather',
      description: 'Updated weather skill',
    })

    expect(manager.remove('weather')?.name).toBe('weather')
    expect(manager.list()).toEqual([])
  })

  it('replaces existing skills with the same name', () => {
    const manager = new SkillManager({ skills: [skill('weather')] })

    manager.set(skill('weather', 'Replacement weather skill'))

    expect(manager.get('weather')?.description).toBe('Replacement weather skill')
  })

  it('manages selected skills in selection order', () => {
    const weather = skill('weather')
    const vue = skill('vue')
    const manager = new SkillManager({
      skills: [weather, vue],
      selectedSkillNames: ['vue'],
    })

    manager.select('weather')
    expect(manager.getSelectedSkillNames()).toEqual(['vue', 'weather'])
    expect(manager.getSelectedSkills()).toEqual([vue, weather])

    manager.unselect('vue')
    expect(manager.getSelectedSkillNames()).toEqual(['weather'])
  })

  it('throws when selecting missing skills', () => {
    const manager = new SkillManager({ skills: [skill('weather')] })

    expect(() => manager.select('missing')).toThrow('Skill "missing" does not exist.')
  })

  it('throws when initialized with missing selected skills', () => {
    expect(() => new SkillManager({ selectedSkillNames: ['missing'] })).toThrow('Skill "missing" does not exist.')
  })

  it('removes deleted skills from the selection', () => {
    const manager = new SkillManager({
      skills: [skill('weather')],
      selectedSkillNames: ['weather'],
    })

    manager.remove('weather')

    expect(manager.getSelectedSkillNames()).toEqual([])
    expect(manager.getSelectedSkills()).toEqual([])
  })

  it('clears skills and selected skills', () => {
    const manager = new SkillManager({
      skills: [skill('weather')],
      selectedSkillNames: ['weather'],
    })

    manager.clear()

    expect(manager.list()).toEqual([])
    expect(manager.getSelectedSkillNames()).toEqual([])
  })

  it('imports skills through SkillLoader', () => {
    const manager = new SkillManager()
    const result = manager.import([
      {
        path: 'SKILL.md',
        kind: 'text',
        content: ['---', 'name: docs', 'description: Docs skill', '---', '', '# Docs'].join('\n'),
      },
    ])

    expect(result.skill.name).toBe('docs')
    expect(manager.get('docs')).toBe(result.skill)
  })

  it('replaces imported skills with the same name', () => {
    const manager = new SkillManager({ skills: [skill('docs')] })

    manager.import([
      {
        path: 'SKILL.md',
        kind: 'text',
        content: ['---', 'name: docs', 'description: Imported docs skill', '---', '', '# Docs'].join('\n'),
      },
    ])

    expect(manager.get('docs')?.description).toBe('Imported docs skill')
  })

  it('passes loader options when importing skills', () => {
    const manager = new SkillManager()

    const result = manager.import(
      [
        {
          path: 'README.md',
          kind: 'text',
          content: ['---', 'name: custom-entry', 'description: Custom entry skill', '---', '', '# Custom'].join('\n'),
        },
      ],
      { entryFile: 'README.md' },
    )

    expect(result.skill.name).toBe('custom-entry')
    expect(manager.get('custom-entry')).toBe(result.skill)
  })
})
