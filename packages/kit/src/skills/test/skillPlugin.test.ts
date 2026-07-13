import type { ChatCompletion } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { createMessageEngine } from '../../message/core/engine'
import { getSkillRequestContext, lengthPlugin, skillPlugin, thinkingPlugin, toolPlugin } from '../../message/plugins'
import type { CreateMessageEngineOptions, MessageRequestBody, ResponseProvider } from '../../message/types'
import { mockResponseProvider } from '../../message/test/mockResponseProvider'
import type { SkillDefinition } from '../types'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

const weatherSkill: SkillDefinition = {
  name: 'weather',
  description: 'Weather skill',
  instructions: 'Use wttr.in for weather requests.',
}

describe('skillPlugin', () => {
  it('uses manual skills for instructions and runtime tools', async () => {
    const vueSkill: SkillDefinition = {
      name: 'vue-best-practices',
      description: 'Vue skill',
      instructions: 'Follow Vue best practices.',
      resources: [
        {
          path: 'references/reactivity.md',
          kind: 'text',
          resourceId: 'references/reactivity.md',
          text: '# Reactivity',
          mimeType: 'text/markdown',
        },
      ],
    }
    const onInstructionsResolved = vi.fn()
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody: MessageRequestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(requestBody.messages[0]).toMatchObject({
          role: 'system',
          content: expect.stringContaining('Follow Vue best practices.'),
        })
        expect(requestBody.tools?.map((tool) => tool.function.name)).toContain('read_skill_file')

        return {
          id: 'tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'read_skill_file',
                      arguments: JSON.stringify({
                        skillName: 'vue-best-practices',
                        path: 'references/reactivity.md',
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(JSON.parse(requestBody.messages.at(-1)?.content as string)).toMatchObject({
        file: {
          skillName: 'vue-best-practices',
          path: 'references/reactivity.md',
          kind: 'text',
        },
        content: '# Reactivity',
      })

      return {
        id: 'final-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'manual',
            skillNames: [vueSkill.name],
          },
          onInstructionsResolved,
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            context.requestBody.messages = [
              { role: 'system', content: instructions.join('\n\n') },
              ...context.requestBody.messages,
            ]
          },
          getSkillByName: async (name) => (name === vueSkill.name ? vueSkill : undefined),
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => {
            throw new Error('fallback should not run')
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('read skill file')

    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(onInstructionsResolved).toHaveBeenCalledTimes(1)
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('calls onInstructionsResolved immediately without a request body', async () => {
    const events: string[] = []
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const engine = createTestMessageEngine({
      initialMessages: [
        {
          role: 'system',
          content: 'Existing system instructions.',
        },
      ],
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'manual',
            skillNames: [weatherSkill.name],
          },
          onInstructionsResolved: (skillContext, context) => {
            events.push('instructions')
            expect(skillContext.instructions).toEqual([expect.stringContaining('Use wttr.in for weather requests.')])
            expect(context).not.toHaveProperty('requestBody')
          },
          getSkillByName: async (name) => (name === weatherSkill.name ? weatherSkill : undefined),
        }),
      ],
      responseProvider: (...args) => {
        events.push('request')
        return responseProvider(...args)
      },
    })

    await engine.sendMessage('weather in London')

    expect(events).toEqual(['instructions', 'request'])
  })

  it('exposes request-scoped instructions without modifying messages when injection is omitted', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const engine = createTestMessageEngine({
      initialMessages: [{ role: 'system', content: 'Existing system instructions.' }],
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: { mode: 'manual', skills: [weatherSkill] },
          onBeforeRequest: (context) => {
            context.requestBody.skill_instructions = getSkillRequestContext(context)?.instructions ?? []
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('weather in London')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages).toEqual([
      { role: 'system', content: 'Existing system instructions.' },
      { role: 'user', content: 'weather in London' },
    ])
    expect(requestBody.skill_instructions).toEqual([expect.stringContaining('Use wttr.in for weather requests.')])
    expect(engine.getState().messages[0]).toEqual({
      role: 'system',
      content: 'Existing system instructions.',
    })
  })

  it('calls onInstructionsResolved once for manual selection', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const onInstructionsResolved = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: { mode: 'manual', skills: [weatherSkill] },
          onInstructionsResolved,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('weather in London')

    expect(onInstructionsResolved).toHaveBeenCalledTimes(1)
    expect(onInstructionsResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: [expect.stringContaining('Use wttr.in for weather requests.')],
      }),
      expect.not.objectContaining({ requestBody: expect.any(Object) }),
    )
  })

  it('continues when resolving a selected manual skill fails', async () => {
    const onSkillsResolved = vi.fn()
    const onInstructionsResolved = vi.fn()
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'manual',
            skillNames: ['broken-skill'],
          },
          getSkillByName: async () => {
            throw new Error('storage unavailable')
          },
          onSkillsResolved,
          onInstructionsResolved,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('hello')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages[0]).toMatchObject({ role: 'user', content: 'hello' })
    expect(onSkillsResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [],
        skillNames: [],
        requestedSkillNames: ['broken-skill'],
        unresolvedSkillNames: ['broken-skill'],
      }),
      expect.any(Object),
    )
    expect(onInstructionsResolved).toHaveBeenCalledTimes(1)
    expect(onInstructionsResolved).toHaveBeenCalledWith(
      expect.objectContaining({ instructions: [] }),
      expect.not.objectContaining({ requestBody: expect.any(Object) }),
    )
  })

  it('selects auto skills before injecting selected skill instructions', async () => {
    const instructionContents: string[] = []
    const getSkillByName = vi.fn(async (name: string) => (name === weatherSkill.name ? weatherSkill : undefined))
    const onSkillSelectionResolved = vi.fn()
    const onSkillsResolved = vi.fn()
    const onInstructionsResolved = vi.fn()
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody: MessageRequestBody) => {
      const hasSelectionResult = requestBody.messages.some(
        (message) => message.role === 'tool' && String(message.content).includes('requestedSkillNames'),
      )

      if (!hasSelectionResult) {
        expect(requestBody.messages[0]).toMatchObject({
          role: 'system',
          content: expect.stringContaining('Preferred skill names: weather'),
        })
        expect(String(requestBody.messages[0].content)).toContain('weather: Weather skill')
        expect(String(requestBody.messages[0].content)).not.toContain('Use wttr.in for weather requests.')
        expect(requestBody.tools?.map((tool) => tool.function.name)).toEqual(['select_skills'])

        return {
          id: 'select-skill',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'select_skills',
                      arguments: JSON.stringify({
                        skillNames: ['weather'],
                      }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(requestBody.messages[0]).toMatchObject({
        role: 'system',
        content: expect.stringContaining('Use wttr.in for weather requests.'),
      })
      expect(requestBody.tools).toBeUndefined()

      return {
        id: 'final-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'auto',
            preferredSkillNames: ['weather'],
          },
          onInstructionsResolved,
          getSkillCandidates: async () => [weatherSkill],
          getSkillByName,
          onSkillSelectionResolved,
          onSkillsResolved,
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            const content = instructions.join('\n\n')
            instructionContents.push(content ?? '')
            context.requestBody.messages = [{ role: 'system', content }, ...context.requestBody.messages]
          },
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => {
            throw new Error('fallback should not run')
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('weather in London')

    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(instructionContents).toHaveLength(2)
    expect(onInstructionsResolved).toHaveBeenCalledTimes(2)
    expect(instructionContents[0]).toContain('Preferred skill names: weather')
    expect(instructionContents[0]).not.toContain('Use wttr.in for weather requests.')
    expect(instructionContents[1]).toContain('Use wttr.in for weather requests.')
    expect(getSkillByName).toHaveBeenCalledWith('weather', expect.any(Object))
    expect(onSkillSelectionResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'auto',
        requestedSkillNames: ['weather'],
        preferredSkillNames: ['weather'],
      }),
      expect.any(Object),
    )
    expect(onSkillsResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [weatherSkill],
        skillNames: ['weather'],
        requestedSkillNames: ['weather'],
        unresolvedSkillNames: [],
        selection: expect.objectContaining({
          mode: 'auto',
          phase: 'ready',
        }),
      }),
      expect.any(Object),
    )
  })

  it('does not inject instructions or tools when selection is none', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))
    const onInstructionsResolved = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'none',
          },
          getSkillByName: async () => undefined,
          onInstructionsResolved,
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('hello')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages[0]).toMatchObject({ role: 'user', content: 'hello' })
    expect(requestBody.tools).toBeUndefined()
    expect(onInstructionsResolved).not.toHaveBeenCalled()
  })
})
