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
  TOOL_REJECT_TURN_COMMAND,
  TOOL_RESUME_TURN_COMMAND,
  TOOL_RESUME_COMMAND,
  toolPlugin,
  type RuntimeTool,
  type ToolCallContext,
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
      isProcessing: true,
      isPaused: true,
    })
    expect(engine.getState().messages[1]).toMatchObject({
      role: 'assistant',
      state: {
        toolCall: {
          'call-approval': {
            status: 'awaiting-approval',
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

    await expect(engine.dispatchCommand(TOOL_RESUME_TURN_COMMAND)).resolves.toEqual({
      status: 'resumed',
      toolCallIds: ['call-first', 'call-second'],
    })

    expect(callTool).toHaveBeenCalledTimes(2)
    expect(responseProvider).toHaveBeenCalledTimes(2)
    expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'turn done',
    })
  })

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

  it('denies an awaiting tool call without starting a follow-up request', async () => {
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
        content: 'Tool call denied.',
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
    expect(responseProvider).toHaveBeenCalledTimes(1)
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
    expect(engine.getState().messages.at(-1)).toMatchObject({
      role: 'tool',
      content: 'Tool call denied.',
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
      status: 'rejected',
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
      content: 'Tool call denied.',
    })
    expect(engine.getState().messages[3]).toMatchObject({
      role: 'tool',
      tool_call_id: 'call-still-awaiting',
      content: 'Tool call awaiting confirmation.',
    })
  })

  it('rejects all awaiting tool calls as one turn', async () => {
    const callTool = vi.fn(async () => 'should not run')
    const responseProvider = vi.fn<ResponseProvider>(
      async () =>
        ({
          id: 'turn-rejection-tool-call',
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
                    id: 'call-reject-first',
                    type: 'function',
                    function: { name: 'first_tool', arguments: '{}' },
                  },
                  {
                    id: 'call-reject-second',
                    type: 'function',
                    function: { name: 'second_tool', arguments: '{}' },
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

    await engine.sendMessage('reject all tools')

    await expect(engine.dispatchCommand(TOOL_REJECT_TURN_COMMAND, { reason: 'manual rejection' })).resolves.toEqual({
      status: 'rejected',
      toolCallIds: ['call-reject-first', 'call-reject-second'],
    })

    expect(callTool).not.toHaveBeenCalled()
    expect(responseProvider).toHaveBeenCalledOnce()
    expect(engine.getState()).toMatchObject({ requestState: 'completed', isPaused: false })
    expect(engine.getState().messages[1]).toMatchObject({
      state: {
        toolCall: {
          'call-reject-first': { status: 'denied', reason: 'manual rejection' },
          'call-reject-second': { status: 'denied', reason: 'manual rejection' },
        },
      },
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
            onToolCallStart(toolCall, context) {
              if (shouldPause) {
                context.pauseToolCall(toolCall.id, { reason: 'reload-check' })
              }
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
      const persistedAssistant = persistedMessages.find((message) => message.role === 'assistant')
      if (persistedAssistant) {
        delete persistedAssistant.state
      }

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
})
