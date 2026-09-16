<script setup lang="ts">
import { ref } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatRuntimeAdapter } from './composables/useChatRuntimeAdapter'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryActionPayload,
  ChatMcpCreateServerPayload,
  ChatPromptClickPayload,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatHistoryData,
  ChatRightAsidePanelId,
  LayoutFloatingDragDetail,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
  ChatUIOptions,
} from './types'

interface ChatUIActions {
  openRightAside: (panel?: ChatRightAsidePanelId) => void
  closeRightAside: () => void
  toggleRightAside: (panel?: ChatRightAsidePanelId) => void
  activateRightAsidePanel: (panel: ChatRightAsidePanelId) => boolean
}

const chatUIRef = ref<ChatUIActions | null>(null)

const props = withDefaults(
  defineProps<{
    runtime: ChatRuntime
    ui?: ChatUIOptions
    title?: string
    floatingState?: LayoutFloatingState
    rightAsideOpen?: boolean
    defaultRightAsideOpen?: boolean
    activeRightAsidePanelId?: ChatRightAsidePanelId
    defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
    historyData?: ChatHistoryData
  }>(),
  {
    rightAsideOpen: undefined,
  },
)

const emit = defineEmits<{
  'update:floating-state': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragDetail]
  'floating-drag': [detail: LayoutFloatingDragDetail]
  'floating-drag-end': [detail: LayoutFloatingDragDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeDetail]
  'floating-resize': [detail: LayoutFloatingResizeDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeDetail]
  'runtime-action-error': [payload: ChatRuntimeActionErrorPayload]
  'history-action': [payload: ChatHistoryActionPayload]
  'mcp-create-server': [payload: ChatMcpCreateServerPayload]
  'prompt-click': [payload: ChatPromptClickPayload]
  'bubble-state-change': [payload: ChatBubbleStateChangePayload]
  'bubble-event': [payload: ChatBubbleEventPayload]
  'left-aside-open-change': [{ open: boolean; source: 'user' | 'viewport' }]
  'right-aside-open-change': [{ open: boolean; source: 'user' | 'viewport' }]
  'update:right-aside-open': [value: boolean]
  'update:active-right-aside-panel-id': [value: ChatRightAsidePanelId | undefined]
}>()

const adapter = useChatRuntimeAdapter({
  runtime: () => props.runtime,
  title: () => props.title,
  historyData: () => props.historyData,
  onActionError: (payload) => emit('runtime-action-error', payload),
})

defineExpose({
  send: adapter.send,
  openRightAside: (panel?: ChatRightAsidePanelId) => chatUIRef.value?.openRightAside(panel),
  closeRightAside: () => chatUIRef.value?.closeRightAside(),
  toggleRightAside: (panel?: ChatRightAsidePanelId) => chatUIRef.value?.toggleRightAside(panel),
  activateRightAsidePanel: (panel: ChatRightAsidePanelId) => chatUIRef.value?.activateRightAsidePanel(panel) ?? false,
})

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  emit('history-action', payload)

  if (payload.action.id === 'delete') {
    if (!payload.defaultPrevented) {
      adapter.deleteConversation(payload.conversation.id)
    }
  }
}
</script>

