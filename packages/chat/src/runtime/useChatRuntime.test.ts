import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type {
  ChatCompletion,
  ChatMessage,
  ConversationInfo,
  ConversationStorageStrategy,
} from '@opentiny/tiny-robot-kit'
import type { ChatMcpRuntime } from '../types'
import type { UseChatRuntimeMcpAdapter } from './useChatRuntime'
import { errorStatePlugin } from './plugins/errorStatePlugin'
import { createWebMcpAdapter } from './mcp/createWebMcpAdapter'
import type { ModelSelectorField } from '@opentiny/tiny-robot'
import { CHAT_RUN_CONFIG_METADATA_KEY } from './runConfig'
import { useChatRuntime } from './useChatRuntime'

const createMemoryStorage = (): ConversationStorageStrategy => {
  const conversations = new Map<string, ConversationInfo>()
  const messages = new Map<string, ChatMessage[]>()
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

  return {
    loadConversations: () => clone([...conversations.values()]),
    loadMessages: (id) => clone(messages.get(id) ?? []),
    saveConversation: (conversation) => {
      conversations.set(conversation.id, clone(conversation))
    },
    saveMessages: (id, nextMessages) => {
      messages.set(id, clone(nextMessages))
    },
    deleteConversation: (id) => {
      conversations.delete(id)
      messages.delete(id)
    },
  }
}

describe('useChatRuntime error state', () => {
  it('stores provider failures on the generated assistant message by default', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)).toMatchObject({
      role: 'assistant',
      state: {
        error: {
          name: 'Error',
          message: 'provider failed',
        },
      },
    })
  })

  it('lets a same-name user plugin disable default error state writes', async () => {
    const providerError = new Error('provider failed')
    const runtime = useChatRuntime({
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () => {
            throw providerError
          },
          plugins: [errorStatePlugin({ disabled: true })],
        },
      },
    })

    await expect(runtime.actions.send({ text: 'fail' })).rejects.toBe(providerError)

    const activeConversation = runtime.activeConversation.value
    expect(activeConversation?.requestState).toBe('error')
    expect(activeConversation?.messages.at(-1)?.state?.error).toBeUndefined()
  })
})

