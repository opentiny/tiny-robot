<script setup lang="ts">
import { computed, shallowRef, toRef } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatInput } from '@/composables/useChatInput'
import type {
  ChatAsideOpenChangePayload,
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryActionPayload,
  ChatMcpServerView,
  ChatMcpToolView,
  ChatMcpView,
  ChatModelView,
  ChatRuntime,
  ChatSubmitPayload,
  ChatUIEmits,
  ChatUIData,
  ChatUIOptions,
  ChatPromptClickPayload,
} from '@/types'

const props = defineProps<{
  runtime: ChatRuntime
  ui?: ChatUIOptions
  title?: string
}>()

const emit =
  defineEmits<
    Pick<
      ChatUIEmits,
      | 'history-action'
      | 'prompt-click'
      | 'bubble-state-change'
      | 'bubble-event'
      | 'left-aside-open-change'
      | 'right-aside-open-change'
    >
  >()

const runtimeRef = toRef(() => props.runtime)
const input = useChatInput(runtimeRef)

const activeConversation = computed(() => runtimeRef.value.activeConversation.value)
const conversationItems = computed(() => runtimeRef.value.conversations.value)
const activeMessages = computed(() => activeConversation.value?.messages ?? [])
const requestState = computed(() => activeConversation.value?.requestState ?? 'idle')
const requestView = computed(() => {
  const active = activeConversation.value

  return active
    ? {
        state: active.requestState,
        processingState: active.processingState,
        error: active.lastError ?? undefined,
      }
    : undefined
})
const senderDisabled = computed(() => {
  return Boolean(runtimeRef.value.composer.disabled?.value)
})
const senderSubmitDisabled = computed(() => Boolean(runtimeRef.value.composer.submitDisabled?.value))
const currentTitle = computed(() => props.title || activeConversation.value?.title)
const modelSelecting = shallowRef(false)
const pendingModelFeatureIds = shallowRef<ReadonlySet<string>>(new Set())
const pendingMcpServerIds = shallowRef<ReadonlySet<string>>(new Set())
const pendingMcpToolIds = shallowRef<ReadonlySet<string>>(new Set())

const modelView = computed<ChatModelView | undefined>(() => {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model) {
    return undefined
  }

  return {
    options: model.options.value,
    selectedId: model.selectedId.value,
    features: model.features.value,
    selecting: modelSelecting.value,
    pendingFeatureIds: [...pendingModelFeatureIds.value],
  }
})

const mcpView = computed<ChatMcpView | undefined>(() => {
  const mcp: ChatRuntime['composer']['mcp'] = runtimeRef.value.composer.mcp

  if (!mcp) {
    return undefined
  }

  const tools: Record<string, ChatMcpToolView[]> = {}

  for (const [serverId, serverTools] of Object.entries(mcp.tools.value)) {
    if (!serverTools) {
      continue
    }

    tools[serverId] = serverTools.map(
      (tool): ChatMcpToolView => ({
        ...tool,
        loading: pendingMcpToolIds.value.has(getToolKey(serverId, tool.id)),
      }),
    )
  }

  return {
    servers: mcp.servers.value.map(
      (server): ChatMcpServerView => ({
        ...server,
        loading: Boolean(server.loading || pendingMcpServerIds.value.has(server.id)),
      }),
    ),
    tools,
  }
})

const data = computed<ChatUIData>(() => ({
  conversation: {
    items: conversationItems.value,
    activeId: activeConversation.value?.id ?? null,
    title: currentTitle.value,
  },
  bubble: {
    messages: activeMessages.value,
  },
  sender: {
    loading: requestState.value === 'processing',
    disabled: senderDisabled.value,
    submitDisabled: senderSubmitDisabled.value,
  },
  request: requestView.value,
  model: modelView.value,
  mcp: mcpView.value,
}))

function getRuntimeMcp(): ChatRuntime['composer']['mcp'] {
  return runtimeRef.value.composer.mcp
}

function getToolKey(serverId: string, toolId: string) {
  return `${serverId}:${toolId}`
}

function setPendingId(target: { value: ReadonlySet<string> }, id: string, pending: boolean) {
  const next = new Set(target.value)

  if (pending) {
    next.add(id)
  } else {
    next.delete(id)
  }

  target.value = next
}

