<script setup lang="ts">
import { computed, h, reactive, shallowRef } from 'vue'
import { ThemeProvider as TrThemeProvider } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  TrChatUI,
  type ChatConversationInfo,
  type ChatMcpRuntime,
  type ChatMcpToolState,
  type ChatMessageItem,
  type ChatModelRuntime,
  type ChatSubmitPayload,
  type ChatUi,
  type ChatUIState,
} from '../../src'

// Mock data layer: real applications can replace these refs and actions with a runtime adapter.
const conversations = shallowRef<ChatConversationInfo[]>([
  { id: 'welcome', title: '欢迎使用 TinyRobot', updatedAt: 3 },
  { id: 'runtime', title: 'Runtime 与 UI 边界', updatedAt: 2 },
  { id: 'vue', title: 'Vue 组件示例', updatedAt: 1 },
])
const messagesByConversation = reactive<Record<string, ChatMessageItem[]>>({
  welcome: [],
  runtime: [
    { id: 'runtime-1', role: 'user', content: 'runtime 和 UI 应该如何分工？' },
    { id: 'runtime-2', role: 'assistant', content: 'runtime 管理数据和动作，UI 只负责展示与派发事件。' },
  ],
  vue: [
    { id: 'vue-1', role: 'system', content: 'You are a helpful assistant.' },
    { id: 'vue-2', role: 'assistant', content: '可以直接组合 TinyRobot 原子组件完成 Chat UI。' },
  ],
})
const activeConversationId = shallowRef('welcome')
const inputValue = shallowRef('')
const loading = shallowRef(false)
const disabled = shallowRef(false)
const colorMode = shallowRef<'light' | 'dark'>('light')
const hasApiConfig = shallowRef(false)

const modelOptions = shallowRef([
  {
    id: 'deepseek-chat',
    label: 'DeepSeek Chat',
    capabilities: {
      thinking: true,
      search: false,
    },
    metadata: {
      icon: IconAtom,
    },
  },
  {
    id: 'qwen-plus',
    label: 'Qwen Plus',
    capabilities: {
      thinking: true,
      search: true,
    },
    metadata: {
      icon: IconAi,
    },
  },
])
const selectedModelId = shallowRef<string | null>('deepseek-chat')
const modelFeatures = shallowRef<Record<string, boolean>>({
  thinking: true,
  search: false,
})
const mcpServers = shallowRef([
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    installed: true,
    enabled: true,
    metadata: {
      icon: 'https://modelcontextprotocol.io/favicon.ico',
    },
  },
  {
    id: 'browser',
    name: 'Browser',
    description: 'Browser tools',
    installed: false,
    enabled: false,
    metadata: {
      icon: 'https://modelcontextprotocol.io/favicon.ico',
    },
  },
])
const mcpTools = shallowRef<ChatMcpToolState>({
  'model-context-protocol-mcp': [
    { id: 'search', name: 'Search', description: 'Search documentation.', enabled: true },
    { id: 'fetch', name: 'Fetch', description: 'Fetch page content.', enabled: true },
  ],
  browser: [{ id: 'open', name: 'Open', description: 'Open a page.', enabled: true }],
})

