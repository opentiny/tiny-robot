import { describe, expect, it } from 'vitest'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { createVueMessageAdapter } from '../../message/adapters/vue'
import type { ChatMessage } from '../../message/types'
import type { SessionSkillLoadResult } from '../session/types'
import {
  legacyExplicitSkillResult,
  loadResults,
  optionsFor,
  reply,
  requestTool,
  sessionEngine,
} from './sessionTestUtils'

describe('session skill recovery', () => {
  it('regenerates a damaged catalog without rewriting the saved message', async () => {
    const damaged = {
      role: 'system' as const,
      content: '',
      metadata: {
        tinyRobotSkillContext: {
          version: 1,
          kind: 'catalog',
          sessionId: 'chat',
          candidates: [{ name: 'A', description: 'A summary' }],
        },
      },
    }
    const restored = sessionEngine(
      optionsFor(),
      async (body) => {
        expect(
          body.messages.some((message) => message.role === 'system' && String(message.content).includes('A summary')),
        ).toBe(true)
        return reply()
      },
      [damaged],
    )
    await restored.sendMessage('question')
    expect(damaged.content).toBe('')
  })

  it('preserves the engine rejection of asynchronous onInit hooks', () => {
    expect(() => sessionEngine(optionsFor({ onInit: async () => {} }), async () => reply())).toThrow(/synchronous/i)
  })

  it.each(['none', 'context'] as const)(
    'restores messages and handles repeated loads with %s',
    async (deduplication) => {
      const original = sessionEngine(optionsFor({ deduplication }), async () => reply())
      await original.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
      const saved = JSON.parse(JSON.stringify(original.getState().messages))
      let next = 0
      const restored = sessionEngine(
        optionsFor({ deduplication }),
        async (body) => {
          if (next++ === 0) {
            expect(loadResults(body.messages).map((item: { status: string }) => item.status)).toEqual(['loaded'])
            return reply('', [requestTool('load_skills', { skillNames: ['A'] })])
          }
          expect(loadResults(body.messages).map((item: { status: string }) => item.status)).toEqual([
            'loaded',
            deduplication === 'none' ? 'loaded' : 'already_loaded',
          ])
          return reply()
        },
        saved,
      )
      await restored.sendMessage('continue')
      expect(restored.getState().messages.filter((message) => message.role === 'system')).toHaveLength(1)
    },
  )

  it('reloads after the original full content is removed', async () => {
    const original = sessionEngine(optionsFor({ deduplication: 'context' }), async () => reply())
    await original.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
    const saved: ChatMessage[] = JSON.parse(JSON.stringify(original.getState().messages))
    for (const message of saved) {
      const skill = message.metadata?.tinyRobotSkill as { preload?: unknown } | undefined
      if (skill) delete skill.preload
    }
    const restored = sessionEngine(
      optionsFor({ deduplication: 'context' }),
      async (body) => {
        expect(loadResults(body.messages)).toMatchObject([
          { name: 'A', status: 'loaded', instructions: 'A instructions' },
        ])
        return reply()
      },
      saved,
    )
    await restored.send({
      role: 'user',
      content: '@A again',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    })
  })

  it.each([createNativeMessageAdapter, createVueMessageAdapter])(
    'resends the only saved preload with its full body',
    async (createAdapter) => {
      const config = optionsFor({ deduplication: 'context' })
      const original = sessionEngine(config, async () => reply())
      await original.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
      const saved: ChatMessage[] = JSON.parse(JSON.stringify(original.getState().messages))
      const retry = sessionEngine(
        config,
        async (body) => {
          expect(loadResults(body.messages)).toEqual([{ name: 'A', status: 'loaded', instructions: 'A instructions' }])
          return reply()
        },
        [],
        {},
        createAdapter(),
      )
      await retry.send(saved.find((message) => message.role === 'user')!)
    },
  )

  it('restores a tool-loaded body and deduplicates it without a configured session id', async () => {
    const config = optionsFor({ sessionId: undefined, deduplication: 'context' })
    const original = sessionEngine(config, async (body) => {
      if (body.messages.at(-1)?.role === 'tool') return reply()
      return reply('', [requestTool('load_skills', { skillNames: ['A'] }, 'original-load')])
    })
    await original.sendMessage('question')
    const toolResult = original.getState().messages.find((message) => message.role === 'tool')
    expect(toolResult?.metadata?.tinyRobotSkillContext).toStrictEqual({
      version: 1,
      kind: 'load-result',
      source: 'auto',
    })

    const restored = sessionEngine(
      config,
      async (body) => {
        if (body.messages.at(-1)?.role !== 'tool') {
          return reply('', [requestTool('load_skills', { skillNames: ['A'] }, 'restored-load')])
        }
        expect(loadResults(body.messages)).toMatchObject([{ status: 'loaded' }, { status: 'already_loaded' }])
        return reply()
      },
      JSON.parse(JSON.stringify(original.getState().messages)),
    )
    await restored.sendMessage('continue')
  })

  it('keeps the preloaded body available when the restored session switches to model mode', async () => {
    const original = sessionEngine(optionsFor(), async () => reply())
    await original.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
    const restored = sessionEngine(
      optionsFor({ sessionId: undefined, explicitSkillLoading: 'model' }),
      async (body) => {
        expect(body.messages.find((message) => message.content === '@A')).toBeDefined()
        expect(loadResults(body.messages)).toMatchObject([{ name: 'A', status: 'loaded' }])
        return reply()
      },
      JSON.parse(JSON.stringify(original.getState().messages)),
    )
    await restored.sendMessage('continue')
  })

  const previousResult: SessionSkillLoadResult = {
    skills: [{ name: 'A', status: 'loaded', instructions: 'A instructions' }],
  }
  it.each<{ format: string; messages: ChatMessage[] }>([
    {
      format: 'standalone user message',
      messages: [{ role: 'user', content: 'first question' }, legacyExplicitSkillResult('chat', previousResult)],
    },
    {
      format: 'top-level preload metadata',
      messages: [
        {
          role: 'user',
          content: 'first question',
          metadata: {
            tinyRobotSkill: { requestedSkillNames: ['A'] },
            tinyRobotSkillPreload: { version: 1, sessionId: 'chat', result: previousResult },
          },
        },
      ],
    },
  ])('still reuses body content from legacy $format', async ({ messages }) => {
    const restored = sessionEngine(
      optionsFor({ sessionId: undefined, deduplication: 'context' }),
      async (body) => {
        expect(loadResults(body.messages)).toMatchObject([{ status: 'loaded' }, { status: 'already_loaded' }])
        return reply()
      },
      [...messages, { role: 'assistant', content: 'first answer' }],
    )
    await restored.send({
      role: 'user',
      content: '@A again',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    })
  })

  it('rejects a preloaded user message copied from another session even without its catalog', async () => {
    const original = sessionEngine(optionsFor(), async () => reply())
    await original.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
    const request = original.getState().messages.find((message) => message.content === '@A')!
    expect(() => sessionEngine(optionsFor({ sessionId: 'other' }), async () => reply(), [request])).toThrow(/session/i)
  })

  it('rejects valid protocol history from another session', async () => {
    const original = sessionEngine(optionsFor(), async () => reply())
    await original.sendMessage('hello')
    expect(() =>
      sessionEngine(optionsFor({ sessionId: 'other' }), async () => reply(), original.getState().messages),
    ).toThrow(/session/i)
  })
})