function runAdapterAction(label: string, action: () => Promise<void> | void) {
  void Promise.resolve()
    .then(action)
    .catch((error) => {
      console.error(`[TrChat] Failed to ${label}:`, error)
    })
}

async function withModelSelecting(action: () => Promise<void> | void) {
  if (modelSelecting.value) {
    return
  }

  modelSelecting.value = true

  try {
    await action()
  } finally {
    modelSelecting.value = false
  }
}

async function withModelFeaturePending(id: string, action: () => Promise<void> | void) {
  if (pendingModelFeatureIds.value.has(id)) {
    return
  }

  setPendingId(pendingModelFeatureIds, id, true)

  try {
    await action()
  } finally {
    setPendingId(pendingModelFeatureIds, id, false)
  }
}

async function withMcpServerPending(
  id: string,
  action: () => Promise<void> | void,
  options: { allowExisting?: boolean } = {},
) {
  const alreadyPending = pendingMcpServerIds.value.has(id)

  if (alreadyPending && !options.allowExisting) {
    return
  }

  if (!alreadyPending) {
    setPendingId(pendingMcpServerIds, id, true)
  }

  try {
    await action()
  } finally {
    if (!alreadyPending) {
      setPendingId(pendingMcpServerIds, id, false)
    }
  }
}

async function withMcpToolPending(serverId: string, toolId: string, action: () => Promise<void> | void) {
  const key = getToolKey(serverId, toolId)

  if (pendingMcpToolIds.value.has(key)) {
    return
  }

  setPendingId(pendingMcpToolIds, key, true)

  try {
    await action()
  } finally {
    setPendingId(pendingMcpToolIds, key, false)
  }
}

function handleCreateConversation() {
  runtimeRef.value.actions.createConversation()
}

function handleSwitchConversation(payload: { id: string }) {
  runtimeRef.value.actions.switchConversation(payload.id)
}

function handleRenameConversation(payload: { id: string; title: string }) {
  runtimeRef.value.actions.renameConversation(payload.id, payload.title)
}

function handleDeleteConversation(payload: { id: string }) {
  runtimeRef.value.actions.deleteConversation(payload.id)
}

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === 'delete') {
    handleDeleteConversation({ id: payload.conversation.id })
    return
  }

  emit('history-action', payload)
}

function handlePromptClick(payload: ChatPromptClickPayload) {
  emit('prompt-click', payload)
}

function handleBubbleStateChange(payload: ChatBubbleStateChangePayload) {
  emit('bubble-state-change', payload)
}

function handleBubbleEvent(payload: ChatBubbleEventPayload) {
  emit('bubble-event', payload)
}

function handleLeftAsideOpenChange(payload: ChatAsideOpenChangePayload) {
  emit('left-aside-open-change', payload)
}

function handleRightAsideOpenChange(payload: ChatAsideOpenChangePayload) {
  emit('right-aside-open-change', payload)
}

function handleSubmit(payload: ChatSubmitPayload) {
  void input.send(payload)
}

function handleCancel() {
  input.abort?.()
}

function handleClear() {
  input.setInputValue('')
}

function handleSelectModel(payload: { id: string | null }) {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model || model.selectedId.value === payload.id) {
    return
  }

  runAdapterAction('select model', () => withModelSelecting(() => model.select(payload.id)))
}

function handleUpdateModelFeature(payload: { id: string; enabled: boolean }) {
  const model: ChatRuntime['composer']['model'] = runtimeRef.value.composer.model

  if (!model || model.features.value[payload.id] === payload.enabled) {
    return
  }

  runAdapterAction(`update model feature "${payload.id}"`, () =>
    withModelFeaturePending(payload.id, () => model.setFeature(payload.id, payload.enabled)),
  )
}

function handleAddMcpServer(payload: { id: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  runAdapterAction(`add MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.addServer(payload.id)),
  )
}

function handleRemoveMcpServer(payload: { id: string }) {
  const mcp = getRuntimeMcp()

  if (!mcp) {
    return
  }

  runAdapterAction(`remove MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.removeServer(payload.id)),
  )
}