describe('useChatRuntime MCP composition', () => {
  it('composes mcpServers and a custom mcp adapter into one runtime', () => {
    const server: ChatMcpRuntime['servers']['value'][number] = {
      id: 'custom-tools',
      name: 'Custom Tools',
      installed: true,
      enabled: true,
    }
    const customMcp: UseChatRuntimeMcpAdapter = {
      runtime: {
        servers: computed(() => [server]),
        tools: computed(() => ({ 'custom-tools': [{ id: 'echo', name: 'echo', enabled: true }] })),
        addServer: () => undefined,
        removeServer: () => undefined,
        setServerEnabled: () => undefined,
        setToolEnabled: () => undefined,
      },
      listTools: async (_serverIds, selectedToolIds) =>
        (selectedToolIds['custom-tools'] ?? []).map((id) => ({
          serverId: 'custom-tools',
          id,
          name: `custom-tools__${id}`,
          originalName: id,
        })),
      callTool: async () => 'ok',
    }

    const runtime = useChatRuntime({
      mcpServers: [
        {
          id: 'project-tools',
          name: 'Project Tools',
          baseUrl: '/mcp',
        },
      ],
      mcp: customMcp,
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'test',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              system_fingerprint: null,
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    expect(runtime.composer.mcp?.servers.value.map((item) => item.id)).toEqual(['project-tools', 'custom-tools'])
    expect(runtime.composer.mcp?.tools.value).toEqual({ 'custom-tools': [{ id: 'echo', name: 'echo', enabled: true }] })
  })

  it('routes dynamic registration to a direct adapter that provides the hook', async () => {
    const registerMcpServer = vi.fn().mockResolvedValue('custom-server')
    const customMcp: UseChatRuntimeMcpAdapter = {
      runtime: {
        servers: computed(() => [{ id: 'custom-tools', name: 'Custom Tools', installed: true, enabled: true }]),
        tools: computed(() => ({ 'custom-tools': [] })),
        registerMcpServer,
        addServer: () => undefined,
        removeServer: () => undefined,
        setServerEnabled: () => undefined,
        setToolEnabled: () => undefined,
      },
      listTools: async () => [],
      callTool: async () => 'ok',
    }
    const runtime = useChatRuntime({
      mcp: customMcp,
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: { responseProvider: async () => ({}) as ChatCompletion },
      },
    })

    await expect(
      runtime.composer.mcp?.registerMcpServer?.({
        name: 'Dynamic',
        type: 'streamableHttp',
        url: 'https://mcp.example.com',
      }),
    ).resolves.toBe('custom-server')
    expect(registerMcpServer).toHaveBeenCalledOnce()
  })

  it('composes a WebMCP adapter with external mcpServers', () => {
    const webmcp = createWebMcpAdapter({
      source: {
        listTools: async () => [{ name: 'echo' }],
        callTool: async () => 'ok',
      },
      server: { id: 'page-webmcp', name: 'Page WebMCP' },
    })

    const runtime = useChatRuntime({
      mcpServers: [{ id: 'project-tools', name: 'Project Tools', baseUrl: '/mcp' }],
      mcp: webmcp,
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'test',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              system_fingerprint: null,
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    expect(runtime.composer.mcp?.servers.value.map((item) => item.id)).toEqual(['project-tools', 'page-webmcp'])
  })

  it('supports the unified mcp configuration with servers and adapters', () => {
    const webmcp = createWebMcpAdapter({
      source: {
        listTools: async () => [{ name: 'echo' }],
        callTool: async () => 'ok',
      },
      server: { id: 'page-webmcp' },
    })

    const runtime = useChatRuntime({
      mcp: {
        servers: [{ id: 'project-tools', name: 'Project Tools', baseUrl: '/mcp' }],
        adapters: [webmcp],
      },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'test',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              system_fingerprint: null,
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    expect(runtime.composer.mcp?.servers.value.map((item) => item.id)).toEqual(['project-tools', 'page-webmcp'])
  })

  it('keeps ordinary chat available when a disabled WebMCP discovery fails', async () => {
    const listTools = vi.fn().mockRejectedValue(new Error('page tools unavailable'))
    const webmcp = createWebMcpAdapter({
      source: {
        listTools,
        callTool: async () => 'ok',
      },
      server: { id: 'page-webmcp' },
    })

    await vi.waitFor(() => expect(webmcp.runtime.servers.value[0]).toMatchObject({ enabled: false }))

    const runtime = useChatRuntime({
      mcp: { adapters: [webmcp] },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'ordinary-chat',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    await expect(runtime.actions.send({ text: 'hello' })).resolves.toBe(true)
    expect(listTools).toHaveBeenCalledOnce()
  })

  it('refreshes only enabled MCP servers when a disabled source fails', async () => {
    const disabledRefresh = vi.fn().mockRejectedValue(new Error('disabled source unavailable'))
    const healthyRefresh = vi.fn()
    const createAdapter = (
      serverId: string,
      enabled: boolean,
      refreshServer: () => Promise<void> | void,
    ): UseChatRuntimeMcpAdapter => ({
      runtime: {
        servers: computed(() => [{ id: serverId, name: serverId, installed: true, enabled }]),
        tools: computed(() => ({ [serverId]: [{ id: 'echo', name: 'echo', enabled: true }] })),
        addServer: () => undefined,
        removeServer: () => undefined,
        setServerEnabled: () => undefined,
        setToolEnabled: () => undefined,
      },
      listTools: async (serverIds, selectedToolIds) =>
        (selectedToolIds[serverIds[0]] ?? []).map((id) => ({
          serverId,
          id,
          name: `${serverId}__${id}`,
          originalName: id,
        })),
      callTool: async () => 'ok',
      refreshServer,
    })

    const runtime = useChatRuntime({
      mcp: {
        adapters: [
          createAdapter('disabled-webmcp', false, disabledRefresh),
          createAdapter('healthy-mcp', true, healthyRefresh),
        ],
      },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'healthy-chat',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    await expect(runtime.actions.send({ text: 'use healthy tools' })).resolves.toBe(true)
    expect(healthyRefresh).toHaveBeenCalledOnce()
    expect(disabledRefresh).not.toHaveBeenCalled()
  })

  it('refreshes a multi-server custom adapter once when it has no server-scoped refresh hook', async () => {
    const refresh = vi.fn()
    const serverIds = ['custom-a', 'custom-b']
    const adapter: UseChatRuntimeMcpAdapter = {
      runtime: {
        servers: computed(() => serverIds.map((id) => ({ id, name: id, installed: true, enabled: true }))),
        tools: computed(() =>
          Object.fromEntries(serverIds.map((serverId) => [serverId, [{ id: 'echo', name: 'echo', enabled: true }]])),
        ),
        addServer: () => undefined,
        removeServer: () => undefined,
        setServerEnabled: () => undefined,
        setToolEnabled: () => undefined,
      },
      listTools: async (requestedServerIds, selectedToolIds) =>
        requestedServerIds.flatMap((serverId) =>
          (selectedToolIds[serverId] ?? []).map((id) => ({
            serverId,
            id,
            name: `${serverId}__${id}`,
            originalName: id,
          })),
        ),
      callTool: async () => 'ok',
      refresh,
    }

    const runtime = useChatRuntime({
      mcp: { adapters: [adapter] },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async () =>
            ({
              id: 'custom-refresh-once',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
            }) as ChatCompletion,
        },
      },
    })

    await expect(runtime.actions.send({ text: 'use custom tools' })).resolves.toBe(true)
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('refreshes dynamic WebMCP tools before a follow-up request in the same turn', async () => {
    let tools = [{ name: 'navigate' }]
    const listeners = new Set<() => void>()
    const callTool = vi.fn(async (name: string) => {
      if (name === 'navigate' && !tools.some((tool) => tool.name === 'read-page')) {
        tools = [...tools, { name: 'read-page' }]
        listeners.forEach((listener) => listener())
      }
      return `${name} result`
    })
    const webmcp = createWebMcpAdapter({
      source: {
        listTools: async () => tools,
        callTool,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      },
      server: { id: 'page-webmcp' },
    })

    await vi.waitFor(() => expect(webmcp.runtime.tools.value['page-webmcp']).toHaveLength(1))

    const requestToolNames: string[][] = []
    let requestCount = 0
    const runtime = useChatRuntime({
      mcp: { adapters: [webmcp] },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async (requestBody) => {
            requestCount += 1
            requestToolNames.push(
              (requestBody.tools ?? []).flatMap((tool: { type: string; function?: { name: string } }) =>
                tool.type === 'function' ? [tool.function?.name ?? ''] : [],
              ),
            )

            if (requestCount === 1) {
              return {
                id: 'navigate-call',
                object: 'chat.completion',
                created: 0,
                model: 'test',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: '',
                      tool_calls: [
                        {
                          id: 'navigate-call',
                          type: 'function',
                          function: { name: 'page-webmcp__navigate', arguments: '{}' },
                        },
                      ],
                    },
                    finish_reason: 'tool_calls',
                  },
                ],
              } as ChatCompletion
            }

            if (requestCount === 2) {
              return {
                id: 'read-page-call',
                object: 'chat.completion',
                created: 0,
                model: 'test',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: '',
                      tool_calls: [
                        {
                          id: 'read-page-call',
                          type: 'function',
                          function: { name: 'page-webmcp__read-page', arguments: '{}' },
                        },
                      ],
                    },
                    finish_reason: 'tool_calls',
                  },
                ],
              } as ChatCompletion
            }

            return {
              id: 'done',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              choices: [{ index: 0, message: { role: 'assistant', content: 'done' }, finish_reason: 'stop' }],
            } as ChatCompletion
          },
        },
      },
    })

    await runtime.actions.send({ text: 'navigate and then read the page' })

    expect(requestToolNames[0]).toEqual(['page-webmcp__navigate'])
    expect(requestToolNames[1]).toEqual(['page-webmcp__navigate', 'page-webmcp__read-page'])
    expect(callTool).toHaveBeenNthCalledWith(1, 'navigate', {})
    expect(callTool).toHaveBeenNthCalledWith(2, 'read-page', {})
  })

  it('waits for asynchronous WebMCP discovery before the follow-up request', async () => {
    let tools = [{ name: 'navigate' }]
    let releaseRefresh!: () => void
    const listeners = new Set<() => void>()
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve
    })
    let listCalls = 0
    const webmcp = createWebMcpAdapter({
      source: {
        listTools: async () => {
          listCalls += 1
          if (listCalls === 2) await refreshGate
          return tools
        },
        callTool: async (name) => {
          if (name === 'navigate') {
            tools = [...tools, { name: 'read-page' }]
            listeners.forEach((listener) => listener())
          }
          return name + ' result'
        },
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      },
      server: { id: 'page-webmcp' },
    })

    await vi.waitFor(() => expect(webmcp.runtime.tools.value['page-webmcp']).toHaveLength(1))
    const requestToolNames: string[][] = []
    let requestCount = 0
    const runtime = useChatRuntime({
      mcp: { adapters: [webmcp] },
      conversation: {
        storage: createMemoryStorage(),
        useMessageOptions: {
          responseProvider: async (requestBody) => {
            requestCount += 1
            requestToolNames.push(
              (requestBody.tools ?? []).flatMap((tool: { type: string; function?: { name: string } }) =>
                tool.type === 'function' ? [tool.function?.name ?? ''] : [],
              ),
            )
            if (requestCount === 1) {
              return {
                id: 'navigate-call',
                object: 'chat.completion',
                created: 0,
                model: 'test',
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: '',
                      tool_calls: [
                        {
                          id: 'navigate-call',
                          type: 'function',
                          function: { name: 'page-webmcp__navigate', arguments: '{}' },
                        },
                      ],
                    },
                    finish_reason: 'tool_calls',
                  },
                ],
              } as ChatCompletion
            }
            return {
              id: 'done',
              object: 'chat.completion',
              created: 0,
              model: 'test',
              choices: [{ index: 0, message: { role: 'assistant', content: 'done' }, finish_reason: 'stop' }],
            } as ChatCompletion
          },
        },
      },
    })

    const send = runtime.actions.send({ text: 'navigate and then read the page' })
    await vi.waitFor(() => expect(listCalls).toBe(2))
    releaseRefresh()
    await send

    expect(requestToolNames[1]).toEqual(['page-webmcp__navigate', 'page-webmcp__read-page'])
  })

  it('rejects configuring unified mcp.servers together with legacy mcpServers', () => {
    expect(() =>
      useChatRuntime({
        mcp: { servers: [] },
        mcpServers: [],
        conversation: {
          storage: createMemoryStorage(),
          useMessageOptions: { responseProvider: async () => ({}) as ChatCompletion },
        },
      }),
    ).toThrow('mcp.servers and mcpServers cannot be configured at the same time')
  })
})