const activeConversation = computed(
  () => conversations.value.find((conversation) => conversation.id === activeConversationId.value) ?? null,
)
const messages = computed(() => messagesByConversation[activeConversationId.value] ?? [])
const state = computed<ChatUIState>(() => ({
  conversation: {
    items: conversations.value,
    activeId: activeConversationId.value,
    title: activeConversation.value?.title || '新对话',
  },
  messages: messages.value,
  composer: {
    value: inputValue.value,
    loading: loading.value,
    disabled: disabled.value,
    submitDisabled: inputValue.value.trim().length === 0,
  },
}))
const aiAvatar = h(IconAi, { style: { fontSize: '28px' } }) as never
const userAvatar = h(IconUser, { style: { fontSize: '28px' } }) as never
const model: ChatModelRuntime = {
  options: computed(() => modelOptions.value),
  selectedId: computed(() => selectedModelId.value),
  select(id) {
    selectedModelId.value = id
  },
  features: computed(() => modelFeatures.value),
  setFeature(id, enabled) {
    modelFeatures.value = {
      ...modelFeatures.value,
      [id]: enabled,
    }
  },
}
const mcp: ChatMcpRuntime = {
  servers: computed(() => mcpServers.value),
  tools: computed(() => mcpTools.value),
  addServer(id) {
    updateServer(id, { installed: true, enabled: true })
  },
  removeServer(id) {
    updateServer(id, { installed: false, enabled: false })
  },
  setServerEnabled(id, enabled) {
    updateServer(id, { enabled })
  },
  async loadTools() {},
  setToolEnabled(serverId, toolId, enabled) {
    mcpTools.value = {
      ...mcpTools.value,
      [serverId]: (mcpTools.value[serverId] ?? []).map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
    }
  },
}
const ui = computed<ChatUi>(() => ({
  layout: {
    contentMaxWidth: 980,
    panelPadding: 12,
    panelGap: 12,
    leftAside: {
      mode: 'dock',
      width: 300,
      collapsedWidth: 56,
      defaultOpen: false,
    },
  },
  prompts: {
    wrap: true,
    items: [
      { id: 'intro', label: '介绍一下 TinyRobot Chat' },
      { id: 'vue', label: '生成一个 Vue 组件示例' },
      { id: 'boundary', label: '解释 runtime 和 UI 的职责' },
    ],
  },
  bubbleList: {
    autoScroll: true,
    roleConfigs: {
      user: { placement: 'end', avatar: userAvatar },
      assistant: { placement: 'start', avatar: aiAvatar },
      system: { hidden: true },
    },
  },
  sender: {
    mode: 'multiple',
    clearable: true,
    maxLength: 1000,
    placeholder: loading.value ? '思考中...' : '请输入你的问题...',
    showWordLimit: true,
  },
  composer: {
    model,
    mcp,
  },
}))

function updateServer(id: string, patch: Partial<(typeof mcpServers.value)[number]>) {
  mcpServers.value = mcpServers.value.map((server) => (server.id === id ? { ...server, ...patch } : server))
}

function createConversation() {
  const id = `session-${Date.now()}`

  conversations.value = [{ id, title: '新对话', updatedAt: Date.now() }, ...conversations.value]
  messagesByConversation[id] = []
  activeConversationId.value = id
  inputValue.value = ''
}

function switchConversation(id: string) {
  activeConversationId.value = id
  inputValue.value = ''
}

function renameConversation(id: string, title: string) {
  conversations.value = conversations.value.map((conversation) =>
    conversation.id === id ? { ...conversation, title: title.trim() || '新对话', updatedAt: Date.now() } : conversation,
  )
}

function deleteConversation(id: string) {
  delete messagesByConversation[id]
  conversations.value = conversations.value.filter((conversation) => conversation.id !== id)

  if (activeConversationId.value === id) {
    activeConversationId.value = conversations.value[0]?.id ?? ''
  }
}

function submit(payload: ChatSubmitPayload) {
  const content = payload.text.trim()

  if (!content) {
    return
  }

  if (!activeConversation.value) {
    createConversation()
  }

  const conversationId = activeConversationId.value
  const nextMessages = messagesByConversation[conversationId] ?? []

  nextMessages.push(
    { id: `user-${Date.now()}`, role: 'user', content },
    { id: `assistant-${Date.now()}`, role: 'assistant', content: `Mock 回复：${content}` },
  )
  messagesByConversation[conversationId] = nextMessages
  conversations.value = conversations.value.map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, title: conversation.title || content.slice(0, 24), updatedAt: Date.now() }
      : conversation,
  )
  inputValue.value = ''
}
</script>

<template>
  <TrThemeProvider v-model:color-mode="colorMode">
    <TrChatUI
      :state="state"
      :ui="ui"
      @create-conversation="createConversation"
      @switch-conversation="switchConversation"
      @rename-conversation="renameConversation"
      @delete-conversation="deleteConversation"
      @update-composer-value="inputValue = $event"
      @submit="submit"
      @cancel="loading = false"
      @clear="inputValue = ''"
    >
      <template v-if="!hasApiConfig" #notice>
        <p class="config-warning">缺少 API 配置，请在 <code>.env</code> 中设置当前模型服务商对应的 Key。</p>
      </template>
    </TrChatUI>
  </TrThemeProvider>
</template>

<style scoped>
.config-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--tr-color-warning-light);
  color: var(--tr-color-warning);
  font-size: 14px;
}
</style>
