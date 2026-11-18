import { describe, expect, it, vi } from 'vitest'
import { ref, watch } from 'vue'
import type { SkillDefinition } from '../../skills/types'
import type { ChatMessage } from '../../types'
import { mockResponseProvider, mockSequentialResponseProvider } from './mockResponseProvider'
import { lengthPlugin } from './plugins/lengthPlugin'
import { getSkillRequestContext, skillPlugin } from './plugins/skillPlugin'
import { TOOL_RESUME_COMMAND, toolPlugin } from './plugins/toolPlugin'
import type { ResponseProvider } from './types'
import { useMessage } from './useMessage'

describe('useMessage', () => {
  it('reruns the latest user message in place and starts a fresh turn lifecycle', async () => {
    const lifecycle: string[] = []
    const responseProvider = vi.fn(
      mockSequentialResponseProvider([
        { content: 'first answer' },
        { content: 'second answer' },
        { content: 'new answer' },
      ]),
    )
    const engine = useMessage({
      responseProvider,
      plugins: [
        {
          name: 'rerun-lifecycle',
          onTurnStart({ currentTurn }) {
            lifecycle.push(`start:${currentTurn[0]?.content}`)
          },
          onFinally({ currentTurn, requestState }) {
            lifecycle.push(`finally:${currentTurn[0]?.content}:${requestState}`)
          },
        },
      ],
    })

    await engine.sendMessage('first question')
    const originalUser = engine.messages.value[0]!
    await engine.sendMessage('second question')
    const before = [...engine.messages.value]

    await expect(engine.rerun({ role: 'user', content: 'stale target' })).resolves.toBe(false)
    await expect(engine.rerun(originalUser)).resolves.toBe(false)
    await expect(engine.rerun(before[2]!)).resolves.toBe(true)

    expect(responseProvider).toHaveBeenCalledTimes(3)
    expect(engine.messages.value[2]).toBe(before[2])
    expect(engine.messages.value.slice(3).map(({ role, content }) => ({ role, content }))).toEqual([
      { role: 'assistant', content: 'new answer' },
    ])
    expect(lifecycle.slice(-2)).toEqual(['start:second question', 'finally:second question:completed'])
    expect(engine.requestState.value).toBe('completed')
  })

  it('reserves replay before synchronous transcript observers can send', async () => {
    const provider = vi.fn(mockResponseProvider('answer'))
    const engine = useMessage({ responseProvider: provider })
    await engine.sendMessage('question')
    let pending: Promise<void> | undefined
    const stop = watch(
      () => engine.messages.value.length,
      (length) => {
        if (length === 1) pending = engine.sendMessage('interleaved')
      },
      { flush: 'sync' },
    )
    await expect(engine.rerun(engine.messages.value[0]!)).resolves.toBe(true)
    await pending
    stop()
    expect(provider).toHaveBeenCalledTimes(2)
    expect(engine.messages.value.map((message) => message.content)).toEqual(['question', 'answer'])
  })

  it('ignores a delayed after-request append after another hook fails', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const engine = useMessage({
      responseProvider: mockResponseProvider('answer'),
      plugins: [
        {
          async onAfterRequest() {
            throw new Error('hook failed')
          },
        },
        {
          async onAfterRequest({ appendMessage, requestNext }) {
            await gate
            appendMessage({ role: 'tool', content: 'stale result' })
            requestNext()
          },
        },
      ],
    })
    await expect(engine.sendMessage('question')).rejects.toThrow('hook failed')
    const snapshot = JSON.stringify(engine.messages.value)
    release()
    await gate
    await Promise.resolve()
    expect(JSON.stringify(engine.messages.value)).toBe(snapshot)
  })

  it('does not publish completion time when end hooks fail', async () => {
    const engine = useMessage({
      responseProvider: mockResponseProvider('answer'),
      plugins: [
        {
          onTurnEnd() {
            throw new Error('end failed')
          },
        },
      ],
    })
    await expect(engine.sendMessage('question')).rejects.toThrow('end failed')
    expect(engine.requestState.value).toBe('error')
    expect(engine.messages.value.at(-1)?.metadata?.completedAt).toBeUndefined()
  })

  it.each([true, false])('merges usage and notifies plugins with a choice: %s', async (withChoice) => {
    const onChunk = vi.fn()
    const engine = useMessage({
      responseProvider: async () => ({
        id: 'usage',
        object: 'chat.completion',
        created: 1,
        model: 'test',
        system_fingerprint: null,
        choices: withChoice
          ? [
              {
                index: 0,
                message: { role: 'assistant', content: 'answer' },
                delta: undefined,
                logprobs: null,
                finish_reason: 'stop',
              },
            ]
          : [],
        usage: { prompt_tokens: 0, completion_tokens: 2, total_tokens: 2 },
      }),
      onCompletionChunk({ currentMessage }) {
        currentMessage.content = 'custom'
      },
      plugins: [{ onCompletionChunk: onChunk }],
    })
    await engine.sendMessage('question')
    expect(engine.messages.value.at(-1)?.metadata?.usage).toEqual({
      prompt_tokens: 0,
      completion_tokens: 2,
      total_tokens: 2,
    })
    expect(onChunk).toHaveBeenCalledOnce()
    if (withChoice) expect(engine.messages.value.at(-1)?.content).toBe('custom')
    else expect(onChunk.mock.calls[0]![0].choice).toBeUndefined()
  })

  it('replays the real user turn after automatic continuation', async () => {
    const provider = vi.fn(
      mockSequentialResponseProvider([
        { content: 'partial', finish_reason: 'length' },
        { content: 'continued' },
        { content: 'regenerated' },
      ]),
    )
    const engine = useMessage({ responseProvider: provider })
    await engine.sendMessage('question')
    expect(engine.messages.value).toHaveLength(4)
    await expect(engine.rerun(engine.messages.value[2]!)).resolves.toBe(false)
    await expect(engine.rerun(engine.messages.value[0]!)).resolves.toBe(true)
    expect(provider).toHaveBeenCalledTimes(3)
    expect(engine.messages.value.map((message) => message.content)).toEqual(['question', 'regenerated'])
  })

  it('uses the core vue adapter while keeping the original return shape', async () => {
    const engine = useMessage({
      initialMessages: [{ role: 'system', content: 'hello' }],
      responseProvider: mockResponseProvider(['foo', 'bar']),
    })

    expect(engine.requestState.value).toBe('idle')
    expect(engine.processingState.value).toBeUndefined()
    expect(engine.messages.value).toHaveLength(1)
    expect(engine.isProcessing.value).toBe(false)
    expect(typeof engine.sendMessage).toBe('function')
    expect(typeof engine.abortRequest).toBe('function')

    await engine.sendMessage('ping')

    expect(engine.requestState.value).toBe('completed')
    expect(engine.messages.value).toHaveLength(3)
    expect(engine.messages.value[1]).toMatchObject({ role: 'user', content: 'ping' })
    expect(engine.messages.value[2]).toMatchObject({ role: 'assistant', content: 'foobar', loading: undefined })
  })

  it('exposes updateCurrentMessage to Vue plugins and notifies message watchers', async () => {
    const updateSnapshots: unknown[] = []
    const onChunk = vi.fn<NonNullable<UseMessagePlugin['onCompletionChunk']>>(({ updateCurrentMessage }) => {
      updateCurrentMessage((message) => {
        message.metadata = { ...message.metadata, pluginUpdated: true }
      })
    })
    const engine = useMessage({
      responseProvider: mockResponseProvider('assistant reply'),
      plugins: [
        {
          onCompletionChunk: onChunk,
        },
      ],
    })
    watch(
      () => engine.messages.value.at(-1)?.metadata?.pluginUpdated,
      (value) => updateSnapshots.push(value),
      { flush: 'sync' },
    )

    await engine.sendMessage('hello')

    const context = onChunk.mock.calls[0]![0]
    expect(context.currentTurn[0]).toBe(engine.messages.value[0])
    expect(context.currentMessage).toBe(engine.messages.value[1])
    expect(engine.messages.value.at(-1)?.metadata?.pluginUpdated).toBe(true)
    expect(updateSnapshots).toEqual([true])
  })

  it('keeps responseProvider as a writable ref', async () => {
    const engine = useMessage({
      responseProvider: mockResponseProvider('first'),
    })

    engine.responseProvider.value = mockResponseProvider('second')
    await engine.sendMessage('ping')

    expect(engine.messages.value[1]).toMatchObject({ role: 'assistant', content: 'second' })
  })

  it('uses vue lengthPlugin to continue when finish_reason is length', async () => {
    const continueContent = 'Continue please.'
    let requestCount = 0

    const responseProvider = mockSequentialResponseProvider([
      {
        content: 'partial answer',
        finish_reason: 'length',
        onRequest() {
          requestCount += 1
        },
      },
      {
        content: 'final answer',
        onRequest(requestBody) {
          requestCount += 1
          expect(requestBody.messages.at(-1)).toMatchObject({
            role: 'user',
            content: continueContent,
          })
        },
      },
    ])

    const engine = useMessage({
      responseProvider,
      plugins: [lengthPlugin({ continueContent })],
    })

    await engine.sendMessage('ping')

    expect(requestCount).toBe(2)
    expect(engine.messages.value).toHaveLength(4)
    expect(engine.messages.value[0]).toMatchObject({ role: 'user', content: 'ping' })
    expect(engine.messages.value[1]).toMatchObject({ role: 'assistant', content: 'partial answer' })
    expect(engine.messages.value[2]).toMatchObject({ role: 'user', content: continueContent })
    expect(engine.messages.value[3]).toMatchObject({ role: 'assistant', content: 'final answer' })
  })

  it('lets vue toolPlugin callbacks mutate reactive messages while core handles tool flow', async () => {
    let capturedAssistantMessage: Record<string, unknown> | undefined
    let capturedMessages: ChatMessage[] | undefined

    const responseProvider: ResponseProvider = async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          system_fingerprint: null,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    index: 0,
                    id: 'call-1',
                    type: 'function',
                    function: {
                      name: 'lookup',
                      arguments: '{}',
                    },
                  },
                ],
              },
              delta: undefined,
              logprobs: null,
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      return {
        id: 'tool-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }

    const engine = useMessage({
      responseProvider,
      plugins: [
        toolPlugin({
          async getTools() {
            return [
              {
                type: 'function',
                function: {
                  name: 'lookup',
                },
              },
            ]
          },
          async beforeCallTools(_toolCalls, context) {
            capturedAssistantMessage = context.assistantMessage
            capturedMessages = context.messages
            context.assistantMessage.state = { fromVueWrapper: true }
          },
          async *callTool(_toolCall, context) {
            expect(context.messages[context.messages.length - 1].role).toBe('tool')
            expect(context.assistantMessage).toBe(capturedAssistantMessage)
            expect(context.currentMessage).toBe(capturedAssistantMessage)

            context.messages[context.messages.length - 1].content = 'prefix '
            yield 'result'
          },
        }),
      ],
    })

    await engine.sendMessage('ping')

    expect(Array.isArray(capturedMessages)).toBe(true)
    expect(capturedMessages?.[1]).toBe(capturedAssistantMessage)
    expect(capturedMessages?.some((message) => message.role === 'tool')).toBe(true)
    expect(capturedAssistantMessage).toBe(engine.messages.value[1])
    expect(engine.messages.value).toHaveLength(4)
    expect(engine.messages.value[1]).toMatchObject({
      role: 'assistant',
      state: { fromVueWrapper: true, toolCall: { 'call-1': { status: 'success' } } },
    })
    expect(engine.messages.value[2]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-1',
      content: 'prefix result',
    })
    expect(engine.messages.value[3]).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('adapts onLimitExceeded to the reactive vue message context', async () => {
    const onLimitExceeded = vi.fn((_toolCalls, context) => {
      context.assistantMessage.state = {
        ...context.assistantMessage.state,
        fromLimitCallback: true,
      }
    })
    const responseProvider = mockSequentialResponseProvider([
      {
        finish_reason: 'tool_calls',
        tool_calls: [
          {
            index: 0,
            id: 'call-limited',
            type: 'function',
            function: {
              name: 'lookup',
              arguments: '{}',
            },
          },
        ],
      },
      {
        content: 'done without tools',
        onRequest(requestBody) {
          expect(requestBody).toMatchObject({
            tools: [],
            tool_choice: 'none',
          })
        },
      },
    ])
    const engine = useMessage({
      responseProvider,
      plugins: [
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          callTool: async () => 'unexpected',
          onLimitExceeded,
        }),
      ],
    })

    await engine.sendMessage('finish without tools')

    const limitedAssistantMessage = engine.messages.value.find((message) =>
      message.tool_calls?.some((toolCall) => toolCall.id === 'call-limited'),
    )
    expect(onLimitExceeded).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'call-limited' })],
      expect.objectContaining({
        assistantMessage: limitedAssistantMessage,
        currentMessage: limitedAssistantMessage,
        toolRoundCount: 1,
        maxToolRounds: 0,
      }),
    )
    expect(limitedAssistantMessage).toMatchObject({
      role: 'assistant',
      state: {
        fromLimitCallback: true,
        toolCall: {
          'call-limited': { status: 'cancelled' },
        },
      },
    })
  })

  it('exposes paused tool calls and resumes them through the vue command channel', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    const onTurnResume = vi.fn()
    const callTool = vi.fn(async () => {
      expect(onTurnResume).toHaveBeenCalledOnce()
      return 'approved result'
    })
    const responseProvider: ResponseProvider = async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          system_fingerprint: null,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    index: 0,
                    id: 'call-approval',
                    type: 'function',
                    function: {
                      name: 'sensitive_lookup',
                      arguments: '{}',
                    },
                  },
                ],
              },
              delta: undefined,
              logprobs: null,
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      return {
        id: 'tool-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'done',
            },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }

    const engine = useMessage({
      responseProvider,
      plugins: [
        { onTurnResume },
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'sensitive_lookup',
              },
            },
          ],
          callTool,
          shouldPauseToolCall() {
            markPaused()
            return true
          },
        }),
      ],
    })

    const turn = engine.sendMessage('run sensitive lookup')
    await paused
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(engine.isPaused.value).toBe(true)
    expect(engine.processingState.value).toBeUndefined()
    expect(callTool).not.toHaveBeenCalled()

    await engine.dispatchCommand(TOOL_RESUME_COMMAND, {
      toolCallId: 'call-approval',
    })
    await turn

    expect(callTool).toHaveBeenCalledOnce()
    expect(onTurnResume).toHaveBeenCalledOnce()
    expect(engine.isPaused.value).toBe(false)
    expect(engine.messages.value.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('restores a persisted paused turn with reactive messages after recreating useMessage', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let shouldPause = true
    const callTool = vi.fn(async () => 'vue restored result')
    const responseProvider: ResponseProvider = async (requestBody) => {
      if (!requestBody.messages.some((message) => message.role === 'tool')) {
        return {
          id: 'vue-persisted-tool-call',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          system_fingerprint: null,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                  {
                    index: 0,
                    id: 'call-vue-persisted',
                    type: 'function',
                    function: {
                      name: 'vue_persisted_lookup',
                      arguments: '{}',
                    },
                  },
                ],
              },
              delta: undefined,
              logprobs: null,
              finish_reason: 'tool_calls',
            },
          ],
        }
      }

      return {
        id: 'vue-persisted-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'vue restored done',
            },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      }
    }

    const createEngine = (initialMessages: ChatMessage[] = []) =>
      useMessage({
        initialMessages,
        responseProvider,
        plugins: [
          toolPlugin({
            getTools: async () => [
              {
                type: 'function',
                function: { name: 'vue_persisted_lookup' },
              },
            ],
            callTool,
            shouldPauseToolCall() {
              return shouldPause
            },
          }),
        ],
      })

    try {
      const firstEngine = createEngine()
      await firstEngine.sendMessage('persist vue turn')

      shouldPause = false
      const persistedMessages = JSON.parse(JSON.stringify(firstEngine.messages.value)) as ChatMessage[]
      const restoredEngine = createEngine(persistedMessages)
      expect(restoredEngine.isPaused.value).toBe(true)
      expect(restoredEngine.messages.value).toHaveLength(3)

      await restoredEngine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-vue-persisted',
      })

      expect(callTool).toHaveBeenCalledOnce()
      expect(restoredEngine.isPaused.value).toBe(false)
      expect(restoredEngine.messages.value[1]).toMatchObject({
        state: { toolCall: { 'call-vue-persisted': { status: 'success' } } },
      })
      expect(restoredEngine.messages.value[2]).toMatchObject({
        role: 'tool',
        tool_call_id: 'call-vue-persisted',
        content: 'vue restored result',
      })
      expect(restoredEngine.messages.value.at(-1)).toMatchObject({
        role: 'assistant',
        content: 'vue restored done',
      })
      expect(values.has('__tiny-robot-turn')).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('does not inject vue skill instructions by default', async () => {
    const skills = ref<SkillDefinition[]>([
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs references.',
        resources: [
          {
            path: 'guide.md',
            kind: 'text',
            resourceId: 'guide.md',
            text: '# Guide',
          },
        ],
      },
    ])
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({ skills }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
    })

    await engine.sendMessage('read docs')

    const requestBody = responseProvider.mock.calls[0]?.[0]
    expect(requestBody.messages).toEqual([expect.objectContaining({ role: 'user', content: 'read docs' })])
    expect(requestBody.tools?.map((tool) => tool.function.name)).toEqual(['list_skill_files', 'read_skill_file'])
  })

  it('calls vue onInstructionsResolved immediately without a request body', async () => {
    const events: string[] = []
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = useMessage({
      responseProvider: (...args) => {
        events.push('request')
        return responseProvider(...args)
      },
      plugins: [
        skillPlugin({
          skills: [
            {
              name: 'docs',
              description: 'Docs skill',
              instructions: 'Use docs references.',
            },
          ],
          onInstructionsResolved: (skillContext, context) => {
            events.push('instructions')
            expect(skillContext.instructions).toEqual([expect.stringContaining('Use docs references.')])
            expect(context).not.toHaveProperty('requestBody')
          },
        }),
      ],
    })

    await engine.sendMessage('read docs')

    expect(events).toEqual(['instructions', 'request'])
  })

  it('uses reactive manual vue skillPlugin skillNames', async () => {
    const mode = ref<'manual'>('manual')
    const skillNames = ref(['stale'])
    const skills: SkillDefinition[] = [
      {
        name: 'docs',
        description: 'Docs skill',
        instructions: 'Use docs references.',
      },
    ]
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          mode,
          skillNames,
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            context.requestBody.messages.unshift({
              role: 'system',
              content: instructions.join('\n\n'),
            })
          },
          getSkillByName: async (name) => skills.find((skill) => skill.name === name),
        }),
      ],
    })

    skillNames.value = ['docs']
    await engine.sendMessage('read docs')

    expect(responseProvider.mock.calls[0]?.[0].messages[0]).toMatchObject({
      role: 'system',
      content: expect.stringContaining('Use docs references.'),
    })
  })

  it('uses core-compatible vue skillPlugin selection with inline skills', async () => {
    const responseProvider = vi.fn(mockResponseProvider('ok'))

    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            context.requestBody.messages.unshift({
              role: 'system',
              content: instructions.join('\n\n'),
            })
          },
          selection: {
            mode: 'manual',
            skills: [
              {
                name: 'docs',
                description: 'Docs skill',
                instructions: 'Use docs references.',
              },
            ],
          },
        }),
      ],
    })

    await engine.sendMessage('read docs')

    expect(responseProvider.mock.calls[0]?.[0].messages[0]).toMatchObject({
      role: 'system',
      content: expect.stringContaining('Use docs references.'),
    })
  })

  it('uses reactive preferred skill names in auto mode', async () => {
    const preferredSkillNames = ref(['stale'])
    const responseProvider = vi.fn((requestBody) => {
      expect(requestBody.messages[0]).toMatchObject({
        role: 'system',
        content: expect.stringContaining('Preferred skill names: docs'),
      })
      return mockResponseProvider('ok')(requestBody)
    })

    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          mode: 'auto',
          onBeforeRequest: (context) => {
            const instructions = getSkillRequestContext(context)?.instructions ?? []
            context.requestBody.messages.unshift({
              role: 'system',
              content: instructions.join('\n\n'),
            })
          },
          preferredSkillNames,
          skills: [
            {
              name: 'docs',
              description: 'Docs skill',
              instructions: 'Use docs references.',
            },
          ],
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
    })

    preferredSkillNames.value = ['docs']
    await engine.sendMessage('read docs')
  })

  it('rejects vue auto skillPlugin without an enabled toolPlugin', async () => {
    const responseProvider = vi.fn(mockResponseProvider('unexpected'))
    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          mode: 'auto',
          skills: [
            {
              name: 'docs',
              description: 'Docs skill',
              instructions: 'Use docs references.',
            },
          ],
        }),
      ],
    })

    await expect(engine.sendMessage('read docs')).rejects.toThrow(
      'skillPlugin auto mode requires an enabled toolPlugin',
    )
    expect(responseProvider).not.toHaveBeenCalled()
  })

  it('rejects vue manual skillNames without a skill resolver', async () => {
    const responseProvider = vi.fn(mockResponseProvider('unexpected'))
    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          mode: 'manual',
          skillNames: ['docs'],
        }),
      ],
    })

    await expect(engine.sendMessage('read docs')).rejects.toThrow(
      'getSkillByName is required when manual mode uses skillNames',
    )
    expect(responseProvider).not.toHaveBeenCalled()
  })

  it('rejects vue auto skillPlugin without a candidate source', async () => {
    const responseProvider = vi.fn(mockResponseProvider('unexpected'))
    const engine = useMessage({
      responseProvider,
      plugins: [
        skillPlugin({
          mode: 'auto',
        }),
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
    })

    await expect(engine.sendMessage('read docs')).rejects.toThrow(
      'getSkillCandidates is required when auto mode is enabled',
    )
    expect(responseProvider).not.toHaveBeenCalled()
  })
})
