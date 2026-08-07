import { computed, shallowRef } from 'vue'
import type { ChatConversation, ChatConversationInfo, ChatMcpRuntime, ChatModelRuntime, ChatRuntime } from '../types'

const conversations = shallowRef<readonly ChatConversationInfo[]>([])
const activeConversation = shallowRef<ChatConversation | null>(null)
const actions: ChatRuntime['actions'] = {
  send: async () => {},
  createConversation: async () => {},
  switchConversation: async () => {},
  renameConversation: async () => {},
  deleteConversation: async () => {},
}

const model: ChatModelRuntime = {
  options: shallowRef([{ id: 'deepseek-chat', label: 'DeepSeek Chat' }]),
  selectedId: shallowRef<string | null>('deepseek-chat'),
  select: async () => {},
  features: shallowRef({ thinking: true, search: false }),
  setFeature: async () => {},
}
const reasoning = computed(() => ({
  enabled: Boolean(model.features.value.thinking),
  effort: model.features.value.thinking ? ('high' as const) : undefined,
}))

const mcp: ChatMcpRuntime = {
  servers: shallowRef([{ id: 'browser', name: 'Browser', installed: true, enabled: true }]),
  tools: shallowRef({
    browser: [{ id: 'search', name: 'Search', enabled: true }],
  }),
  addServer: async () => {},
  removeServer: async () => {},
  setServerEnabled: async () => {},
  loadTools: async () => {},
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
  runConfig: computed(() => ({
    reasoning: reasoning.value,
  })),
})

export const runtimeWithMcpOnly = createRuntime({
  mcp,
})

export const runtimeWithModelAndMcp = createRuntime({
  model,
  mcp,
  runConfig: computed(() => ({
    reasoning: reasoning.value,
  })),
})
