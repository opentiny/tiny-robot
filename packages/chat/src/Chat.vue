<script setup lang="ts">
import { ref } from 'vue'
import ChatUI from './ChatUI.vue'
import { useChatRuntimeAdapter } from './composables/useChatRuntimeAdapter'
import type {
  ChatAsideOpenChangePayload,
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryActionPayload,
  ChatMcpAddServerPayload,
  ChatMcpCreateServerPayload,
  ChatMcpRemoveServerPayload,
  ChatMcpServerEnabledChangePayload,
  ChatMcpToolEnabledChangePayload,
  ChatModelFeatureChangePayload,
  ChatModelReasoningEffortChangePayload,
  ChatModelSelectPayload,
  ChatPromptClickPayload,
  ChatRenameConversationPayload,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatHistoryData,
  ChatRightAsidePanelId,
  ChatSwitchConversationPayload,
  LayoutFloatingDragDetail,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
  ChatUISlots,
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

const slots = defineSlots<ChatUISlots>()

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
  'left-aside-open-change': [payload: ChatAsideOpenChangePayload]
  'right-aside-open-change': [payload: ChatAsideOpenChangePayload]
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

function handleSwitchConversation(payload: ChatSwitchConversationPayload) {
  return adapter.switchConversation(payload.conversationId)
}

function handleRenameConversation(payload: ChatRenameConversationPayload) {
  return adapter.renameConversation(payload.conversationId, payload.title)
}

function handleModelSelect(payload: ChatModelSelectPayload) {
  return adapter.selectModel(payload.modelId)
}

function handleModelFeatureChange(payload: ChatModelFeatureChangePayload) {
  return adapter.setModelFeature(payload.featureId, payload.enabled)
}

function handleModelReasoningEffortChange(payload: ChatModelReasoningEffortChangePayload) {
  return adapter.setModelReasoningEffort(payload.effort)
}

function handleMcpAddServer(payload: ChatMcpAddServerPayload) {
  return adapter.addMcpServer(payload.serverId)
}

function handleMcpCreateServer(payload: ChatMcpCreateServerPayload) {
  emit('mcp-create-server', payload)
}

function handleMcpRemoveServer(payload: ChatMcpRemoveServerPayload) {
  return adapter.removeMcpServer(payload.serverId)
}

function handleMcpServerEnabledChange(payload: ChatMcpServerEnabledChangePayload) {
  return adapter.setMcpServerEnabled(payload.serverId, payload.enabled)
}

function handleMcpToolEnabledChange(payload: ChatMcpToolEnabledChangePayload) {
  return adapter.setMcpToolEnabled(payload.serverId, payload.toolId, payload.enabled)
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

function handleUpdateRightAsideOpen(value: boolean) {
  emit('update:right-aside-open', value)
}

function handleUpdateActiveRightAsidePanelId(value: ChatRightAsidePanelId | undefined) {
  emit('update:active-right-aside-panel-id', value)
}

function handleUpdateFloatingState(value: LayoutFloatingState) {
  emit('update:floating-state', value)
}

function handleFloatingDragStart(detail: LayoutFloatingDragDetail) {
  emit('floating-drag-start', detail)
}

function handleFloatingDrag(detail: LayoutFloatingDragDetail) {
  emit('floating-drag', detail)
}

function handleFloatingDragEnd(detail: LayoutFloatingDragDetail) {
  emit('floating-drag-end', detail)
}

function handleFloatingResizeStart(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize-start', detail)
}

function handleFloatingResize(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize', detail)
}

function handleFloatingResizeEnd(detail: LayoutFloatingResizeDetail) {
  emit('floating-resize-end', detail)
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
    @create-conversation="adapter.clearActiveConversation"
    @switch-conversation="handleSwitchConversation"
    @rename-conversation="handleRenameConversation"
    @history-action="handleHistoryAction"
    @prompt-click="handlePromptClick"
    @bubble-state-change="handleBubbleStateChange"
    @bubble-event="handleBubbleEvent"
    @left-aside-open-change="handleLeftAsideOpenChange"
    @right-aside-open-change="handleRightAsideOpenChange"
    @update:right-aside-open="handleUpdateRightAsideOpen"
    @update:active-right-aside-panel-id="handleUpdateActiveRightAsidePanelId"
    @update:floating-state="handleUpdateFloatingState"
    @floating-drag-start="handleFloatingDragStart"
    @floating-drag="handleFloatingDrag"
    @floating-drag-end="handleFloatingDragEnd"
    @floating-resize-start="handleFloatingResizeStart"
    @floating-resize="handleFloatingResize"
    @floating-resize-end="handleFloatingResizeEnd"
    @submit="adapter.send"
    @cancel="adapter.abort"
    @clear="() => adapter.setInputValue('')"
    @update:input-value="adapter.setInputValue"
    @model-select="handleModelSelect"
    @model-feature-change="handleModelFeatureChange"
    @model-reasoning-effort-change="handleModelReasoningEffortChange"
    @mcp-add-server="handleMcpAddServer"
    @mcp-create-server="handleMcpCreateServer"
    @mcp-remove-server="handleMcpRemoveServer"
    @mcp-server-enabled-change="handleMcpServerEnabledChange"
    @mcp-tool-enabled-change="handleMcpToolEnabledChange"
  >
    <template v-if="slots['layout-header']" #layout-header="slotProps">
      <slot name="layout-header" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside']" #layout-left-aside="slotProps">
      <slot name="layout-left-aside" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-brand']" #layout-left-aside-brand="slotProps">
      <slot name="layout-left-aside-brand" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-actions']" #layout-left-aside-actions="slotProps">
      <slot name="layout-left-aside-actions" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-content']" #layout-left-aside-content="slotProps">
      <slot name="layout-left-aside-content" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-footer']" #layout-left-aside-footer="slotProps">
      <slot name="layout-left-aside-footer" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-rail']" #layout-left-aside-rail="slotProps">
      <slot name="layout-left-aside-rail" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-left-aside-history-item-prefix']" #layout-left-aside-history-item-prefix="slotProps">
      <slot name="layout-left-aside-history-item-prefix" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-right-aside']" #layout-right-aside="slotProps">
      <slot name="layout-right-aside" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-right-aside-title']" #layout-right-aside-title="slotProps">
      <slot name="layout-right-aside-title" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-right-aside-panel']" #layout-right-aside-panel="slotProps">
      <slot name="layout-right-aside-panel" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-main']" #layout-main="slotProps">
      <slot name="layout-main" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-empty-state']" #layout-empty-state="slotProps">
      <slot name="layout-empty-state" v-bind="slotProps" />
    </template>
    <template v-if="slots['layout-footer']" #layout-footer="slotProps">
      <slot name="layout-footer" v-bind="slotProps" />
    </template>
    <template v-if="slots['composer-before']" #composer-before="slotProps">
      <slot name="composer-before" v-bind="slotProps" />
    </template>
    <template v-if="slots['header-notice']" #header-notice>
      <slot name="header-notice" />
    </template>
    <template v-if="slots['request-error']" #request-error="slotProps">
      <slot name="request-error" v-bind="slotProps" />
    </template>
    <template v-if="slots['welcome-footer']" #welcome-footer>
      <slot name="welcome-footer" />
    </template>
    <template v-if="slots['prompts-footer']" #prompts-footer>
      <slot name="prompts-footer" />
    </template>
    <template v-if="slots['bubble-prefix']" #bubble-prefix="slotProps">
      <slot name="bubble-prefix" v-bind="slotProps" />
    </template>
    <template v-if="slots['bubble-suffix']" #bubble-suffix="slotProps">
      <slot name="bubble-suffix" v-bind="slotProps" />
    </template>
    <template v-if="slots['bubble-after']" #bubble-after="slotProps">
      <slot name="bubble-after" v-bind="slotProps" />
    </template>
    <template v-if="slots['bubble-content-footer']" #bubble-content-footer="slotProps">
      <slot name="bubble-content-footer" v-bind="slotProps" />
    </template>
    <template v-if="slots['sender-header']" #sender-header>
      <slot name="sender-header" />
    </template>
    <template v-if="slots['sender-footer']" #sender-footer>
      <slot name="sender-footer" />
    </template>
    <template v-if="slots['sender-footer-right']" #sender-footer-right>
      <slot name="sender-footer-right" />
    </template>
  </ChatUI>
</template>
