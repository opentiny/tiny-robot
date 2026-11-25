import { describe, expect, it } from 'vitest'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { createVueMessageAdapter } from '../../message/adapters/vue'
import type { MessageRequestBody } from '../../message/types'
import { isSkillContextMessage } from '../session/protocol'
import { loadResults, optionsFor, reply, requestTool, sessionEngine } from './sessionTestUtils'

describe('session skill plugin', () => {
  it('discovers new candidates after an empty turn and keeps the first nonempty snapshot', async () => {
    let candidates: Array<{ name: string; description: string }> = []
    const catalogs: string[] = []
    const engine = sessionEngine(optionsFor({ getSkillCandidates: () => candidates }), async (body) => {
      catalogs.push(String(body.messages.find((message) => message.role === 'system')?.content ?? ''))
      return reply()
    })

    await engine.sendMessage('Before import')
    candidates = [{ name: 'A', description: 'A summary' }]
    await engine.sendMessage('After import')
    candidates = [{ name: 'B', description: 'B summary' }]
    await engine.sendMessage('After replacing candidates')

    expect(catalogs[0]).toBe('')
    expect(catalogs[1]).toContain('A summary')
    expect(catalogs[2]).toEqual(catalogs[1])
  })

  it('keeps the catalog and tools while loading A then B and preserves sent history', async () => {
    const requests: MessageRequestBody[] = []
    const engine = sessionEngine(optionsFor(), async (body) => {
      requests.push(structuredClone(body))
      if (requests.length === 1) return reply('', [requestTool('load_skills', { skillNames: ['A'] }, 'A')])
      if (requests.length === 2) return reply('', [requestTool('load_skills', { skillNames: ['B'] }, 'B')])
      return reply()
    })
    await engine.sendMessage('question')
    expect(requests[0].messages.map((message) => message.role)).toEqual(['system', 'user'])
    expect(requests[0].messages[0].content).toContain('A summary')
    expect(loadResults(requests[2].messages)).toMatchObject([
      { name: 'A', instructions: 'A instructions' },
      { name: 'B', instructions: 'B instructions' },
    ])
    expect(requests[2].messages.slice(0, requests[0].messages.length)).toEqual(requests[0].messages)
    expect(requests.map((body) => body.tools?.map((tool) => tool.type === 'function' && tool.function.name))).toEqual([
      ['load_skills', 'list_skill_files', 'read_skill_file'],
      ['load_skills', 'list_skill_files', 'read_skill_file'],
      ['load_skills', 'list_skill_files', 'read_skill_file'],
    ])
  })

  it.each([createNativeMessageAdapter, createVueMessageAdapter])(
    'stores a preload on the original user message and projects it only into model requests',
    async (createAdapter) => {
      let first = true
      const engine = sessionEngine(
        optionsFor(),
        async (body) => {
          if (first) {
            first = false
            expect(body.messages.map((message) => message.role)).toEqual(['system', 'user', 'user'])
            expect(loadResults(body.messages)).toMatchObject([
              { name: 'A', status: 'loaded', instructions: 'A instructions' },
            ])
            return reply('', [requestTool('load_skills', { skillNames: ['B'] })])
          }
          expect(loadResults(body.messages)).toMatchObject([
            { name: 'A', status: 'loaded', instructions: 'A instructions' },
            { name: 'B', status: 'loaded' },
          ])
          return reply()
        },
        [],
        {},
        createAdapter(),
      )
      const input = {
        role: 'user' as const,
        content: '@A question',
        metadata: { business: 'keep', tinyRobotSkill: { requestedSkillNames: ['A'] } },
      }
      await engine.send(input)
      expect(engine.getState().messages.filter((message) => message.role === 'user')).toEqual([
        {
          role: 'user',
          content: '@A question',
          metadata: {
            business: 'keep',
            tinyRobotSkill: {
              requestedSkillNames: ['A'],
              preload: {
                version: 1,
                sessionId: 'chat',
                result: { skills: [{ name: 'A', status: 'loaded', instructions: 'A instructions' }] },
              },
            },
          },
        },
      ])
      expect(input.metadata).toEqual({ business: 'keep', tinyRobotSkill: { requestedSkillNames: ['A'] } })
      expect(
        engine
          .getState()
          .messages.filter(isSkillContextMessage)
          .map((message) => message.role),
      ).toEqual(['system'])
      expect(loadResults(engine.getState().messages)).toMatchObject([{ name: 'B', status: 'loaded' }])
    },
  )

  it('allows direct answers and reports explicit failures alongside successful requests', async () => {
    const bodies: MessageRequestBody[] = []
    const engine = sessionEngine(optionsFor(), async (body) => {
      bodies.push(structuredClone(body))
      return reply()
    })
    await engine.sendMessage('@A quoted text')
    expect(bodies[0].messages.map((message) => message.role)).toEqual(['system', 'user'])
    await engine.send({
      role: 'user',
      content: '@A @missing',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A', 'missing'] } },
    })
    expect(loadResults(bodies[1].messages)).toMatchObject([
      { name: 'A', status: 'loaded' },
      { name: 'missing', status: 'failed', error: { code: 'skill_unavailable' } },
    ])
  })

  it('preloads mentions on each user message submitted in one batch', async () => {
    const engine = sessionEngine(optionsFor({ deduplication: 'context' }), async (body) => {
      expect(body.messages.map(({ role }) => role)).toEqual(['system', 'user', 'user', 'user', 'user'])
      expect(loadResults(body.messages)).toMatchObject([
        { name: 'A', status: 'loaded', instructions: 'A instructions' },
        { name: 'A', status: 'already_loaded' },
        { name: 'B', status: 'loaded', instructions: 'B instructions' },
      ])
      return reply()
    })
    await engine.send(
      { role: 'user', content: '@A first', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } },
      { role: 'user', content: '@A @B second', metadata: { tinyRobotSkill: { requestedSkillNames: ['A', 'B'] } } },
    )
    expect(
      engine
        .getState()
        .messages.filter(({ role }) => role === 'user')
        .map(({ content }) => content),
    ).toEqual(['@A first', '@A @B second'])
  })

  it('passes explicit skill names to the model and loads the body only through its tool call', async () => {
    const requests: MessageRequestBody[] = []
    const engine = sessionEngine(
      optionsFor({
        explicitSkillLoading: 'model',
        onBeforeRequest({ requestBody }) {
          requestBody.messages = requestBody.messages.map((message) =>
            message.role === 'user' ? { ...message, content: 'Rewritten question' } : message,
          )
        },
      }),
      async (body) => {
        requests.push(structuredClone(body))
        if (requests.length === 1) {
          expect(body.messages.map((message) => message.role)).toEqual(['system', 'user'])
          expect(body.messages[1].content).toBe('Rewritten question\n\nUser-requested Skills: ["A"].')
          return reply('', [requestTool('load_skills', { skillNames: ['A'] })])
        }
        expect(loadResults(body.messages)).toMatchObject([
          { name: 'A', status: 'loaded', instructions: 'A instructions' },
        ])
        return reply()
      },
    )
    const message = {
      role: 'user' as const,
      content: 'Question',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    }
    await engine.send(message)
    expect(engine.getState().messages.filter((item) => item.role === 'user')).toEqual([
      { ...message, content: 'Question' },
    ])
    expect(requests[1].messages.slice(0, 2)).toEqual(requests[0].messages)
  })

  it('keeps the multipart user content and restores the same request history in model mode', async () => {
    const message = {
      role: 'user' as const,
      content: [
        { type: 'text' as const, text: 'Describe this image' },
        { type: 'image_url' as const, image_url: { url: 'https://example.com/image.png' } },
      ],
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    }
    const first = sessionEngine(optionsFor({ explicitSkillLoading: 'model' }), async (body) => {
      expect(body.messages.at(-1)?.content).toEqual([
        ...message.content,
        { type: 'text', text: 'User-requested Skills: ["A"].' },
      ])
      return reply()
    })
    await first.send(message)
    const restored = sessionEngine(
      optionsFor({ explicitSkillLoading: 'model' }),
      async (body) => {
        expect(body.messages[1].content).toEqual([
          ...message.content,
          { type: 'text', text: 'User-requested Skills: ["A"].' },
        ])
        expect(body.messages.at(-1)?.content).toBe('Continue')
        return reply()
      },
      JSON.parse(JSON.stringify(first.getState().messages)),
    )
    await restored.sendMessage('Continue')
  })
})
