<script setup lang="ts">
import { computed } from 'vue'
import ChatSender from './ChatSender.vue'
import type {
  ChatBuiltInModelFeature,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
  ChatSenderSlotProps,
  ChatSenderView,
  ChatSendPayload,
} from '../../types'
import type { ResolvedChatModelOptions, ResolvedChatSenderOptions } from '../resolveOptions'

const props = defineProps<{
  sender: Required<ChatSenderView>
  value: string
  senderOptions: ResolvedChatSenderOptions
  labels: ChatLabels
  model?: ChatModelView
  modelOptions?: ResolvedChatModelOptions
  mcp?: ChatMcpView
}>()

const emit = defineEmits<{
  submit: [payload: ChatSendPayload]
  cancel: []
  clear: []
  'update:value': [value: string]
  openMcpPanel: []
  modelSelect: [payload: { id: string | null }]
  modelFeatureChange: [payload: { id: ChatBuiltInModelFeature; enabled: boolean }]
  modelReasoningEffortChange: [payload: { effort: string | null }]
  mcpAddServer: [payload: { id: string }]
  mcpRemoveServer: [payload: { id: string }]
  mcpServerEnabledChange: [payload: { id: string; enabled: boolean }]
  mcpToolEnabledChange: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

defineSlots<{
  'composer-before'?: (props: ChatSenderSlotProps) => unknown
  'layout-footer'?: (props: ChatSenderSlotProps) => unknown
  'sender-header'?: () => unknown
  'sender-footer'?: () => unknown
  'sender-footer-right'?: () => unknown
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
  <div class="chat-footer">
    <slot name="composer-before" v-bind="layoutFooterProps" />
    <slot name="layout-footer" v-bind="layoutFooterProps">
      <ChatSender
        :sender="props.sender"
        :value="props.value"
        :sender-options="props.senderOptions"
        :labels="props.labels"
        :model="props.model"
        :model-options="props.modelOptions"
        :mcp="props.mcp"
        @submit="handleSubmit"
        @cancel="emit('cancel')"
        @clear="emit('clear')"
        @update:value="handleInputValue"
        @open-mcp-panel="emit('openMcpPanel')"
        @model-select="emit('modelSelect', $event)"
        @model-feature-change="emit('modelFeatureChange', $event)"
        @model-reasoning-effort-change="emit('modelReasoningEffortChange', $event)"
        @mcp-add-server="emit('mcpAddServer', $event)"
        @mcp-remove-server="emit('mcpRemoveServer', $event)"
        @mcp-server-enabled-change="emit('mcpServerEnabledChange', $event)"
        @mcp-tool-enabled-change="emit('mcpToolEnabledChange', $event)"
      >
        <template v-if="$slots['sender-header']" #sender-header>
          <slot name="sender-header" />
        </template>
        <template v-if="$slots['sender-footer']" #sender-footer>
          <slot name="sender-footer" />
        </template>
        <template v-if="$slots['sender-footer-right']" #sender-footer-right>
          <slot name="sender-footer-right" />
        </template>
      </ChatSender>
    </slot>
  </div>
</template>

<style scoped>
.chat-footer {
  position: relative;
  flex-shrink: 0;
  container: chat-composer / inline-size;
}
</style>
