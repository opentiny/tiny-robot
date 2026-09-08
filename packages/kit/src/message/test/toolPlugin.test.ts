import type {
  ChatCompletion,
  ChatCompletionFunctionTool,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import {
  lengthPlugin,
  thinkingPlugin,
  TOOL_REJECT_COMMAND,
  TOOL_RESUME_COMMAND,
  toolPlugin,
  type RuntimeTool,
  type ToolCallContext,
  type ToolProvider,
} from '../plugins'
import type { ChatMessage, CreateMessageEngineOptions, MessageEnginePlugin, ResponseProvider } from '../types'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

const isFunctionTool = (tool: ChatCompletionTool): tool is ChatCompletionFunctionTool => tool.type === 'function'

const functionToolNames = (tools: ChatCompletionTool[] = []) =>
  tools.filter(isFunctionTool).map((tool) => tool.function.name)

describe('toolPlugin', () => {
  it('injects and executes runtime tools before falling back to callTool', async () => {
    const runtimeCall = vi.fn(() => ({ result: 'runtime-result' }))
    const fallbackCall = vi.fn()
    const startHook = vi.fn()
    const runtimeTool: RuntimeTool = {
      tool: {
        type: 'function',
        function: {
          name: 'runtime_lookup',
          description: 'Runtime lookup',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
      },
      handler: runtimeCall,
    }
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(functionToolNames(requestBody.tools)).toEqual(['runtime_lookup'])
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
                      name: 'runtime_lookup',
                      arguments: JSON.stringify({ query: 'vue' }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(requestBody.messages.at(-1)).toMatchObject({
        role: 'tool',
        tool_call_id: 'call-1',
        content: JSON.stringify({ result: 'runtime-result' }),
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
        toolPlugin({
          getTools: async () => [runtimeTool],
          callTool: fallbackCall,
          onToolCallStart: startHook,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('lookup vue')

    expect(runtimeCall).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'call-1',
        function: expect.objectContaining({ name: 'runtime_lookup' }),
      }),
      expect.objectContaining({
        toolMessage: expect.objectContaining({ role: 'tool' }),
        toolSource: { type: 'toolPlugin' },
      }),
    )
    expect(fallbackCall).not.toHaveBeenCalled()
    expect(startHook).toHaveBeenCalledOnce()
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-1': {
            description: 'Runtime lookup',
          },
        },
      },
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('throws when tool names are duplicated', async () => {
    const runtimeTool: RuntimeTool = {
      tool: {
        type: 'function',
        function: {
          name: 'duplicate_tool',
          description: 'Runtime duplicate',
        },
      },
      handler: () => 'runtime',
    }
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'duplicate_tool',
                description: 'Schema duplicate',
              },
            },
            runtimeTool,
          ],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider: async () => {
        throw new Error('responseProvider should not be called')
      },
    })

    await expect(engine.sendMessage('trigger duplicate tools')).rejects.toThrow(
      'Duplicate tool name "duplicate_tool" detected.',
    )
  })

  it('throws when provided tools conflict with existing request tools', async () => {
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          name: 'existing-tools',
          onBeforeRequest: (context) => {
            context.requestBody.tools = [
              {
                type: 'function',
                function: {
                  name: 'duplicate_tool',
                  description: 'Existing request tool',
                },
              },
            ]
          },
        },
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'duplicate_tool',
                description: 'Provided tool',
              },
            },
          ],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider: async () => {
        throw new Error('responseProvider should not be called')
      },
    })

    await expect(engine.sendMessage('trigger duplicate existing tool')).rejects.toThrow(
      'Duplicate tool name "duplicate_tool" detected.',
    )
  })

  it('loads tools provided by other plugins and passes provider source to fallback tool calls', async () => {
    const fallbackCall = vi.fn(async () => 'provider result')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(functionToolNames(requestBody.tools)).toEqual(['provided_tool'])

        return {
          id: 'provider-tool-call',
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
                    id: 'call-provider',
                    type: 'function',
                    function: {
                      name: 'provided_tool',
                      arguments: '{}',
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

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

    const providerPlugin: MessageEnginePlugin & ToolProvider = {
      name: 'external-tool-provider',
      provideTools: async () => [
        {
          type: 'function',
          function: {
            name: 'provided_tool',
            description: 'Provided by another plugin',
          },
        },
      ],
    }

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        providerPlugin,
        toolPlugin({
          getTools: async () => [],
          callTool: fallbackCall,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('call provided tool')

    expect(fallbackCall).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'call-provider',
      }),
      expect.objectContaining({
        toolSource: {
          type: 'toolProvider',
          pluginName: 'external-tool-provider',
        },
      }),
    )
  })

  it('keeps runtime tool handlers stable for the tool list sent to the model', async () => {
    const runtimeCall = vi.fn(() => 'runtime result')
    const fallbackCall = vi.fn(() => 'fallback result')
    const runtimeTool: RuntimeTool = {
      tool: {
        type: 'function',
        function: {
          name: 'volatile_runtime_tool',
          description: 'Runtime tool that is only available during request preparation',
        },
      },
      handler: runtimeCall,
    }
    let getToolsCalls = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        expect(functionToolNames(requestBody.tools)).toEqual(['volatile_runtime_tool'])

        return {
          id: 'volatile-tool-call',
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
                    id: 'call-volatile',
                    type: 'function',
                    function: {
                      name: 'volatile_runtime_tool',
                      arguments: '{}',
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(requestBody.messages.at(-1)).toMatchObject({
        role: 'tool',
        tool_call_id: 'call-volatile',
        content: 'runtime result',
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
        toolPlugin({
          getTools: async () => {
            getToolsCalls++
            return getToolsCalls === 1 ? [runtimeTool] : []
          },
          callTool: fallbackCall,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('call volatile tool')

    expect(runtimeCall).toHaveBeenCalledOnce()
    expect(fallbackCall).not.toHaveBeenCalled()
  })

  it('keeps custom tools already present on the request body', async () => {
    const customTool = {
      type: 'custom',
      custom: {
        name: 'custom_formatter',
        description: 'Format with custom grammar',
        format: {
          type: 'grammar',
          grammar: {
            syntax: 'lark',
            definition: 'start: "ok"',
          },
        },
      },
    } satisfies ChatCompletionTool
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      expect(requestBody.tools).toEqual([customTool])

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
        {
          name: 'custom-tool-plugin',
          onBeforeRequest: (context) => {
            context.requestBody.tools = [customTool]
          },
        },
        toolPlugin({
          getTools: async () => [],
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('use custom tool')

    expect(responseProvider).toHaveBeenCalledOnce()
  })

  it('does not expose a paused turn before pause hooks complete', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    const events: string[] = []
    let releasePauseSave!: () => void
    const pauseSave = new Promise<void>((resolve) => {
      releasePauseSave = resolve
    })
    let markPauseSaveStarted!: () => void
    const pauseSaveStarted = new Promise<void>((resolve) => {
      markPauseSaveStarted = resolve
    })
    let pauseSaveBlocked = false
    let snapshotPersisted = false
    const callTool = vi.fn(async () => {
      events.push('call-tool')
      return 'approved result'
    })
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      if (!requestBody.messages.some((message) => message.role === 'tool')) {
        return {
          id: 'pause-boundary-tool-call',
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
                    id: 'call-pause-boundary',
                    type: 'function',
                    function: { name: 'sensitive_lookup', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      return {
        id: 'pause-boundary-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'done' },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          onTurnPause: async () => {
            if (pauseSaveBlocked) {
              return
            }

            pauseSaveBlocked = true
            events.push('pause-start')
            markPauseSaveStarted()
            await pauseSave
            events.push('pause-end')
          },
        },
        toolPlugin({
          getTools: async () => [{ type: 'function', function: { name: 'sensitive_lookup' } }],
          callTool,
          shouldPauseToolCall: () => true,
          onTurnPause: () => {
            snapshotPersisted = values.has('__tiny-robot-turn')
            events.push('snapshot')
          },
        }),
      ],
      responseProvider,
    })

    try {
      const turn = engine.sendMessage('run sensitive lookup')
      await pauseSaveStarted

      expect(engine.getState()).toMatchObject({
        requestState: 'processing',
        processingState: 'pausing',
        isPaused: false,
      })

      let resumeSettled = false
      const resume = engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-pause-boundary' }).finally(() => {
        resumeSettled = true
      })

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(resumeSettled).toBe(false)
      expect(callTool).not.toHaveBeenCalled()

      releasePauseSave()
      await resume
      await turn

      expect(snapshotPersisted).toBe(true)
      expect(events.indexOf('pause-end')).toBeLessThan(events.indexOf('snapshot'))
      expect(events.indexOf('snapshot')).toBeLessThan(events.indexOf('call-tool'))
      expect(callTool).toHaveBeenCalledOnce()
      expect(responseProvider).toHaveBeenCalledTimes(2)
      expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('finishes abort after a pausing turn completes its pause hook', async () => {
    let releasePauseSave!: () => void
    const pauseSave = new Promise<void>((resolve) => {
      releasePauseSave = resolve
    })
    let markPauseSaveStarted!: () => void
    const pauseSaveStarted = new Promise<void>((resolve) => {
      markPauseSaveStarted = resolve
    })
    const callTool = vi.fn(async () => 'should not run')
    const responseProvider = vi.fn<ResponseProvider>(async () => {
      return {
        id: 'pause-abort-boundary',
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
                  id: 'call-pause-abort-boundary',
                  type: 'function',
                  function: { name: 'sensitive_lookup', arguments: '{}' },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          onTurnPause: async () => {
            markPauseSaveStarted()
            await pauseSave
          },
        },
        toolPlugin({
          getTools: async () => [{ type: 'function', function: { name: 'sensitive_lookup' } }],
          callTool,
          shouldPauseToolCall: () => true,
        }),
      ],
      responseProvider,
    })

    const turn = engine.sendMessage('run sensitive lookup')
    await pauseSaveStarted

    const abort = engine.abort()
    let abortSettled = false
    void abort.finally(() => {
      abortSettled = true
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(abortSettled).toBe(false)
    expect(engine.getState()).toMatchObject({ requestState: 'processing', processingState: 'pausing' })

    releasePauseSave()
    await abort
    await turn

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({ requestState: 'aborted', isProcessing: false, isPaused: false })
  })

  it('pauses a tool call until an external resume command approves it', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    const callTool = vi.fn(async () => 'approved result')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'approval-tool-call',
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
                    id: 'call-approval',
                    type: 'function',
                    function: {
                      name: 'sensitive_lookup',
                      arguments: '{}',
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(requestBody.messages.at(-1)).toMatchObject({
        role: 'tool',
        tool_call_id: 'call-approval',
        content: 'approved result',
      })
      return {
        id: 'approval-answer',
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
          toolCallAwaitingApprovalContent: 'Awaiting approval.',
          shouldPauseToolCall() {
            markPaused()
            return true
          },
        }),
      ],
      responseProvider,
    })

    const turn = engine.sendMessage('run sensitive lookup')
    await paused
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(engine.getState()).toMatchObject({
      requestState: 'paused',
      processingState: undefined,
      isProcessing: false,
      isPaused: true,
      canStartTurn: false,
    })
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-approval': {
            status: 'awaiting-approval',
            content: 'Awaiting approval.',
          },
        },
      },
    })
    expect(engine.getState().messages[2]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-approval',
      content: 'Awaiting approval.',
    })
    expect(callTool).not.toHaveBeenCalled()

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-approval',
      }),
    ).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-approval',
    })

    await turn

    expect(callTool).toHaveBeenCalledOnce()
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState()).toMatchObject({
      requestState: 'completed',
      isPaused: false,
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-approval',
      }),
    ).resolves.toEqual({
      status: 'missing',
      toolCallId: 'call-approval',
    })
  })

  it('pauses and resumes all tool calls as one turn', async () => {
    const callTool = vi.fn(async (toolCall: ChatCompletionMessageToolCall) => `${toolCall.id} result`)
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const toolMessages = requestBody.messages.filter((message) => message.role === 'tool')

      if (toolMessages.length === 0) {
        return {
          id: 'turn-tool-call',
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
                    id: 'call-first',
                    type: 'function',
                    function: { name: 'first_tool', arguments: '{}' },
                  },
                  {
                    id: 'call-second',
                    type: 'function',
                    function: { name: 'second_tool', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(toolMessages).toHaveLength(2)
      expect(toolMessages.map((message) => message.content)).toEqual(['call-first result', 'call-second result'])
      return {
        id: 'turn-tool-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'turn done' },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          shouldPauseToolCall: async () => true,
          getTools: async () => [
            { type: 'function', function: { name: 'first_tool' } },
            { type: 'function', function: { name: 'second_tool' } },
          ],
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run all tools')

    expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-first': { status: 'awaiting-approval' },
          'call-second': { status: 'awaiting-approval' },
        },
      },
    })
    expect(callTool).not.toHaveBeenCalled()

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-first',
      }),
    ).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-first',
    })

    expect(callTool).toHaveBeenCalledTimes(1)
    expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-second',
      }),
    ).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-second',
    })

    expect(callTool).toHaveBeenCalledTimes(2)
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'turn done',
    })
  })

  it('runs the turn resume hook before each approved tool call', async () => {
    const events: string[] = []
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      if (!requestBody.messages.some((message) => message.role === 'tool')) {
        return {
          id: 'resume-hook-tools',
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
                    id: 'call-resume-first',
                    type: 'function',
                    function: { name: 'first_tool', arguments: '{}' },
                  },
                  {
                    id: 'call-resume-second',
                    type: 'function',
                    function: { name: 'second_tool', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      return {
        id: 'resume-hook-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [{ index: 0, message: { role: 'assistant', content: 'done' }, finish_reason: 'stop' }],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        {
          onTurnResume: () => {
            events.push('resume')
          },
        },
        toolPlugin({
          getTools: async () => [
            { type: 'function', function: { name: 'first_tool' } },
            { type: 'function', function: { name: 'second_tool' } },
          ],
          callTool: async (toolCall) => {
            if (toolCall.type === 'function') {
              events.push(toolCall.function.name)
            }
            return 'ok'
          },
          shouldPauseToolCall: () => true,
        }),
      ],
      responseProvider,
    })

    const turn = engine.sendMessage('run tools')
    await vi.waitFor(() => expect(engine.getState().requestState).toBe('paused'))

    await engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-resume-first' })
    expect(events).toEqual(['resume', 'first_tool'])
    expect(engine.getState()).toMatchObject({ requestState: 'paused' })

    await engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-resume-second' })
    await turn
    expect(events).toEqual(['resume', 'first_tool', 'resume', 'second_tool'])
  })

  it('does not execute the same approval command concurrently', async () => {
    let releaseTool!: () => void
    const toolStarted = new Promise<void>((resolve) => {
      releaseTool = resolve
    })
    const toolEntered = vi.fn()
    const callTool = vi.fn(async () => {
      toolEntered()
      await toolStarted
      return 'approved'
    })
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      if (!requestBody.messages.some((message) => message.role === 'tool')) {
        return {
          id: 'concurrent-approval',
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
                    id: 'call-concurrent',
                    type: 'function',
                    function: { name: 'sensitive_tool', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      return {
        id: 'concurrent-approval-done',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [{ index: 0, message: { role: 'assistant', content: 'done' }, finish_reason: 'stop' }],
      } as ChatCompletion
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [{ type: 'function', function: { name: 'sensitive_tool' } }],
          callTool,
          shouldPauseToolCall: () => true,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('approve once')
    const first = engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-concurrent' })
    await vi.waitFor(() => expect(toolEntered).toHaveBeenCalledOnce())
    const second = engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId: 'call-concurrent' })

    releaseTool()
    await expect(first).resolves.toMatchObject({ status: 'resumed', toolCallId: 'call-concurrent' })
    await expect(second).resolves.toMatchObject({ toolCallId: 'call-concurrent' })
    expect(callTool).toHaveBeenCalledOnce()
  })

  it.each([TOOL_RESUME_COMMAND, TOOL_REJECT_COMMAND])(
    'restores paused state when %s cannot resolve tools',
    async (command) => {
      let shouldRejectToolResolution = false
      const getTools = vi.fn(async () => {
        if (shouldRejectToolResolution) {
          throw new Error('tools unavailable')
        }

        return [
          {
            type: 'function' as const,
            function: { name: 'approval_tool' },
          },
        ]
      })
      const callTool = vi.fn(async () => 'approved')
      const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
        if (!requestBody.messages.some((message) => message.role === 'tool')) {
          return {
            id: 'tool-resolution-failure',
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
                      id: 'call-resolution-failure',
                      type: 'function',
                      function: { name: 'approval_tool', arguments: '{}' },
                    },
                  ],
                },
                finish_reason: 'tool_calls',
              },
            ],
          } as ChatCompletion
        }

        return {
          id: 'tool-resolution-recovered',
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'mock',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'done' },
              finish_reason: 'stop',
            },
          ],
        } as ChatCompletion
      })

      const engine = createTestMessageEngine({
        plugins: [
          ...silentDefaultPlugins,
          toolPlugin({
            getTools,
            callTool,
            shouldPauseToolCall: () => true,
          }),
        ],
        responseProvider,
      })

      await engine.sendMessage('run approval tool')
      expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })

      shouldRejectToolResolution = true
      if (command === TOOL_RESUME_COMMAND) {
        await expect(
          engine.dispatchCommand(command, {
            toolCallId: 'call-resolution-failure',
          }),
        ).rejects.toThrow('tools unavailable')
        expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
      } else {
        await expect(
          engine.dispatchCommand(command, {
            toolCallId: 'call-resolution-failure',
          }),
        ).resolves.toEqual({ status: 'denied', toolCallId: 'call-resolution-failure' })
        expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
        expect(responseProvider).toHaveBeenCalledTimes(2)
        expect(callTool).not.toHaveBeenCalled()
        return
      }

      shouldRejectToolResolution = false
      await expect(
        engine.dispatchCommand(command, {
          toolCallId: 'call-resolution-failure',
        }),
      ).resolves.toMatchObject({
        toolCallId: 'call-resolution-failure',
      })

      expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
      expect(responseProvider).toHaveBeenCalledTimes(2)
      if (command === TOOL_RESUME_COMMAND) {
        expect(callTool).toHaveBeenCalledOnce()
      } else {
        expect(callTool).not.toHaveBeenCalled()
      }
    },
  )

  it('pauses only tools selected by shouldPauseToolCall', async () => {
    const callTool = vi.fn(async (toolCall: ChatCompletionMessageToolCall) => `${toolCall.id} result`)
    const shouldPauseToolCall = vi.fn(async (toolCall: ChatCompletionMessageToolCall, context: ToolCallContext) => {
      expect(context.toolMessage).toMatchObject({ role: 'tool', tool_call_id: toolCall.id })
      return toolCall.type === 'function' && toolCall.function.name === 'sensitive_tool'
    })
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const toolMessages = requestBody.messages.filter((message) => message.role === 'tool')

      if (toolMessages.length === 0) {
        return {
          id: 'selective-pause-tool-call',
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
                    id: 'call-safe',
                    type: 'function',
                    function: { name: 'safe_tool', arguments: '{}' },
                  },
                  {
                    id: 'call-sensitive',
                    type: 'function',
                    function: { name: 'sensitive_tool', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        } as ChatCompletion
      }

      expect(toolMessages).toHaveLength(2)
      expect(toolMessages.map((message) => message.content)).toEqual(['call-safe result', 'call-sensitive result'])
      return {
        id: 'selective-pause-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'selective pause done' },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [
            { type: 'function', function: { name: 'safe_tool' } },
            { type: 'function', function: { name: 'sensitive_tool' } },
          ],
          shouldPauseToolCall,
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run selective tools')

    expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
    expect(callTool).toHaveBeenCalledOnce()
    expect(callTool).toHaveBeenCalledWith(expect.objectContaining({ id: 'call-safe' }), expect.any(Object))
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-safe': { status: 'success' },
          'call-sensitive': { status: 'awaiting-approval' },
        },
      },
    })
    expect(responseProvider).toHaveBeenCalledOnce()

    await expect(
      engine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-sensitive',
      }),
    ).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-sensitive',
    })

    expect(callTool).toHaveBeenCalledTimes(2)
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'selective pause done',
    })
  })

})
