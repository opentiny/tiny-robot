import { describe, expect, it } from 'vitest'
import { loadSkill as loadBrowserSkillFromRoot } from '../../index'
import { loadSkill as loadNodeSkillFromEntry } from '../../node'
import { loadSkill as loadBrowserSkill } from '../loader'
import { loadSkill as loadNodeSkill } from '../loader/node'
import { isSkillContextMessage as rootContextMessage } from '../../index'
import { isSkillContextMessage as coreContextMessage } from '../../core'
import { isSkillContextMessage as nodeContextMessage } from '../../node'

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
})