it('sends provider-specific requests and keeps the original message configuration when the composer changes', async () => {
  const reasoning: ModelSelectorField = {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    options: [
      { value: 'off', label: '关闭' },
      { value: 'high', label: '高' },
    ],
  }
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () =>
        new Response(
          'data: {"choices":[{"index":0,"delta":{"content":"OK"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
        ),
    )
  try {
    const runtime = useChatRuntime({
      conversation: { storage: createMemoryStorage() },
      modelProviders: [
        {
          type: 'qwen',
          models: [
            {
              id: 'qwen3.7-flash',
              label: 'Qwen',
              features: [reasoning, { key: 'search', label: '联网搜索', type: 'switch' }],
            },
          ],
        },
        { type: 'deepseek', models: [{ id: 'deepseek-v4-pro', label: 'DeepSeek', features: [reasoning] }] },
      ],
    })
    const model = runtime.composer.model!
    model.setFeatureValue!({ modelId: 'qwen3.7-flash', key: 'reasoning', value: 'high' })
    model.setFeatureValue!({ modelId: 'qwen3.7-flash', key: 'search', value: true })
    await expect(runtime.actions.send({ text: 'First question' })).resolves.toBe(true)

    model.select('deepseek-v4-pro')
    await expect(runtime.actions.send({ text: 'Second question' })).resolves.toBe(true)

    const [qwenRequest, deepseekRequest] = fetch.mock.calls.map(([, init]) => JSON.parse(init!.body as string))
    expect(qwenRequest).toMatchObject({
      model: 'qwen3.7-flash',
      enable_thinking: true,
      thinking_budget: 8192,
      enable_search: true,
    })
    expect(deepseekRequest).toMatchObject({
      model: 'deepseek-v4-pro',
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
    })
    expect(runtime.activeConversation.value?.messages[0].metadata?.[CHAT_RUN_CONFIG_METADATA_KEY]).toMatchObject({
      modelId: 'qwen3.7-flash',
      featureValues: { reasoning: 'high', search: true },
    })
  } finally {
    fetch.mockRestore()
  }
})
