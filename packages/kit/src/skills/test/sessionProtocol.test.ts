import { legacyExplicitSkillResult } from './sessionTestUtils'
import { describe, expect, it } from 'vitest'
import {
  createSkillCatalogMessage,
  isSkillContextMessage,
  readSessionCatalog,
  readRequestedSkillNames,
  readCommittedSkillPayloads,
} from '../session/protocol'

const payload = { name: 'A', status: 'loaded' as const, instructions: 'A instructions' }

describe('session skill protocol', () => {
  it('restores catalog and explicit content after JSON persistence', () => {
    const messages = JSON.parse(
      JSON.stringify([
        createSkillCatalogMessage('chat', [{ name: 'A', description: 'A summary' }]),
        legacyExplicitSkillResult('chat', { skills: [payload] }),
      ]),
    )
    expect(readSessionCatalog(messages, 'chat')).toEqual([{ name: 'A', description: 'A summary' }])
    expect(readCommittedSkillPayloads(messages, 'chat')).toEqual([payload])
  })

  it('keeps user mention requests visible and normalizes their names', () => {
    const message = {
      role: 'user' as const,
      content: '@A question',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A', 'A'] } },
    }
    expect(readRequestedSkillNames(message)).toEqual(['A'])
    expect(isSkillContextMessage(message)).toBe(false)
    expect(isSkillContextMessage(legacyExplicitSkillResult('chat', { skills: [payload] }))).toBe(true)
    expect(readRequestedSkillNames({ role: 'user', content: '@A quoted' })).toEqual([])
  })

  it('recognizes only complete paired successful automatic results', () => {
    const result = {
      role: 'tool' as const,
      tool_call_id: 'call-A',
      content: JSON.stringify({ skills: [payload] }),
      metadata: { tinyRobotSkillContext: { version: 1, sessionId: 'chat', kind: 'load-result', source: 'auto' } },
    }
    const assistant = {
      role: 'assistant' as const,
      content: '',
      tool_calls: [
        {
          id: 'call-A',
          type: 'function' as const,
          function: { name: 'load_skills', arguments: '{"skillNames":["A"]}' },
        },
      ],
      state: { toolCall: { 'call-A': { status: 'success' } } },
    }
    expect(readCommittedSkillPayloads([assistant, result], 'chat')).toEqual([payload])
    expect(readCommittedSkillPayloads([result], 'chat')).toEqual([])
    assistant.state.toolCall['call-A'].status = 'running'
    expect(readCommittedSkillPayloads([assistant, result], 'chat')).toEqual([])
    expect(isSkillContextMessage(result)).toBe(false)
  })

  it('rejects a different session and ignores malformed or failed results', () => {
    const message = legacyExplicitSkillResult('chat', { skills: [payload] })
    expect(() => readSessionCatalog([message], 'other')).toThrow(/session/i)
    expect(readCommittedSkillPayloads([{ ...message, content: '{partial' }], 'chat')).toEqual([])
    expect(
      readCommittedSkillPayloads(
        [
          legacyExplicitSkillResult('chat', {
            skills: [{ name: 'A', status: 'failed', error: { code: 'skill_unavailable' } }],
          }),
        ],
        'chat',
      ),
    ).toEqual([])
  })
})
