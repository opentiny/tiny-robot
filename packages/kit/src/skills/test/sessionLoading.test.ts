import { legacyExplicitSkillResult } from './sessionTestUtils'
import { describe, expect, it } from 'vitest'
import type { BasePluginContext, ChatMessage } from '../../message/types'
import { createSessionSkillLoader } from '../session/loading'

const skill = { name: 'A', description: 'A summary', instructions: 'A instructions' }
const contextFor = (messages: ChatMessage[] = []) =>
  ({
    getState: () => ({ messages }),
    abortSignal: new AbortController().signal,
  }) as BasePluginContext

describe('session skill loading', () => {
  it.each([undefined, 'none'] as const)('returns full content for repeated loads in mode %s', async (deduplication) => {
    const loader = createSessionSkillLoader({ sessionId: 'chat', deduplication, getSkillByName: () => skill })
    const first = await loader.load(['A'], contextFor())
    const second = await loader.load(['A'], contextFor([legacyExplicitSkillResult('chat', first)]))
    expect(second.skills).toEqual([{ name: 'A', status: 'loaded', instructions: 'A instructions' }])
  })

  it('deduplicates only identical content still present in context', async () => {
    let definition = skill
    const loader = createSessionSkillLoader({
      sessionId: 'chat',
      deduplication: 'context',
      getSkillByName: () => definition,
    })
    const first = await loader.load(['A'], contextFor())
    const messages = [legacyExplicitSkillResult('chat', first)]
    expect((await loader.load(['A'], contextFor(messages))).skills[0]).toMatchObject({
      name: 'A',
      status: 'already_loaded',
    })
    definition = { ...skill, instructions: 'New instructions' }
    expect((await loader.load(['A'], contextFor(messages))).skills[0]).toMatchObject({
      status: 'loaded',
      instructions: 'New instructions',
    })
    definition = skill
    expect((await loader.load(['A'], contextFor())).skills[0]).toMatchObject({
      status: 'loaded',
      instructions: 'A instructions',
    })
  })

  it('checks current availability before deduplicating and preserves independent failures', async () => {
    const loader = createSessionSkillLoader({
      sessionId: 'chat',
      deduplication: 'context',
      getSkillByName: (name) => {
        if (name === 'A') return skill
        if (name === 'error') throw new Error('offline')
        if (name === 'mismatch') return skill
      },
    })
    const result = await loader.load(['A', 'missing', 'error', 'mismatch', 'A'], contextFor())
    expect(result.skills).toMatchObject([
      { name: 'A', status: 'loaded', instructions: 'A instructions' },
      { name: 'missing', status: 'failed', error: { code: 'skill_unavailable' } },
      { name: 'error', status: 'failed', error: { code: 'skill_load_failed' } },
      { name: 'mismatch', status: 'failed', error: { code: 'skill_load_failed' } },
    ])
    const unavailable = createSessionSkillLoader({
      sessionId: 'chat',
      deduplication: 'context',
      getSkillByName: () => undefined,
    })
    expect(
      (await unavailable.load(['A'], contextFor([legacyExplicitSkillResult('chat', result)]))).skills[0],
    ).toMatchObject({ error: { code: 'skill_unavailable' } })
  })

  it('does not treat pending parallel loads as committed content', async () => {
    const loader = createSessionSkillLoader({
      sessionId: 'chat',
      deduplication: 'context',
      getSkillByName: async () => skill,
    })
    const results = await Promise.all([loader.load(['A'], contextFor()), loader.load(['A'], contextFor())])
    expect(results.map((result) => result.skills[0].status)).toEqual(['loaded', 'loaded'])
  })

  it('returns invalid input results and respects cancellation', async () => {
    const loader = createSessionSkillLoader({ sessionId: 'chat', getSkillByName: () => skill })
    expect(await loader.load([], contextFor())).toMatchObject({ skills: [], error: { code: 'invalid_skill_names' } })
    const controller = new AbortController()
    controller.abort()
    await expect(loader.load(['A'], { ...contextFor(), abortSignal: controller.signal })).rejects.toThrow()
  })
})
