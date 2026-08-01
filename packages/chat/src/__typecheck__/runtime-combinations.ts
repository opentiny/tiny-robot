import { computed, shallowRef } from 'vue'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatMcpRuntime,
  ChatModelRuntime,
  ChatRunConfig,
  ChatRuntime,
} from '../types'

const conversations = shallowRef<readonly ChatConversationInfo[]>([])
const activeConversation = shallowRef<ChatConversation | null>(null)
const disabled = shallowRef(false)

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

const emptyRunConfig = computed<Readonly<ChatRunConfig>>(() => ({}))

const mcpRunConfig = computed<Readonly<ChatRunConfig>>(() => ({
  mcp: {
    serverIds: mcp.servers.value.filter((item) => item.enabled).map((item) => item.id),
    toolIds: Object.fromEntries(
      mcp.servers.value
        .filter((item) => item.enabled)
        .map((server) => [
          server.id,
          (mcp.tools.value[server.id] ?? []).filter((tool) => tool.enabled).map((tool) => tool.id),
        ]),
    ),
  },
}))

function createRuntime(composer: ChatRuntime['composer']) {
  return {
    conversations,
    activeConversation,
    composer,
    actions,
  } satisfies ChatRuntime
}

export const runtimeWithoutModelOrMcp = createRuntime({
  disabled,
  runConfig: emptyRunConfig,
})

export const runtimeWithModelOnly = createRuntime({
  disabled,
  model,
  runConfig: computed(() => ({
    modelId: model.selectedId.value ?? undefined,
    features: model.features.value,
    reasoning: reasoning.value,
  })),
})

export const runtimeWithMcpOnly = createRuntime({
  disabled,
  mcp,
  runConfig: mcpRunConfig,
})

export const runtimeWithModelAndMcp = createRuntime({
  disabled,
  model,
  mcp,
  runConfig: computed(() => ({
    modelId: model.selectedId.value ?? undefined,
    mcp: mcpRunConfig.value.mcp,
    features: model.features.value,
    reasoning: reasoning.value,
  })),
})
