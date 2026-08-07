<script setup lang="ts">
import { computed, h, reactive, shallowRef } from 'vue'
import { IconAi, IconAtom, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  TrChatUI,
  type ChatConversationInfo,
  type ChatMcpServerView,
  type ChatMcpToolMap,
  type ChatMessageItem,
  type ChatSubmitPayload,
  type ChatUIData,
  type ChatUIOptions,
} from '../../../src'

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
const selectedModelId = shallowRef<string | null>('deepseek-chat')
const selectingModel = shallowRef(false)
const pendingFeatureIds = shallowRef<string[]>([])
const modelFeatures = shallowRef<Record<string, boolean>>({
  thinking: true,
  search: false,
})
const mcpServers = shallowRef<ChatMcpServerView[]>([
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
const mcpTools = shallowRef<ChatMcpToolMap>({
  'model-context-protocol-mcp': [
    { id: 'search', name: 'Search', description: 'Search documentation.', enabled: true },
    { id: 'fetch', name: 'Fetch', description: 'Fetch page content.', enabled: true },
  ],
})

const activeConversation = computed(
  () => conversations.value.find((conversation) => conversation.id === activeConversationId.value) ?? null,
)
const messages = computed(() => messagesByConversation[activeConversationId.value] ?? [])
const aiAvatar = h(IconAi, { style: { fontSize: '28px' } }) as never
const userAvatar = h(IconUser, { style: { fontSize: '28px' } }) as never
const data = computed<ChatUIData>(() => ({
  conversation: {
    items: conversations.value,
    activeId: activeConversationId.value,
    title: activeConversation.value?.title || '新对话',
  },
  bubble: {
    messages: messages.value,
  },
  sender: {
    inputValue: inputValue.value,
    loading: loading.value,
    disabled: disabled.value,
    submitDisabled: inputValue.value.trim().length === 0,
  },
  model: {
    options: [
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
        label: 'Qwen Plus With A Very Long Display Name',
        capabilities: {
          thinking: true,
          search: true,
        },
        metadata: {
          icon: IconAi,
        },
      },
    ],
    selectedId: selectedModelId.value,
    features: modelFeatures.value,
    selecting: selectingModel.value,
    pendingFeatureIds: pendingFeatureIds.value,
  },
  mcp: {
    servers: mcpServers.value,
    tools: mcpTools.value,
  },
}))
const ui = computed<ChatUIOptions>(() => ({
  layout: {
    contentMaxWidth: 980,
    panelPadding: 12,
    panelGap: 12,
    rightAside: {
      width: 320,
      defaultOpen: true,
      onOpenChange: ({ open }) => {
        console.info('[ChatUI demo] right aside open:', open)
      },
    },
  },
  prompts: {
    wrap: true,
    items: [
      { id: 'intro', label: '介绍一下 TinyRobot Chat' },
      { id: 'vue', label: '生成一个 Vue 组件示例' },
      { id: 'boundary', label: '解释 runtime 和 UI 的职责' },
    ],
    onItemClick: (_event, item) => {
      console.info('[ChatUI demo] prompt:', item.id)
    },
  },
  bubble: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        user: { placement: 'end', avatar: userAvatar },
        assistant: { placement: 'start', avatar: aiAvatar },
        system: { hidden: true },
      },
      onStateChange: (payload) => {
        console.info('[ChatUI demo] bubble state:', payload)
      },
      onBubbleEvent: (payload) => {
        console.info('[ChatUI demo] bubble event:', payload)
      },
    },
  },
  sender: {
    mode: 'multiple',
    clearable: true,
    maxLength: 1000,
    placeholder: loading.value ? '思考中...' : '请输入你的问题...',
    showWordLimit: true,
    onInput: (value) => {
      inputValue.value = value
    },
  },
  model: {
    onSelect: ({ id }) => {
      selectedModelId.value = id
    },
    onFeatureChange: ({ id, enabled }) => {
      modelFeatures.value = {
        ...modelFeatures.value,
        [id]: enabled,
      }
    },
  },
  mcp: {
    onAddServer: ({ id }) => {
      updateServer(id, { installed: true, enabled: true })
      loadMcpTools(id)
    },
    onRemoveServer: ({ id }) => {
      updateServer(id, { installed: false, enabled: false })
    },
    onServerEnabledChange: ({ id, enabled }) => {
      updateServer(id, { enabled })

      if (enabled) {
        loadMcpTools(id)
      }
    },
    onToolEnabledChange: ({ serverId, toolId, enabled }) => {
      mcpTools.value = {
        ...mcpTools.value,
        [serverId]: (mcpTools.value[serverId] ?? []).map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
      }
    },
  },
}))

function updateServer(id: string, patch: Partial<(typeof mcpServers.value)[number]>) {
  mcpServers.value = mcpServers.value.map((server) => (server.id === id ? { ...server, ...patch } : server))
}