<template>
  <ChatUI
    ref="chatUIRef"
    :data="adapter.data.value"
    :ui="props.ui"
    :floating-state="props.floatingState"
    :right-aside-open="props.rightAsideOpen"
    :default-right-aside-open="props.defaultRightAsideOpen"
    :active-right-aside-panel-id="props.activeRightAsidePanelId"
    :default-active-right-aside-panel-id="props.defaultActiveRightAsidePanelId"
    :input-value="adapter.inputValue.value"
    @create-conversation="adapter.createConversation"
    @switch-conversation="({ conversationId }) => adapter.switchConversation(conversationId)"
    @rename-conversation="({ conversationId, title }) => adapter.renameConversation(conversationId, title)"
    @history-action="handleHistoryAction"
    @prompt-click="(payload) => emit('prompt-click', payload)"
    @bubble-state-change="(payload) => emit('bubble-state-change', payload)"
    @bubble-event="(payload) => emit('bubble-event', payload)"
    @left-aside-open-change="(payload) => emit('left-aside-open-change', payload)"
    @right-aside-open-change="(payload) => emit('right-aside-open-change', payload)"
    @update:right-aside-open="(value) => emit('update:right-aside-open', value)"
    @update:active-right-aside-panel-id="(value) => emit('update:active-right-aside-panel-id', value)"
    @update:floating-state="(value) => emit('update:floating-state', value)"
    @floating-drag-start="(detail) => emit('floating-drag-start', detail)"
    @floating-drag="(detail) => emit('floating-drag', detail)"
    @floating-drag-end="(detail) => emit('floating-drag-end', detail)"
    @floating-resize-start="(detail) => emit('floating-resize-start', detail)"
    @floating-resize="(detail) => emit('floating-resize', detail)"
    @floating-resize-end="(detail) => emit('floating-resize-end', detail)"
    @submit="adapter.send"
    @cancel="adapter.abort"
    @clear="() => adapter.setInputValue('')"
    @update:input-value="adapter.setInputValue"
    @model-select="({ modelId }) => adapter.selectModel(modelId)"
    @model-feature-change="({ featureId, enabled }) => adapter.setModelFeature(featureId, enabled)"
    @model-reasoning-effort-change="({ effort }) => adapter.setModelReasoningEffort(effort)"
    @mcp-add-server="({ serverId }) => adapter.addMcpServer(serverId)"
    @mcp-create-server="(payload) => emit('mcp-create-server', payload)"
    @mcp-remove-server="({ serverId }) => adapter.removeMcpServer(serverId)"
    @mcp-server-enabled-change="({ serverId, enabled }) => adapter.setMcpServerEnabled(serverId, enabled)"
    @mcp-tool-enabled-change="({ serverId, toolId, enabled }) => adapter.setMcpToolEnabled(serverId, toolId, enabled)"
  >
    <template v-if="$slots['layout-header']" #layout-header="slotProps">
      <slot name="layout-header" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside']" #layout-left-aside="slotProps">
      <slot name="layout-left-aside" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-brand']" #layout-left-aside-brand="slotProps">
      <slot name="layout-left-aside-brand" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-actions']" #layout-left-aside-actions="slotProps">
      <slot name="layout-left-aside-actions" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-content']" #layout-left-aside-content="slotProps">
      <slot name="layout-left-aside-content" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-footer']" #layout-left-aside-footer="slotProps">
      <slot name="layout-left-aside-footer" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-rail']" #layout-left-aside-rail="slotProps">
      <slot name="layout-left-aside-rail" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside-history-item-prefix']" #layout-left-aside-history-item-prefix="slotProps">
      <slot name="layout-left-aside-history-item-prefix" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-right-aside']" #layout-right-aside="slotProps">
      <slot name="layout-right-aside" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-right-aside-title']" #layout-right-aside-title="slotProps">
      <slot name="layout-right-aside-title" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-right-aside-panel']" #layout-right-aside-panel="slotProps">
      <slot name="layout-right-aside-panel" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-main']" #layout-main="slotProps">
      <slot name="layout-main" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-empty-state']" #layout-empty-state="slotProps">
      <slot name="layout-empty-state" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-footer']" #layout-footer="slotProps">
      <slot name="layout-footer" v-bind="slotProps" />
    </template>
    <template v-if="$slots['composer-before']" #composer-before="slotProps">
      <slot name="composer-before" v-bind="slotProps" />
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
    <template v-if="$slots['bubble-prefix']" #bubble-prefix="slotProps">
      <slot name="bubble-prefix" v-bind="slotProps" />
    </template>
    <template v-if="$slots['bubble-suffix']" #bubble-suffix="slotProps">
      <slot name="bubble-suffix" v-bind="slotProps" />
    </template>
    <template v-if="$slots['bubble-after']" #bubble-after="slotProps">
      <slot name="bubble-after" v-bind="slotProps" />
    </template>
    <template v-if="$slots['bubble-content-footer']" #bubble-content-footer="slotProps">
      <slot name="bubble-content-footer" v-bind="slotProps" />
    </template>
    <template v-if="$slots['sender-header']" #sender-header>
      <slot name="sender-header" />
    </template>
    <template v-if="$slots['sender-footer']" #sender-footer>
      <slot name="sender-footer" />
    </template>
    <template v-if="$slots['sender-footer-right']" #sender-footer-right>
      <slot name="sender-footer-right" />
    </template>
  </ChatUI>
</template>
