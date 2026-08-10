import { computed, shallowRef } from 'vue'
import type { ChatConversation, ChatConversationInfo, ChatMcpRuntime, ChatModelRuntime, ChatRuntime } from '../types'

const conversations = shallowRef<readonly ChatConversationInfo[]>([])
const activeConversation = shallowRef<ChatConversation | null>(null)
const actions: ChatRuntime['actions'] = {
  send: async () => true,
  createConversation: async () => {},
  switchConversation: async () => {},
  renameConversation: async () => {},
  deleteConversation: async () => {},
}

const features = shallowRef({ thinking: true, search: false })
const reasoning = computed(() => ({
  enabled: Boolean(features.value.thinking),
  effort: features.value.thinking ? ('high' as const) : undefined,
}))

const model: ChatModelRuntime = {
  options: shallowRef([{ id: 'deepseek-chat', label: 'DeepSeek Chat' }]),
  selectedId: shallowRef<string | null>('deepseek-chat'),
  features,
  reasoning,
  select: async () => {},
  setFeature: async () => {},
}

const mcp: ChatMcpRuntime = {
  servers: shallowRef([{ id: 'browser', name: 'Browser', installed: true, enabled: true }]),
  tools: shallowRef({
    browser: [{ id: 'search', name: 'Search', enabled: true }],
  }),
  addServer: async () => {},
  removeServer: async () => {},
  setServerEnabled: async () => {},
  setToolEnabled: async () => {},
}

function createRuntime(composer: ChatRuntime['composer']) {
  return {
    conversations,
    activeConversation,
    composer,
    actions,
  } satisfies ChatRuntime
}

export const runtimeWithoutModelOrMcp = createRuntime({})

export const runtimeWithModelOnly = createRuntime({
  model,
})

export const runtimeWithMcpOnly = createRuntime({
  mcp,
})

export const runtimeWithModelAndMcp = createRuntime({
  model,
  mcp,
})
