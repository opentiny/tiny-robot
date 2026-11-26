import { describe, expect, it, vi } from 'vitest'
import { skillPlugin, toolPlugin, useMessage } from '../../index'
import { isSkillContextMessage } from '../../skills/session/protocol'
import { loadResults } from '../../skills/test/sessionTestUtils'
import { mockSequentialResponseProvider } from './mockResponseProvider'
import type { MessageRequestBody } from './types'

describe('vue session skill entrypoint', () => {
  it.each(['preload', 'model'] as const)(
    'keeps %s request history stable while the Skill plugin is disabled',
    async (explicitSkillLoading) => {
      let disabled = false
      const onBeforeRequest = vi.fn()
      const requests: MessageRequestBody[] = []
      const chat = useMessage({
        requestMessageFieldsExclude: ['loading', 'state'],
        plugins: [
          toolPlugin({ getTools: () => [], callTool: () => 'unknown' }),
          skillPlugin({
            scope: 'session',
            explicitSkillLoading,
            disabled: () => disabled,
            getSkillCandidates: () => [{ name: 'A', description: 'A summary' }],
            getSkillByName: (name) => ({ name, description: `${name} summary`, instructions: `${name} instructions` }),
            onBeforeRequest,
          }),
        ],
        responseProvider: mockSequentialResponseProvider(
          ['first answer', 'second answer', 'third answer'].map((content) => ({
            content,
            onRequest(body) {
              requests.push(JSON.parse(JSON.stringify(body)))
            },
          })),
        ),
      })

      await chat.send({ role: 'user', content: '@A q1', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
      disabled = true
      await chat.send({ role: 'user', content: '@B q2', metadata: { tinyRobotSkill: { requestedSkillNames: ['B'] } } })
      disabled = false
      await chat.sendMessage('q3')

      const [first, second, third] = requests
      expect(first.messages.at(-1)).toMatchObject({
        role: 'user',
        content: expect.stringContaining(
          explicitSkillLoading === 'preload' ? 'A instructions' : 'User-requested Skills: ["A"].',
        ),
      })
      expect(first.messages.at(-1)?.metadata).toEqual({ tinyRobotSkill: { requestedSkillNames: ['A'] } })
      expect(second.messages.at(-1)?.content).toBe(
        explicitSkillLoading === 'preload' ? '@B q2' : '@B q2\n\nUser-requested Skills: ["B"].',
      )
      expect(second.tools ?? []).toEqual([])
      expect(second.messages.slice(0, first.messages.length)).toEqual(first.messages)
      expect(third.messages.slice(0, second.messages.length)).toEqual(second.messages)
      expect(onBeforeRequest).toHaveBeenCalledTimes(2)
    },
  )

  it('supports model-loaded mentions without adding a user bubble', async () => {
    const chat = useMessage({
      plugins: [
        toolPlugin({ getTools: () => [], callTool: () => 'unknown' }),
        skillPlugin({
          scope: 'session',
          sessionId: 'vue-chat',
          explicitSkillLoading: 'model',
          getSkillCandidates: () => [{ name: 'A', description: 'A summary' }],
          getSkillByName: () => ({ name: 'A', description: 'A summary', instructions: 'A instructions' }),
        }),
      ],
      responseProvider: mockSequentialResponseProvider([
        {
          content: 'direct answer',
          onRequest: (body) => {
            expect(body.messages.filter((message) => message.role === 'user')).toMatchObject([
              { content: '@A\n\nUser-requested Skills: ["A"].' },
            ])
          },
        },
      ]),
    })
    const message = {
      role: 'user' as const,
      content: '@A',
      metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
    }
    await chat.send(message)
    expect(chat.messages.value.filter((item) => item.role === 'user')).toEqual([message])
  })

  it.each(['cleared', 'catalog removed'] as const)(
    'rebuilds the discovery catalog after history is %s',
    async (change) => {
      const chat = useMessage({
        plugins: [
          toolPlugin({ getTools: () => [], callTool: () => 'unknown' }),
          skillPlugin({
            scope: 'session',
            sessionId: 'vue-chat',
            getSkillCandidates: () => [{ name: 'A', description: 'A summary' }],
            getSkillByName: () => ({ name: 'A', description: 'A summary', instructions: 'A instructions' }),
          }),
        ],
        responseProvider: mockSequentialResponseProvider([
          { content: 'first answer' },
          {
            content: 'second answer',
            onRequest: (body) => {
              expect(body.messages.filter((message) => message.role === 'system')).toMatchObject([
                { content: expect.stringContaining('A summary') },
              ])
              expect(body.messages.at(-1)).toMatchObject({ role: 'user', content: 'next question' })
            },
          },
        ]),
      })
      await chat.sendMessage('first question')
      const previousCatalog = chat.messages.value.find(isSkillContextMessage)
      chat.messages.value =
        change === 'cleared' ? [] : chat.messages.value.filter((message) => !isSkillContextMessage(message))
      await chat.sendMessage('next question')
      expect(chat.messages.value.at(-1)?.content).toBe('second answer')
      expect(previousCatalog?.content).toContain('A summary')
    },
  )

  it.each(['none', 'context'] as const)(
    'loads explicit skills and restores mode %s through the public entrypoint',
    async (deduplication) => {
      const config = {
        scope: 'session' as const,
        deduplication,
        getSkillCandidates: () => [{ name: 'A', description: 'summary' }],
        getSkillByName: () => ({ name: 'A', description: 'summary', instructions: 'A instructions' }),
      }
      const plugins = () => [toolPlugin({ getTools: () => [], callTool: () => 'unknown' }), skillPlugin(config)]
      const chat = useMessage({
        plugins: plugins(),
        requestMessageFieldsExclude: ['state', 'loading'],
        responseProvider: mockSequentialResponseProvider([
          {
            content: 'done',
            onRequest: (body) => {
              expect(body.messages.map((message) => message.role)).toEqual(['system', 'user'])
              expect(body.messages[1].content).toEqual(expect.stringContaining('A instructions'))
              expect(body.messages[1].metadata).toEqual({ tinyRobotSkill: { requestedSkillNames: ['A'] } })
            },
          },
        ]),
      })
      await chat.send({ role: 'user', content: '@A', metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } } })
      const users = chat.messages.value.filter((message) => message.role === 'user')
      expect(users.map(({ content }) => content)).toEqual(['@A'])
      expect(users[0].metadata).toStrictEqual({
        tinyRobotSkill: {
          requestedSkillNames: ['A'],
          preload: {
            version: 1,
            result: { skills: [{ name: 'A', status: 'loaded', instructions: 'A instructions' }] },
          },
        },
      })
      expect(chat.messages.value.find(isSkillContextMessage)?.metadata).toStrictEqual({
        tinyRobotSkillContext: { version: 1, kind: 'catalog', candidates: [{ name: 'A', description: 'summary' }] },
      })
      const restored = useMessage({
        initialMessages: JSON.parse(JSON.stringify(chat.messages.value)),
        plugins: plugins(),
        responseProvider: mockSequentialResponseProvider([
          {
            content: 'restored',
            onRequest: (body) => {
              expect(loadResults(body.messages.slice(-1))).toMatchObject([
                { status: deduplication === 'none' ? 'loaded' : 'already_loaded' },
              ])
              expect(body.messages.filter((message) => message.role === 'system')).toHaveLength(1)
            },
          },
        ]),
      })
      await restored.send({
        role: 'user',
        content: '@A again',
        metadata: { tinyRobotSkill: { requestedSkillNames: ['A'] } },
      })
      expect(restored.messages.value.at(-1)?.content).toBe('restored')
    },
  )
})
