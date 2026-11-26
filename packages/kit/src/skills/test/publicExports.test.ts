import { describe, expect, it } from 'vitest'
import { loadSkill as loadBrowserSkillFromRoot } from '../../index'
import { loadSkill as loadNodeSkillFromEntry } from '../../node'
import { loadSkill as loadBrowserSkill } from '../loader'
import { loadSkill as loadNodeSkill } from '../loader/node'
import { isSkillContextMessage as rootContextMessage } from '../../index'
import { isSkillContextMessage as coreContextMessage } from '../../core'
import { isSkillContextMessage as nodeContextMessage } from '../../node'
import { hasSkillInstructions as rootHasSkillInstructions } from '../../index'
import { hasSkillInstructions as coreHasSkillInstructions } from '../../core'
import { hasSkillInstructions as nodeHasSkillInstructions } from '../../node'
import { legacyExplicitSkillResult } from './sessionTestUtils'

describe('skill public exports', () => {
  it.each([rootContextMessage, coreContextMessage, nodeContextMessage])(
    'recognizes persisted context through every public entrypoint',
    (identify) => {
      expect(
        identify({
          role: 'system',
          metadata: { tinyRobotSkillContext: { version: 1, kind: 'catalog', sessionId: 'chat' } },
        }),
      ).toBe(true)
      expect(identify({ role: 'user', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })).toBe(false)
    },
  )
  it('exports environment-specific loaders from the root and node entrypoints', () => {
    expect(loadBrowserSkillFromRoot).toBe(loadBrowserSkill)
    expect(loadNodeSkillFromEntry).toBe(loadNodeSkill)
  })

  it.each([rootHasSkillInstructions, coreHasSkillInstructions, nodeHasSkillInstructions])(
    'identifies stored Skill instructions across the public entrypoints',
    (identify) => {
      const result = { skills: [{ name: 'A', status: 'loaded' as const, instructions: 'A instructions' }] }
      const auto = {
        role: 'tool',
        content: JSON.stringify(result),
        metadata: { tinyRobotSkillContext: { version: 1, kind: 'load-result', source: 'auto' } },
      }
      const preload = {
        role: 'user',
        content: 'Use A',
        metadata: { tinyRobotSkill: { preload: { version: 1, result } } },
      }

      expect(identify(auto)).toBe(true)
      expect(identify(preload)).toBe(true)
      expect(identify(legacyExplicitSkillResult('chat', result))).toBe(true)
      expect(
        identify({ ...auto, content: JSON.stringify({ skills: [{ name: 'A', status: 'already_loaded' }] }) }),
      ).toBe(false)
      expect(identify({ ...auto, role: 'user' })).toBe(false)
      expect(identify({ ...auto, metadata: undefined })).toBe(false)
    },
  )
})
