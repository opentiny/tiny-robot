import type { ChatCompletion } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../../message/adapters/native'
import { createMessageEngine } from '../../message/core/engine'
import {
  getSkillRequestContext,
  lengthPlugin,
  skillPlugin,
  thinkingPlugin,
  TOOL_RESUME_COMMAND,
  toolPlugin,
} from '../../message/plugins'
import type { SkillPluginOptions, SkillSelection } from '../../message/plugins'
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

const skillPluginOptionTypeChecks = [
  { selection: { mode: 'none' } } satisfies SkillPluginOptions,
  { selection: { mode: 'manual', skills: [weatherSkill] } } satisfies SkillPluginOptions,
  {
    selection: { mode: 'manual', skillNames: ['weather'] },
    getSkillByName: async () => weatherSkill,
  } satisfies SkillPluginOptions,
  {
    selection: { mode: 'auto' },
    getSkillCandidates: async () => [weatherSkill],
    getSkillByName: async () => weatherSkill,
  } satisfies SkillPluginOptions,
  {
    selection: async (): Promise<SkillSelection> => ({ mode: 'none' }),
    getSkillCandidates: async () => [weatherSkill],
    getSkillByName: async () => weatherSkill,
  } satisfies SkillPluginOptions,
]

describe('skillPlugin', () => {
  it('accepts selection-specific default option types', () => {
    expect(skillPluginOptionTypeChecks).toHaveLength(5)
  })

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

  it('rebuilds skill runtime tools before resuming a persisted turn', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let shouldPause = true
    const callTool = vi.fn(async () => 'fallback should not run')
    const skill: SkillDefinition = {
      name: 'docs',
      description: 'Docs skill',
      instructions: 'Use docs.',
      resources: [
        {
          path: 'guide.md',
          kind: 'text',
          resourceId: 'guide.md',
          readText: async () => '# Rebuilt guide',
        },
      ],
    }
    const getSkillByName = vi.fn(async (name: string) => (name === skill.name ? skill : undefined))
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody: MessageRequestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'persisted-skill-tool-call',
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
                    id: 'call-rebuild-skill',
                    type: 'function',
                    function: {
                      name: 'read_skill_file',
                      arguments: JSON.stringify({ skillName: 'docs', path: 'guide.md' }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(String(requestBody.messages.at(-1)?.content)).toContain('Rebuilt guide')
      return {
        id: 'persisted-skill-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'rebuild done',
            },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const createEngine = (initialMessages: CreateMessageEngineOptions['initialMessages'] = []) =>
      createTestMessageEngine({
        initialMessages,
        plugins: [
          ...silentDefaultPlugins,
          skillPlugin({
            selection: { mode: 'manual', skillNames: [skill.name] },
            getSkillByName,
          }),
          toolPlugin({
            getTools: async () => [],
            callTool,
            shouldPauseToolCall() {
              return shouldPause
            },
          }),
        ],
        responseProvider,
      })

    try {
      const firstEngine = createEngine()
      await firstEngine.sendMessage('read docs')

      expect(firstEngine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
      const snapshot = JSON.parse(values.get('__tiny-robot-turn') ?? '{}')
      expect(snapshot.turns[0].customContext.__tiny_robot_skill).not.toHaveProperty('runtimeTools')

      shouldPause = false
      const restoredEngine = createEngine(firstEngine.getState().messages)

      await expect(
        restoredEngine.dispatchCommand(TOOL_RESUME_COMMAND, {
          toolCallId: 'call-rebuild-skill',
        }),
      ).resolves.toEqual({
        status: 'resumed',
        toolCallId: 'call-rebuild-skill',
      })

      expect(callTool).not.toHaveBeenCalled()
      expect(getSkillByName).toHaveBeenCalledTimes(2)
      expect(restoredEngine.getState().messages.at(-1)).toMatchObject({
        role: 'assistant',
        content: 'rebuild done',
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('rebuilds skill runtime tools when the turn snapshot is unavailable', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let shouldPause = true
    const skill: SkillDefinition = {
      name: 'docs',
      description: 'Docs skill',
      instructions: 'Use docs.',
      resources: [
        {
          path: 'guide.md',
          kind: 'text',
          resourceId: 'guide.md',
          text: '# Rebuilt without snapshot',
        },
      ],
    }
    const getSkillByName = vi.fn(async (name: string) => (name === skill.name ? skill : undefined))
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody: MessageRequestBody) => {
      if (!requestBody.messages.some((message) => message.role === 'tool')) {
        return {
          id: 'missing-snapshot-tool-call',
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
                    id: 'call-missing-snapshot',
                    type: 'function',
                    function: {
                      name: 'read_skill_file',
                      arguments: JSON.stringify({ skillName: 'docs', path: 'guide.md' }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(String(requestBody.messages.at(-1)?.content)).toContain('Rebuilt without snapshot')
      return {
        id: 'missing-snapshot-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'rebuild done' },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const createEngine = (initialMessages: CreateMessageEngineOptions['initialMessages'] = []) =>
      createTestMessageEngine({
        initialMessages,
        plugins: [
          ...silentDefaultPlugins,
          skillPlugin({
            selection: { mode: 'manual', skillNames: [skill.name] },
            getSkillByName,
          }),
          toolPlugin({
            getTools: async () => [],
            callTool: async () => {
              throw new Error('runtime skill tool was not rebuilt')
            },
            shouldPauseToolCall() {
              return shouldPause
            },
          }),
        ],
        responseProvider,
      })

    try {
      const firstEngine = createEngine()
      await firstEngine.sendMessage('read docs')
      const messages = firstEngine.getState().messages
      values.delete('__tiny-robot-turn')

      shouldPause = false
      const restoredEngine = createEngine(messages)
      await expect(
        restoredEngine.dispatchCommand(TOOL_RESUME_COMMAND, {
          toolCallId: 'call-missing-snapshot',
        }),
      ).resolves.toMatchObject({ status: 'resumed' })

      expect(getSkillByName).toHaveBeenCalledTimes(2)
      expect(restoredEngine.getState().messages.at(-1)).toMatchObject({
        role: 'assistant',
        content: 'rebuild done',
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('rebuilds resource handlers from pending tool arguments when the skill context is missing', async () => {
    const skill: SkillDefinition = {
      name: 'docs',
      description: 'Docs skill',
      instructions: 'Use docs.',
      resources: [
        {
          path: 'guide.md',
          kind: 'text',
          resourceId: 'guide.md',
          text: '# Rebuilt from pending tool call',
        },
      ],
    }
    const getSkillByName = vi.fn(async (name: string) => (name === skill.name ? skill : undefined))
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody: MessageRequestBody) => {
      expect(String(requestBody.messages.at(-1)?.content)).toContain('Rebuilt from pending tool call')
      return {
        id: 'pending-skill-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'rebuild done' },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      initialMessages: [
        { role: 'user', content: 'read docs' },
        {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: 'call-pending-context',
              type: 'function',
              function: {
                name: 'read_skill_file',
                arguments: JSON.stringify({ skillName: 'docs', path: 'guide.md' }),
              },
            },
          ],
          state: {
            toolCall: {
              'call-pending-context': { status: 'awaiting-approval' },
            },
          },
        },
        {
          role: 'tool',
          tool_call_id: 'call-pending-context',
          content: 'Tool call awaiting confirmation.',
        },
      ],
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: { mode: 'none' },
          getSkillByName,
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => {
            throw new Error('runtime skill tool was not rebuilt')
          },
        }),
      ],
      responseProvider,
    })

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-pending-context',
      }),
    ).resolves.toMatchObject({ status: 'resumed' })

    expect(getSkillByName).toHaveBeenCalledOnce()
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'rebuild done',
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

  it('rejects mismatched resolver results and deduplicates enabled skills', async () => {
    const onSkillsResolved = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'manual',
            skillNames: ['weather', 'weather-alias'],
          },
          getSkillByName: async () => weatherSkill,
          onSkillsResolved,
        }),
      ],
      responseProvider: mockResponseProvider('ok'),
    })

    await engine.sendMessage('weather in London')

    expect(onSkillsResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [weatherSkill],
        skillNames: ['weather'],
        requestedSkillNames: ['weather', 'weather-alias'],
        unresolvedSkillNames: ['weather-alias'],
      }),
      expect.any(Object),
    )
  })

  it('deduplicates inline manual skills by name', async () => {
    const onSkillsResolved = vi.fn()
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: {
            mode: 'manual',
            skills: [weatherSkill, weatherSkill],
          },
          onSkillsResolved,
        }),
      ],
      responseProvider: mockResponseProvider('ok'),
    })

    await engine.sendMessage('weather in London')

    expect(onSkillsResolved).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: [weatherSkill],
        skillNames: ['weather'],
      }),
      expect.any(Object),
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

  it('fails before requesting when auto mode is missing toolPlugin', async () => {
    const responseProvider = vi.fn(mockResponseProvider('unexpected'))
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        skillPlugin({
          selection: { mode: 'auto' },
          getSkillCandidates: async () => [weatherSkill],
          getSkillByName: async () => weatherSkill,
        }),
      ],
      responseProvider,
    })

    await expect(engine.sendMessage('weather in London')).rejects.toThrow(
      'skillPlugin auto mode requires an enabled toolPlugin',
    )
    expect(responseProvider).not.toHaveBeenCalled()
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