function handleUpdateMcpServerEnabled(payload: { id: string; enabled: boolean }) {
  const mcp = getRuntimeMcp()
  const server = mcp?.servers.value.find((item) => item.id === payload.id)

  if (!mcp || !server || server.enabled === payload.enabled) {
    return
  }

  runAdapterAction(`update MCP server "${payload.id}"`, () =>
    withMcpServerPending(payload.id, () => mcp.setServerEnabled(payload.id, payload.enabled)),
  )
}

function handleUpdateMcpToolEnabled(payload: { serverId: string; toolId: string; enabled: boolean }) {
  const mcp = getRuntimeMcp()
  const tool = mcp?.tools.value[payload.serverId]?.find((item) => item.id === payload.toolId)

  if (!mcp || !tool || tool.enabled === payload.enabled) {
    return
  }

  runAdapterAction(`update MCP tool "${payload.toolId}" for "${payload.serverId}"`, () =>
    withMcpToolPending(payload.serverId, payload.toolId, () =>
      mcp.setToolEnabled(payload.serverId, payload.toolId, payload.enabled),
    ),
  )
}
</script>

<template>
  <ChatUI
    :data="data"
    :ui="props.ui"
    :input-value="input.inputValue.value"
    @create-conversation="handleCreateConversation"
    @switch-conversation="handleSwitchConversation"
    @rename-conversation="handleRenameConversation"
    @delete-conversation="handleDeleteConversation"
    @history-action="handleHistoryAction"
    @prompt-click="handlePromptClick"
    @bubble-state-change="handleBubbleStateChange"
    @bubble-event="handleBubbleEvent"
    @left-aside-open-change="handleLeftAsideOpenChange"
    @right-aside-open-change="handleRightAsideOpenChange"
    @submit="handleSubmit"
    @cancel="handleCancel"
    @clear="handleClear"
    @update:input-value="input.setInputValue"
    @model-select="handleSelectModel"
    @model-feature-change="handleUpdateModelFeature"
    @mcp-add-server="handleAddMcpServer"
    @mcp-remove-server="handleRemoveMcpServer"
    @mcp-server-enabled-change="handleUpdateMcpServerEnabled"
    @mcp-tool-enabled-change="handleUpdateMcpToolEnabled"
  >
    <template v-if="$slots['layout-left-aside']" #layout-left-aside="slotProps">
      <slot name="layout-left-aside" v-bind="slotProps" />
    </template>

    <template v-if="$slots['layout-header']" #layout-header="slotProps">
      <slot name="layout-header" v-bind="slotProps" />
    </template>

    <template v-if="$slots['layout-main']" #layout-main="slotProps">
      <slot name="layout-main" v-bind="slotProps" />
    </template>

    <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
      <slot name="layout-footer" v-bind="slotProps" />
    </template>

    <template v-if="$slots['header-notice']" #header-notice>
      <slot name="header-notice" />
    </template>

    <template v-if="$slots['request-error']" #request-error="slotProps">
      <slot name="request-error" v-bind="slotProps" />
    </template>
    <template v-if="$slots['welcome-footer']" #welcome-footer>
      <slot name="welcome-footer" />
    </template>

    <template v-if="$slots['prompts-footer']" #prompts-footer>
      <slot name="prompts-footer" />
    </template>

    <template v-if="$slots['bubble-prefix']" #bubble-prefix>
      <slot name="bubble-prefix" />
    </template>

    <template v-if="$slots['bubble-suffix']" #bubble-suffix>
      <slot name="bubble-suffix" />
    </template>

    <template v-if="$slots['bubble-after']" #bubble-after>
      <slot name="bubble-after" />
    </template>

    <template v-if="$slots['bubble-content-footer']" #bubble-content-footer>
      <slot name="bubble-content-footer" />
    </template>

    <template v-if="$slots['sender-footer']" #sender-footer>
      <slot name="sender-footer" />
    </template>

    <template v-if="$slots['sender-footer-right']" #sender-footer-right>
      <slot name="sender-footer-right" />
    </template>

    <template v-if="$slots['layout-right-aside-title']" #layout-right-aside-title>
      <slot name="layout-right-aside-title" />
    </template>

    <template v-if="$slots['layout-right-aside']" #layout-right-aside>
      <slot name="layout-right-aside" />
    </template>
  </ChatUI>
</template>
