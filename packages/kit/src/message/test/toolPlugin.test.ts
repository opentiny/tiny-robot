import type { ChatCompletion, ChatCompletionFunctionTool, ChatCompletionTool } from 'openai/resources'
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
  type ToolProvider,
} from '../plugins'
import type { CreateMessageEngineOptions, MessageEnginePlugin, ResponseProvider } from '../types'

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
          onToolCallStart(toolCall, context) {
            context.pauseToolCall(toolCall.id, {
              content: 'Awaiting approval.',
              reason: 'manual-review',
            })
            markPaused()
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
      isPaused: true,
    })
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-approval': {
            status: 'paused',
            reason: 'manual-review',
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
  })

  it('skips a paused tool call when an external reject command denies it', async () => {
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
        content: 'Tool call cancelled.',
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
              content: 'denied',
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
          onToolCallStart(toolCall, context) {
            context.pauseToolCall(toolCall.id)
            markPaused()
          },
        }),
      ],
      responseProvider,
    })

    const turn = engine.sendMessage('delete sensitive data')
    await paused

    await expect(
      engine.dispatchCommand(TOOL_REJECT_COMMAND, {
        toolCallId: 'call-rejection',
        reason: 'approval denied',
      }),
    ).resolves.toEqual({
      status: 'rejected',
      toolCallId: 'call-rejection',
    })

    await turn

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-rejection': {
            status: 'cancelled',
          },
        },
      },
    })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'denied',
    })
  })
})
