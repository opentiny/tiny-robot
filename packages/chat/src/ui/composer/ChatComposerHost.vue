<script setup lang="ts">
import { computed } from 'vue'
import ChatComposer from './ChatComposer.vue'
import type {
  ChatBuiltInModelFeature,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
  ChatSenderView,
  ChatSendPayload,
  ChatSenderSlotProps,
} from '../../types'
import type { ResolvedChatSenderOptions } from '../resolveOptions'

const props = defineProps<{
  sender: Required<ChatSenderView>
  value: string
  senderOptions: ResolvedChatSenderOptions
  labels: ChatLabels
  model?: ChatModelView
  mcp?: ChatMcpView
}>()

const emit = defineEmits<{
  submit: [payload: ChatSendPayload]
  cancel: []
  clear: []
  'update:value': [value: string]
  modelSelect: [payload: { id: string | null }]
  modelFeatureChange: [payload: { id: ChatBuiltInModelFeature; enabled: boolean }]
  mcpAddServer: [payload: { id: string }]
  mcpRemoveServer: [payload: { id: string }]
  mcpServerEnabledChange: [payload: { id: string; enabled: boolean }]
  mcpToolEnabledChange: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

function handleInputValue(value: string) {
  emit('update:value', value)
}

function handleSubmit(payload: ChatSendPayload) {
  emit('submit', payload)
}

const layoutFooterProps = computed<ChatSenderSlotProps>(() => ({
  value: props.value,
  loading: props.sender.loading,
  disabled: props.sender.disabled,
  submitDisabled: props.sender.submitDisabled,
  setInputValue: handleInputValue,
  submit: handleSubmit,
  cancel: () => emit('cancel'),
  clear: () => emit('clear'),
}))
</script>

<template>
  <ChatComposer
    :sender="props.sender"
    :value="props.value"
    :sender-options="props.senderOptions"
    :labels="props.labels"
    :model="props.model"
    :mcp="props.mcp"
    @submit="emit('submit', $event)"
    @cancel="emit('cancel')"
    @clear="emit('clear')"
    @update:value="emit('update:value', $event)"
    @model-select="emit('modelSelect', $event)"
    @model-feature-change="emit('modelFeatureChange', $event)"
    @mcp-add-server="emit('mcpAddServer', $event)"
    @mcp-remove-server="emit('mcpRemoveServer', $event)"
    @mcp-server-enabled-change="emit('mcpServerEnabledChange', $event)"
    @mcp-tool-enabled-change="emit('mcpToolEnabledChange', $event)"
  >
    <template v-if="$slots['layout-footer']" #default>
      <slot name="layout-footer" v-bind="layoutFooterProps" />
    </template>
    <template v-if="$slots['sender-footer']" #sender-footer>
      <slot name="sender-footer" />
    </template>
    <template v-if="$slots['sender-footer-right']" #sender-footer-right>
      <slot name="sender-footer-right" />
    </template>
  </ChatComposer>
</template>
