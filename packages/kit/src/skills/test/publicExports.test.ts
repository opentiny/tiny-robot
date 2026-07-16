import { describe, expect, it } from 'vitest'
import { loadSkill as loadBrowserSkillFromRoot } from '../../index'
import { loadSkill as loadNodeSkillFromEntry } from '../../node'
import { loadSkill as loadBrowserSkill } from '../loader'
import { loadSkill as loadNodeSkill } from '../loader/node'

describe('skill public exports', () => {
  it('exports environment-specific loaders from the root and node entrypoints', () => {
    expect(loadBrowserSkillFromRoot).toBe(loadBrowserSkill)
    expect(loadNodeSkillFromEntry).toBe(loadNodeSkill)
  })
})
