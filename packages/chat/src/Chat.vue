<script setup lang="ts">
import ChatUI from './ChatUI.vue'
import { useChatRuntimeAdapter } from './composables/useChatRuntimeAdapter'
import type {
  ChatBubbleEventPayload,
  ChatBubbleStateChangePayload,
  ChatHistoryActionPayload,
  ChatPromptClickPayload,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatUIOptions,
} from './types'

const props = defineProps<{
  runtime: ChatRuntime
  ui?: ChatUIOptions
  title?: string
}>()

const emit = defineEmits<{
  'runtime-action-error': [payload: ChatRuntimeActionErrorPayload]
  'history-action': [payload: ChatHistoryActionPayload]
  'prompt-click': [payload: ChatPromptClickPayload]
  'bubble-state-change': [payload: ChatBubbleStateChangePayload]
  'bubble-event': [payload: ChatBubbleEventPayload]
  'left-aside-open-change': [{ open: boolean; source: 'user' | 'viewport' }]
  'right-aside-open-change': [{ open: boolean; source: 'user' | 'viewport' }]
}>()

const adapter = useChatRuntimeAdapter({
  runtime: () => props.runtime,
  title: () => props.title,
  onActionError: (payload) => emit('runtime-action-error', payload),
})

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === 'delete') {
    adapter.deleteConversation(payload.conversation.id)
    return
  }

  emit('history-action', payload)
}
</script>

<template>
  <ChatUI
    :data="adapter.data.value"
    :ui="props.ui"
    :input-value="adapter.inputValue.value"
    @create-conversation="adapter.createConversation"
    @switch-conversation="({ id }) => adapter.switchConversation(id)"
    @rename-conversation="({ id, title }) => adapter.renameConversation(id, title)"
    @delete-conversation="({ id }) => adapter.deleteConversation(id)"
    @history-action="handleHistoryAction"
    @prompt-click="(payload) => emit('prompt-click', payload)"
    @bubble-state-change="(payload) => emit('bubble-state-change', payload)"
    @bubble-event="(payload) => emit('bubble-event', payload)"
    @left-aside-open-change="(payload) => emit('left-aside-open-change', payload)"
    @right-aside-open-change="(payload) => emit('right-aside-open-change', payload)"
    @submit="adapter.send"
    @cancel="adapter.abort"
    @clear="() => adapter.setInputValue('')"
    @update:input-value="adapter.setInputValue"
    @model-select="({ id }) => adapter.selectModel(id)"
    @model-feature-change="({ id, enabled }) => adapter.setModelFeature(id, enabled)"
    @mcp-add-server="({ id }) => adapter.addMcpServer(id)"
    @mcp-remove-server="({ id }) => adapter.removeMcpServer(id)"
    @mcp-server-enabled-change="({ id, enabled }) => adapter.setMcpServerEnabled(id, enabled)"
    @mcp-tool-enabled-change="({ serverId, toolId, enabled }) => adapter.setMcpToolEnabled(serverId, toolId, enabled)"
  >
    <template v-if="$slots['layout-header']" #layout-header="slotProps">
      <slot name="layout-header" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-left-aside']" #layout-left-aside="slotProps">
      <slot name="layout-left-aside" v-bind="slotProps" />
    </template>
    <template v-if="$slots['layout-right-aside']" #layout-right-aside>
      <slot name="layout-right-aside" />
    </template>
    <template v-if="$slots['layout-right-aside-title']" #layout-right-aside-title>
      <slot name="layout-right-aside-title" />
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
  </ChatUI>
</template>
