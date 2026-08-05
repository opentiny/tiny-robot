<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { h } from 'vue'
import { IconAi, IconAtom, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  TrChatUI,
  type ChatConversationInfo,
  type ChatMcpToolMap,
  type ChatMessageItem,
  type ChatSubmitPayload,
  type ChatUIOptions,
  type ChatViewState,
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
const state = computed<ChatViewState>(() => ({
  conversation: {
    items: conversations.value,
    activeId: activeConversationId.value,
    title: activeConversation.value?.title || '新对话',
  },
  messages: messages.value,
  composer: {
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
  },
  prompts: {
    wrap: true,
    items: [
      { id: 'intro', label: '介绍一下 TinyRobot Chat' },
      { id: 'vue', label: '生成一个 Vue 组件示例' },
      { id: 'boundary', label: '解释 runtime 和 UI 的职责' },
    ],
  },
  messages: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        user: { placement: 'end', avatar: userAvatar },
        assistant: { placement: 'start', avatar: aiAvatar },
        system: { hidden: true },
      },
    },
  },
  composer: {
    sender: {
      mode: 'multiple',
      clearable: true,
      maxLength: 1000,
      placeholder: loading.value ? '思考中...' : '请输入你的问题...',
      showWordLimit: true,
    },
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

function selectModel(payload: { id: string | null }) {
  selectedModelId.value = payload.id
}

function updateModelFeature(payload: { id: string; enabled: boolean }) {
  modelFeatures.value = {
    ...modelFeatures.value,
    [payload.id]: payload.enabled,
  }
}

function addMcpServer(payload: { id: string }) {
  updateServer(payload.id, { installed: true, enabled: true })
}

function removeMcpServer(payload: { id: string }) {
  updateServer(payload.id, { installed: false, enabled: false })
}

function loadMcpTools(payload: { serverId: string }) {
  if (mcpTools.value[payload.serverId]) {
    return
  }

  mcpTools.value = {
    ...mcpTools.value,
    [payload.serverId]: [{ id: 'open', name: 'Open', description: 'Open a page.', enabled: true }],
  }
}

function updateMcpServerEnabled(payload: { id: string; enabled: boolean }) {
  updateServer(payload.id, { enabled: payload.enabled })
}

function updateMcpToolEnabled(payload: { serverId: string; toolId: string; enabled: boolean }) {
  mcpTools.value = {
    ...mcpTools.value,
    [payload.serverId]: (mcpTools.value[payload.serverId] ?? []).map((tool) =>
      tool.id === payload.toolId ? { ...tool, enabled: payload.enabled } : tool,
    ),
  }
}
</script>

<template>
  <TrChatUI
    v-model:composer-value="inputValue"
    :state="state"
    :ui="ui"
    @create-conversation="createConversation"
    @switch-conversation="switchConversation"
    @rename-conversation="renameConversation"
    @delete-conversation="deleteConversation"
    @submit="submit"
    @cancel="loading = false"
    @clear="inputValue = ''"
    @select-model="selectModel"
    @update-model-feature="updateModelFeature"
    @add-mcp-server="addMcpServer"
    @remove-mcp-server="removeMcpServer"
    @load-mcp-tools="loadMcpTools"
    @update-mcp-server-enabled="updateMcpServerEnabled"
    @update-mcp-tool-enabled="updateMcpToolEnabled"
  />
</template>
