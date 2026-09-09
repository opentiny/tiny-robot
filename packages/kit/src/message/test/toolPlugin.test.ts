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

const toolCallCompletion = (...toolCallIds: string[]): ChatCompletion => ({
  id: `tool-call-${toolCallIds.join('-')}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'mock',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: '',
        tool_calls: toolCallIds.map((id) => ({
          id,
          type: 'function',
          function: {
            name: 'lookup',
            arguments: '{}',
          },
        })),
      },
      finish_reason: 'tool_calls',
    },
  ],
})

const assistantCompletion = (content: string, finishReason: 'stop' | 'length' = 'stop'): ChatCompletion => ({
  id: `assistant-${finishReason}`,
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'mock',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content,
      },
      finish_reason: finishReason,
    },
  ],
})

describe('toolPlugin', () => {
  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid maxToolRounds value %s',
    (maxToolRounds) => {
      expect(() =>
        toolPlugin({
          maxToolRounds,
          getTools: async () => [],
          callTool: async () => 'unused',
        }),
      ).toThrow('maxToolRounds must be a non-negative integer')
    },
  )

  it('keeps tool rounds unlimited when maxToolRounds is omitted', async () => {
    const callTool = vi.fn(async () => 'tool result')
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async () => {
      requestCount += 1

      if (requestCount <= 3) {
        return {
          id: `tool-round-${requestCount}`,
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
                    id: `call-${requestCount}`,
                    type: 'function',
                    function: {
                      name: 'lookup',
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
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [],
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('use tools')

    expect(callTool).toHaveBeenCalledTimes(3)
    expect(responseProvider).toHaveBeenCalledTimes(4)
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done',
    })
  })

  it('cancels an over-limit batch and completes the turn with tools disabled', async () => {
    const callTool = vi.fn(async () => 'tool result')
    const onLimitExceeded = vi.fn(async () => {})
    const endedToolCalls: Array<{ id: string; status: string; content: unknown }> = []
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        return toolCallCompletion('call-allowed')
      }

      if (requestCount === 2) {
        return toolCallCompletion('call-blocked-a', 'call-blocked-b')
      }

      expect(requestBody.tools).toEqual([])
      expect(requestBody.tool_choice).toBe('none')
      return assistantCompletion('Completed without more tools.')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 1,
          getTools: async () => [],
          onBeforeRequest: ({ requestBody }) => {
            requestBody.tools = [
              {
                type: 'function',
                function: {
                  name: 'lookup',
                },
              },
            ]
            requestBody.tool_choice = 'auto'
          },
          callTool,
          onLimitExceeded,
          onToolCallEnd: (toolCall, context) => {
            endedToolCalls.push({
              id: toolCall.id,
              status: context.status,
              content: context.toolMessage.content,
            })
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('use tools')

    expect(callTool).toHaveBeenCalledTimes(1)
    expect(onLimitExceeded).toHaveBeenCalledOnce()
    expect(onLimitExceeded).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'call-blocked-a' }), expect.objectContaining({ id: 'call-blocked-b' })],
      expect.objectContaining({
        assistantMessage: expect.objectContaining({ role: 'assistant' }),
        toolRoundCount: 2,
        maxToolRounds: 1,
      }),
    )
    expect(engine.getState().requestState).toBe('completed')
    expect(endedToolCalls).toEqual([
      { id: 'call-allowed', status: 'success', content: 'tool result' },
      {
        id: 'call-blocked-a',
        status: 'cancelled',
        content:
          'Tool call skipped because the maximum number of tool-call rounds (1) was reached. Continue the conversation without calling tools.',
      },
      {
        id: 'call-blocked-b',
        status: 'cancelled',
        content:
          'Tool call skipped because the maximum number of tool-call rounds (1) was reached. Continue the conversation without calling tools.',
      },
    ])
    expect(engine.getState().messages.slice(-3)).toMatchObject([
      {
        role: 'tool',
        tool_call_id: 'call-blocked-a',
        content:
          'Tool call skipped because the maximum number of tool-call rounds (1) was reached. Continue the conversation without calling tools.',
      },
      {
        role: 'tool',
        tool_call_id: 'call-blocked-b',
        content:
          'Tool call skipped because the maximum number of tool-call rounds (1) was reached. Continue the conversation without calling tools.',
      },
      {
        role: 'assistant',
        content: 'Completed without more tools.',
      },
    ])
    expect(
      engine
        .getState()
        .messages.find((message) => message.tool_calls?.some((toolCall) => toolCall.id === 'call-blocked-a')),
    ).toMatchObject({
      state: {
        toolCall: {
          'call-blocked-a': { status: 'cancelled' },
          'call-blocked-b': { status: 'cancelled' },
        },
      },
    })
  })

  it('keeps tools disabled after later plugins modify the closing request', async () => {
    const injectedTool: ChatCompletionFunctionTool = {
      type: 'function',
      function: { name: 'lookup' },
    }
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        expect(requestBody.tools).toEqual([injectedTool])
        expect(requestBody.tool_choice).toBe('auto')
        return toolCallCompletion('call-limited')
      }

      expect(requestBody.tools).toEqual([])
      expect(requestBody.tool_choice).toBe('none')
      return assistantCompletion('completed without reinjected tools')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          callTool: async () => 'unexpected',
        }),
        {
          name: 'later-tool-injector',
          onBeforeRequest({ requestBody }) {
            requestBody.tools = [injectedTool]
            requestBody.tool_choice = 'auto'
          },
        },
      ],
      responseProvider,
    })

    await engine.sendMessage('finish without later tools')

    expect(engine.getState()).toMatchObject({ requestState: 'completed' })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'completed without reinjected tools',
    })
  })

  it('applies maxToolRounds zero before tool execution or approval', async () => {
    const callTool = vi.fn(async () => 'unexpected')
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        return toolCallCompletion('call-limited')
      }

      expect(requestBody).toMatchObject({
        tools: [],
        tool_choice: 'none',
      })
      return assistantCompletion('done without tools')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          shouldPauseToolCall: () => true,
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('do not execute tools')

    expect(callTool).not.toHaveBeenCalled()
    expect(engine.getState().requestState).toBe('completed')
    expect(engine.getState().messages.at(-2)).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-limited',
      content: expect.stringContaining('maximum number of tool-call rounds (0) was reached'),
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'done without tools',
    })
  })

  it('resets the tool round budget for each top-level user turn', async () => {
    const callTool = vi.fn(async () => 'tool result')
    const responses = [
      toolCallCompletion('turn-1-allowed'),
      toolCallCompletion('turn-1-blocked'),
      assistantCompletion('turn 1 done'),
      toolCallCompletion('turn-2-allowed'),
      assistantCompletion('turn 2 done'),
    ]
    const responseProvider = vi.fn<ResponseProvider>(async () => responses.shift()!)
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 1,
          getTools: async () => [],
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('first turn')
    await engine.sendMessage('second turn')

    expect(callTool).toHaveBeenCalledTimes(2)
    expect(callTool.mock.calls.map(([toolCall]) => toolCall.id)).toEqual(['turn-1-allowed', 'turn-2-allowed'])
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'turn 2 done',
    })
  })

  it('keeps tools disabled across closing length continuations', async () => {
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        return toolCallCompletion('call-limited')
      }

      expect(requestBody).toMatchObject({
        tools: [],
        tool_choice: 'none',
      })

      return requestCount === 2
        ? assistantCompletion('partial closing answer', 'length')
        : assistantCompletion('final closing answer')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        lengthPlugin(),
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          callTool: async () => 'unexpected',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('finish without tools')

    expect(responseProvider).toHaveBeenCalledTimes(3)
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'final closing answer',
    })
  })

  it('fails when a provider returns tool calls after tools were disabled', async () => {
    const callTool = vi.fn(async () => 'unexpected')
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        return toolCallCompletion('call-limited')
      }

      expect(requestBody).toMatchObject({
        tools: [],
        tool_choice: 'none',
      })
      return toolCallCompletion('call-provider-violation')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          callTool,
        }),
      ],
      responseProvider,
    })

    await expect(engine.sendMessage('finish without tools')).rejects.toThrow(
      'The response provider returned tool calls after tool calling was disabled.',
    )

    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(callTool).not.toHaveBeenCalled()
    expect(engine.getState().requestState).toBe('error')
  })

  it('stops before the closing request when onLimitExceeded throws', async () => {
    const callTool = vi.fn(async () => 'unexpected')
    const responseProvider = vi.fn<ResponseProvider>(async () => toolCallCompletion('call-limited'))
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 0,
          getTools: async () => [],
          callTool,
          onLimitExceeded: async () => {
            throw new Error('limit callback failed')
          },
        }),
      ],
      responseProvider,
    })

    await expect(engine.sendMessage('finish without tools')).rejects.toThrow('limit callback failed')

    expect(responseProvider).toHaveBeenCalledOnce()
    expect(callTool).not.toHaveBeenCalled()
    expect(engine.getState().requestState).toBe('error')
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-limited',
      content: expect.stringContaining('Continue the conversation without calling tools.'),
    })
  })

  it('executes every tool call in one allowed round', async () => {
    const callTool = vi.fn(async () => 'tool result')
    let requestCount = 0
    const responseProvider = vi.fn<ResponseProvider>(async () => {
      requestCount += 1
      return requestCount === 1
        ? toolCallCompletion('call-a', 'call-b', 'call-c')
        : assistantCompletion('all calls completed')
    })
    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          maxToolRounds: 1,
          getTools: async () => [],
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run a batch')

    expect(callTool).toHaveBeenCalledTimes(3)
    expect(callTool.mock.calls.map(([toolCall]) => toolCall.id)).toEqual(['call-a', 'call-b', 'call-c'])
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'all calls completed',
    })
  })

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

  it('reports an awaiting tool rejection as a denied tool result and continues the turn', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    const callTool = vi.fn(async () => 'should not run')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'rejection-tool-call',
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
                    id: 'call-rejection',
                    type: 'function',
                    function: {
                      name: 'sensitive_delete',
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
        tool_call_id: 'call-rejection',
        content: 'Tool call failed.',
      })
      return {
        id: 'rejection-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'failure handled',
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
                name: 'sensitive_delete',
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
      responseProvider,
    })

    const turn = engine.sendMessage('delete sensitive data')
    await paused
    await new Promise((resolve) => setTimeout(resolve, 0))

    await expect(
      engine.dispatchCommand(TOOL_REJECT_COMMAND, {
        toolCallId: 'call-rejection',
        reason: 'approval denied',
      }),
    ).resolves.toEqual({
      status: 'denied',
      toolCallId: 'call-rejection',
    })

    await turn

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState()).toMatchObject({
      requestState: 'completed',
      isPaused: false,
    })
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-rejection': {
            status: 'denied',
          },
        },
      },
    })
    expect(engine.getState().messages[2]).toMatchObject({
      role: 'tool',
      content: 'Tool call failed.',
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'failure handled',
    })
  })

  it('keeps the turn paused when only one of multiple awaiting tool calls is rejected', async () => {
    const callTool = vi.fn(async () => 'should not run')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const toolMessages = requestBody.messages.filter((message) => message.role === 'tool')

      if (toolMessages.length > 0) {
        throw new Error('partial rejection should not start a follow-up request')
      }

      return {
        id: 'partial-rejection-tool-call',
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
                  id: 'call-reject-one',
                  type: 'function',
                  function: { name: 'first_tool', arguments: '{}' },
                },
                {
                  id: 'call-still-awaiting',
                  type: 'function',
                  function: { name: 'second_tool', arguments: '{}' },
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

    await engine.sendMessage('reject one tool')

    await expect(
      engine.dispatchCommand(TOOL_REJECT_COMMAND, {
        toolCallId: 'call-reject-one',
        reason: 'manual rejection',
      }),
    ).resolves.toEqual({
      status: 'denied',
      toolCallId: 'call-reject-one',
    })

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-reject-one': { status: 'denied', reason: 'manual rejection' },
          'call-still-awaiting': { status: 'awaiting-approval' },
        },
      },
    })
    expect(engine.getState().messages[2]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-reject-one',
      content: 'Tool call failed.',
    })
    expect(engine.getState().messages[3]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-still-awaiting',
      content: 'Tool call awaiting confirmation.',
    })
  })

  it('denies awaiting tool calls when the paused turn is aborted', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    const callTool = vi.fn(async () => 'should not run')
    const responseProvider = vi.fn<ResponseProvider>(
      async () =>
        ({
          id: 'abort-tool-call',
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
                    id: 'call-abort',
                    type: 'function',
                    function: {
                      name: 'sensitive_delete',
                      arguments: '{}',
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }) as ChatCompletion,
    )

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'sensitive_delete',
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
      responseProvider,
    })

    const turn = engine.sendMessage('delete sensitive data')
    await paused
    await new Promise((resolve) => setTimeout(resolve, 0))

    await engine.abort()
    await turn

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({
      requestState: 'aborted',
      isProcessing: false,
      isPaused: false,
    })
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-abort': {
            status: 'denied',
          },
        },
      },
    })
  })

  it('denies paused tools when abort happens while another tool is still running', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    let markRunning!: () => void
    const running = new Promise<void>((resolve) => {
      markRunning = resolve
    })
    const callTool = vi.fn(async (toolCall: ChatCompletionMessageToolCall, context: ToolCallContext) => {
      if (toolCall.type === 'function' && toolCall.id === 'call-running') {
        markRunning()
        await new Promise<void>((resolve, reject) => {
          context.abortSignal.addEventListener(
            'abort',
            () => {
              reject(new Error('tool aborted'))
            },
            { once: true },
          )
        })
      }

      return 'cancelled'
    })
    const responseProvider = vi.fn<ResponseProvider>(
      async () =>
        ({
          id: 'abort-concurrent-tool-calls',
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
                    id: 'call-paused',
                    type: 'function',
                    function: { name: 'sensitive_delete', arguments: '{}' },
                  },
                  {
                    id: 'call-running',
                    type: 'function',
                    function: { name: 'background_lookup', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }) as ChatCompletion,
    )

    const engine = createTestMessageEngine({
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [
            { type: 'function', function: { name: 'sensitive_delete' } },
            { type: 'function', function: { name: 'background_lookup' } },
          ],
          callTool,
          shouldPauseToolCall(toolCall) {
            if (toolCall.type === 'function' && toolCall.id === 'call-paused') {
              markPaused()
              return true
            }

            return false
          },
        }),
      ],
      responseProvider,
    })

    const turn = engine.sendMessage('run concurrent tools')
    await paused
    await running

    await engine.abort()
    await turn
    await vi.waitFor(() =>
      expect(engine.getState().messages[1]).toMatchObject({
        state: {
          toolCall: {
            'call-running': { status: 'cancelled' },
          },
        },
      }),
    )

    expect(responseProvider).toHaveBeenCalledOnce()
    expect(callTool).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({ requestState: 'aborted', isPaused: false })
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-paused': { status: 'denied' },
          'call-running': { status: 'cancelled' },
        },
      },
    })
  })

  it('aborts a resumed tool call without leaving the engine processing', async () => {
    let markPaused!: () => void
    const paused = new Promise<void>((resolve) => {
      markPaused = resolve
    })
    let markStarted!: () => void
    const started = new Promise<void>((resolve) => {
      markStarted = resolve
    })
    let shouldPause = true
    const callTool = vi.fn((_toolCall: ChatCompletionMessageToolCall, context: ToolCallContext) => {
      markStarted()
      return new Promise<string>((resolve) => {
        context.abortSignal.addEventListener('abort', () => resolve('cancelled'), { once: true })
      })
    })
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (hasToolResult) {
        throw new Error('responseProvider should not be called after abort')
      }

      return {
        id: 'resume-abort-tool-call',
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
                  id: 'call-resume-abort',
                  type: 'function',
                  function: {
                    name: 'sensitive_update',
                    arguments: '{}',
                  },
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
        toolPlugin({
          getTools: async () => [
            {
              type: 'function',
              function: {
                name: 'sensitive_update',
              },
            },
          ],
          callTool,
          shouldPauseToolCall() {
            if (shouldPause) {
              markPaused()
            }
            return shouldPause
          },
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('run sensitive update')
    await paused

    shouldPause = false
    const resume = engine.dispatchCommand(TOOL_RESUME_COMMAND, {
      toolCallId: 'call-resume-abort',
    })
    await started

    const abortResult = await Promise.race([
      engine.abort().then(() => 'aborted'),
      new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 1000)),
    ])

    expect(abortResult).toBe('aborted')
    await expect(resume).resolves.toEqual({
      status: 'resumed',
      toolCallId: 'call-resume-abort',
    })
    expect(responseProvider).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({
      requestState: 'aborted',
      isProcessing: false,
      isPaused: false,
    })
  })

  it('persists paused turn metadata and restores it from reloaded conversation messages', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let shouldPause = true
    const callTool = vi.fn(async () => 'approved after reload')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      const hasToolResult = requestBody.messages.some((message) => message.role === 'tool')

      if (!hasToolResult) {
        return {
          id: 'persisted-tool-call',
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
                    id: 'call-persisted',
                    type: 'function',
                    function: {
                      name: 'persisted_lookup',
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
        tool_call_id: 'call-persisted',
        content: 'approved after reload',
      })

      return {
        id: 'persisted-answer',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'mock',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'restored and completed',
            },
            finish_reason: 'stop',
          },
        ],
      } as ChatCompletion
    })

    const createPausedEngine = (initialMessages: ChatMessage[] = []) =>
      createTestMessageEngine({
        initialMessages,
        plugins: [
          ...silentDefaultPlugins,
          toolPlugin({
            getTools: async () => [
              {
                type: 'function',
                function: { name: 'persisted_lookup' },
              },
            ],
            callTool,
            shouldPauseToolCall() {
              return shouldPause
            },
          }),
        ],
        responseProvider,
      })

    try {
      const firstEngine = createPausedEngine()
      await firstEngine.sendMessage('persist this turn')

      expect(firstEngine.getState()).toMatchObject({ requestState: 'paused', isPaused: true })
      expect(values.has('__tiny-robot-turn')).toBe(true)
      expect(JSON.parse(values.get('__tiny-robot-turn') ?? '{}').turns[0]).not.toHaveProperty('messages')

      shouldPause = false
      const persistedMessages = JSON.parse(JSON.stringify(firstEngine.getState().messages)) as ChatMessage[]

      const restoredEngine = createPausedEngine(persistedMessages)
      expect(restoredEngine.getState()).toMatchObject({
        requestState: 'paused',
        isPaused: true,
      })
      expect(restoredEngine.getState().messages).toHaveLength(3)
      expect(restoredEngine.getState().messages[1]).toMatchObject({
        state: {
          toolCall: {
            'call-persisted': { status: 'awaiting-approval' },
          },
        },
      })

      await expect(
        restoredEngine.dispatchCommand(TOOL_RESUME_COMMAND, {
          toolCallId: 'call-persisted',
        }),
      ).resolves.toEqual({
        status: 'resumed',
        toolCallId: 'call-persisted',
      })

      expect(callTool).toHaveBeenCalledOnce()
      expect(restoredEngine.getState()).toMatchObject({ requestState: 'completed' })
      expect(restoredEngine.getState().messages.at(-1)).toMatchObject({
        role: 'assistant',
        content: 'restored and completed',
      })
      expect(values.has('__tiny-robot-turn')).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('preserves the tool round budget after restoring a paused turn', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    let shouldPause = true
    let requestCount = 0
    const callTool = vi.fn(async () => 'approved result')
    const responseProvider = vi.fn<ResponseProvider>(async (requestBody) => {
      requestCount += 1

      if (requestCount === 1) {
        return toolCallCompletion('call-before-reload')
      }

      if (requestCount === 2) {
        return toolCallCompletion('call-after-reload')
      }

      expect(requestBody).toMatchObject({
        tools: [],
        tool_choice: 'none',
      })
      return assistantCompletion('completed at the restored limit')
    })

    const createPausedEngine = (initialMessages: ChatMessage[] = []) =>
      createTestMessageEngine({
        initialMessages,
        plugins: [
          ...silentDefaultPlugins,
          toolPlugin({
            maxToolRounds: 1,
            getTools: async () => [],
            callTool,
            shouldPauseToolCall: () => shouldPause,
          }),
        ],
        responseProvider,
      })

    try {
      const firstEngine = createPausedEngine()
      await firstEngine.sendMessage('persist the round budget')

      shouldPause = false
      const persistedMessages = JSON.parse(JSON.stringify(firstEngine.getState().messages)) as ChatMessage[]
      const restoredEngine = createPausedEngine(persistedMessages)

      await restoredEngine.dispatchCommand(TOOL_RESUME_COMMAND, {
        toolCallId: 'call-before-reload',
      })

      expect(callTool).toHaveBeenCalledOnce()
      expect(restoredEngine.getState()).toMatchObject({ requestState: 'completed' })
      expect(
        restoredEngine
          .getState()
          .messages.find((message) => message.tool_calls?.some((toolCall) => toolCall.id === 'call-after-reload')),
      ).toMatchObject({
        state: {
          toolCall: {
            'call-after-reload': { status: 'cancelled' },
          },
        },
      })
      expect(restoredEngine.getState().messages.at(-1)).toMatchObject({
        role: 'assistant',
        content: 'completed at the restored limit',
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('does not restore a paused turn when messages do not contain awaiting tool state', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    const turnId = 'invalid-restored-turn'
    const toolCallId = 'call-invalid-restored'
    values.set(
      '__tiny-robot-turn',
      JSON.stringify({
        version: 1,
        turns: [{ version: 1, turnId, requestState: 'paused', toolCallIds: [toolCallId], customContext: {} }],
      }),
    )

    const callTool = vi.fn(async () => 'should not run')
    const engine = createTestMessageEngine({
      initialMessages: [
        { role: 'user', content: 'stale turn' },
        {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: toolCallId,
              type: 'function',
              function: { name: 'sensitive_lookup', arguments: '{}' },
            },
          ],
          state: { turnId },
        },
        { role: 'tool', tool_call_id: toolCallId, content: 'Tool call awaiting confirmation.' },
      ],
      plugins: [
        ...silentDefaultPlugins,
        toolPlugin({
          getTools: async () => [{ type: 'function', function: { name: 'sensitive_lookup' } }],
          callTool,
        }),
      ],
      responseProvider: async () =>
        ({
          id: 'unused',
          object: 'chat.completion',
          created: 0,
          model: 'mock',
          choices: [],
        }) as ChatCompletion,
    })

    try {
      expect(engine.getState()).toMatchObject({ requestState: 'idle', isPaused: false })
      await expect(engine.dispatchCommand(TOOL_RESUME_COMMAND, { toolCallId })).resolves.toEqual({
        status: 'missing',
        toolCallId,
      })
      expect(callTool).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('restores paused turns independently when conversations reuse a tool call id', async () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)

    const responseProvider = vi.fn<ResponseProvider>(
      async () =>
        ({
          id: 'shared-tool-call',
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
                    id: 'call-shared',
                    type: 'function',
                    function: { name: 'sensitive_lookup', arguments: '{}' },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
        }) as ChatCompletion,
    )

    const createPausedEngine = (initialMessages: ChatMessage[] = []) =>
      createTestMessageEngine({
        initialMessages,
        plugins: [
          ...silentDefaultPlugins,
          toolPlugin({
            getTools: async () => [{ type: 'function', function: { name: 'sensitive_lookup' } }],
            callTool: async () => 'unused',
            shouldPauseToolCall: () => true,
          }),
        ],
        responseProvider,
      })

    try {
      const firstEngine = createPausedEngine()
      const secondEngine = createPausedEngine()
      await firstEngine.sendMessage('first conversation')
      await secondEngine.sendMessage('second conversation')

      const firstMessages = JSON.parse(JSON.stringify(firstEngine.getState().messages)) as ChatMessage[]
      const secondMessages = JSON.parse(JSON.stringify(secondEngine.getState().messages)) as ChatMessage[]
      expect(firstMessages[1]?.state?.turnId).not.toBe(secondMessages[1]?.state?.turnId)

      expect(createPausedEngine(firstMessages).getState()).toMatchObject({ requestState: 'paused', isPaused: true })
      expect(createPausedEngine(secondMessages).getState()).toMatchObject({ requestState: 'paused', isPaused: true })
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
