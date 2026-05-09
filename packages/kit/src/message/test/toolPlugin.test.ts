import type { ChatCompletion } from 'openai/resources'
import { describe, expect, it, vi } from 'vitest'
import { createNativeMessageAdapter } from '../adapters/native'
import { createMessageEngine } from '../core/engine'
import { lengthPlugin, thinkingPlugin, toolPlugin, type RuntimeTool, type ToolProvider } from '../plugins'
import type { CreateMessageEngineOptions, MessageEnginePlugin, ResponseProvider } from '../types'

const silentDefaultPlugins = [thinkingPlugin({ disabled: true }), lengthPlugin({ disabled: true })]

const createTestMessageEngine = (options: CreateMessageEngineOptions) =>
  createMessageEngine(createNativeMessageAdapter(), options)

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
        expect(requestBody.tools?.map((tool) => tool.function.name)).toEqual(['runtime_lookup'])
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

  it('loads tools provided by other plugins', async () => {
    const responseProvider = vi.fn(async () => {
      return {
        id: 'answer',
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
      name: 'provider',
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
          callTool: async () => 'fallback',
        }),
      ],
      responseProvider,
    })

    await engine.sendMessage('use provided tool')

    expect(responseProvider.mock.calls[0]?.[0].tools?.map((tool) => tool.function.name)).toEqual(['provided_tool'])
  })
})
