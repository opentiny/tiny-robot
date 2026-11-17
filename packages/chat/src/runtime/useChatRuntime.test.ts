import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
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
