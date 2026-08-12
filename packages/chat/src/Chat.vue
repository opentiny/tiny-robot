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
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ChatUI>
</template>
