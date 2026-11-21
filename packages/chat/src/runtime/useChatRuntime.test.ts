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
        addServer: () => undefined,
        removeServer: () => undefined,
        setServerEnabled: () => undefined,
        setToolEnabled: () => undefined,
      },
      listTools: async () => [],
      callTool: async () => 'ok',
      registerMcpServer,
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
      id: 'page-webmcp',
      name: 'Page WebMCP',
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
      id: 'page-webmcp',
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
