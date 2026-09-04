import type { ChatCompletion, ChatCompletionFunctionTool, ChatCompletionTool } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, thinkingPlugin, toolPlugin, type RuntimeTool, type ToolProvider } from '../plugins'
import type { CreateMessageEngineOptions, MessageEnginePlugin, ResponseProvider } from '../types'

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

  it('treats maxToolRounds zero as no tool execution for the turn', async () => {
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
          callTool,
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('do not execute tools')

    expect(callTool).not.toHaveBeenCalled()
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
    expect(responseProvider).toHaveBeenCalledTimes(2)
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
})
