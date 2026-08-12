import { shallowRef } from 'vue'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatMcpRuntime,
  ChatModelRuntime,
  ChatRuntime,
} from '../../src/types'
import type { ChatMcpToolInfo } from '../../src/types'

export function createRuntimeFixture(overrides: Partial<ChatRuntime['actions']> = {}) {
  const conversations = shallowRef<readonly ChatConversationInfo[]>([])
  const activeConversation = shallowRef<ChatConversation | null>(null)
  const modelOptions = shallowRef([{ id: 'model-a', label: 'Model A', capabilities: { thinking: true, search: true } }])
  const selectedId = shallowRef<string | null>('model-a')
  const features = shallowRef({ thinking: false, search: false })
  const servers = shallowRef([{ id: 'server-a', name: 'Server A', installed: true, enabled: true }])
  const tools = shallowRef<Record<string, ChatMcpToolInfo[]>>({
    'server-a': [{ id: 'tool-a', name: 'Tool A', enabled: true }],
  })
  const calls = {
    send: 0,
    abort: 0,
    createConversation: 0,
    switchConversation: 0,
    renameConversation: 0,
    deleteConversation: 0,
    select: 0,
    setFeature: 0,
    addServer: 0,
    removeServer: 0,
    setServerEnabled: 0,
    setToolEnabled: 0,
  }

  const model: ChatModelRuntime = {
    options: modelOptions,
    selectedId,
    features,
    select: async (id) => {
      calls.select++
      selectedId.value = id
    },
    setFeature: async (id, enabled) => {
      calls.setFeature++
      features.value = { ...features.value, [id]: enabled }
    },
  }
  const mcp: ChatMcpRuntime = {
    servers,
    tools,
    addServer: async () => {
      calls.addServer++
    },
    removeServer: async () => {
      calls.removeServer++
    },
    setServerEnabled: async (id, enabled) => {
      calls.setServerEnabled++
      servers.value = servers.value.map((server) => (server.id === id ? { ...server, enabled } : server))
    },
    setToolEnabled: async (serverId, toolId, enabled) => {
      calls.setToolEnabled++
      tools.value = {
        ...tools.value,
        [serverId]: tools.value[serverId]?.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
      }
    },
  }
  const actions: ChatRuntime['actions'] = {
    send: async () => {
      calls.send++
      return true
    },
    abort: async () => {
      calls.abort++
    },
    createConversation: async () => {
      calls.createConversation++
    },
    switchConversation: async () => {
      calls.switchConversation++
    },
    renameConversation: async () => {
      calls.renameConversation++
    },
    deleteConversation: async () => {
      calls.deleteConversation++
    },
    ...overrides,
  }

  return {
    runtime: { conversations, activeConversation, composer: { model, mcp }, actions } satisfies ChatRuntime,
    model,
    mcp,
    calls,
  }
}