function loadMcpTools(serverId: string) {
  if (mcpTools.value[serverId]) {
    return
  }

  mcpTools.value = {
    ...mcpTools.value,
    [serverId]: [{ id: 'open', name: 'Open', description: 'Open a page.', enabled: true }],
  }
}

function toggleMessages() {
  const conversationId = activeConversationId.value

  if (!conversationId) {
    return
  }

  if ((messagesByConversation[conversationId] ?? []).length > 0) {
    messagesByConversation[conversationId] = []
    return
  }

  messagesByConversation[conversationId] = [
    { id: `user-${Date.now()}`, role: 'user', content: '这是一条用于验证空态切换的消息。' },
    { id: `assistant-${Date.now()}`, role: 'assistant', content: '收到，当前已切换到消息态。' },
  ]
}

function togglePendingFeature() {
  pendingFeatureIds.value = pendingFeatureIds.value.length > 0 ? [] : ['thinking']
}

function toggleMcpServerLoading() {
  const server = mcpServers.value.find((item) => item.id === 'browser')

  if (!server) {
    return
  }

  updateServer(server.id, { loading: !server.loading })
}

function createConversation() {
  const id = `session-${Date.now()}`

  conversations.value = [{ id, title: '新对话', updatedAt: Date.now() }, ...conversations.value]
  messagesByConversation[id] = []
  activeConversationId.value = id
  inputValue.value = ''
}

function switchConversation(payload: { id: string }) {
  activeConversationId.value = payload.id
  inputValue.value = ''
}

function renameConversation(payload: { id: string; title: string }) {
  conversations.value = conversations.value.map((conversation) =>
    conversation.id === payload.id
      ? { ...conversation, title: payload.title.trim() || '新对话', updatedAt: Date.now() }
      : conversation,
  )
}

function deleteConversation(payload: { id: string }) {
  delete messagesByConversation[payload.id]
  conversations.value = conversations.value.filter((conversation) => conversation.id !== payload.id)

  if (activeConversationId.value === payload.id) {
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
  <TrChatUI
    :data="data"
    :ui="ui"
    @create-conversation="createConversation"
    @switch-conversation="switchConversation"
    @rename-conversation="renameConversation"
    @delete-conversation="deleteConversation"
    @submit="submit"
    @cancel="loading = false"
    @clear="inputValue = ''"
  >
    <template #layout-right-aside-title>
      <span class="data-title">Data Case</span>
    </template>

    <template #layout-right-aside>
      <aside class="data-panel">
        <strong>普通 Data 驱动</strong>
        <span>Model、MCP、messages、sender 状态都来自本地 refs/computed。</span>

        <div class="data-panel__controls">
          <button type="button" @click="toggleMessages">
            {{ messages.length > 0 ? '切换为空态' : '切换为消息态' }}
          </button>
          <button type="button" @click="loading = !loading">
            {{ loading ? '关闭 loading' : '开启 loading' }}
          </button>
          <button type="button" @click="disabled = !disabled">
            {{ disabled ? '关闭 disabled' : '开启 disabled' }}
          </button>
          <button type="button" @click="selectingModel = !selectingModel">
            {{ selectingModel ? '关闭 model selecting' : '开启 model selecting' }}
          </button>
          <button type="button" @click="togglePendingFeature">
            {{ pendingFeatureIds.length > 0 ? '关闭 feature pending' : '开启 feature pending' }}
          </button>
          <button type="button" @click="toggleMcpServerLoading">切换 MCP loading</button>
        </div>
      </aside>
    </template>

    <template #welcome-footer>
      <span class="data-slot-tip">Welcome footer slot</span>
    </template>

    <template #prompts-footer>
      <span class="data-slot-tip">Prompts footer slot</span>
    </template>

    <template #bubble-prefix>
      <span class="data-bubble-tip">Bubble prefix slot</span>
    </template>

    <template #bubble-suffix>
      <span class="data-bubble-tip">Bubble suffix slot</span>
    </template>

    <template #bubble-after>
      <span class="data-bubble-tip">Bubble after slot</span>
    </template>

    <template #bubble-content-footer>
      <span class="data-bubble-tip">Bubble content footer slot</span>
    </template>
  </TrChatUI>
</template>

<style scoped>
.data-title {
  min-width: 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-panel {
  display: grid;
  gap: 8px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.data-panel__controls {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.data-panel__controls button {
  height: 28px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 6px;
  background: var(--tr-container-bg-default);
  color: var(--tr-text-primary);
  cursor: pointer;
}

.data-bubble-tip {
  color: var(--tr-text-tertiary);
  font-size: 12px;
}

.data-slot-tip {
  color: var(--tr-text-tertiary);
  font-size: 12px;
}
</style>
