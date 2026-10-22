<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { SenderSlotScope } from '@opentiny/tiny-robot'
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
  hasRegisteredExtensions?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: ChatSendPayload]
  cancel: []
  clear: []
  'update:value': [value: string]
  openMcpPanel: []
  openExtensionsPanel: []
  modelSelect: [payload: { id: string | null }]
  modelFeatureChange: [payload: { id: ChatBuiltInModelFeature; enabled: boolean }]
  modelReasoningEffortChange: [payload: { effort: string | null }]
}>()

defineSlots<{
  'scroll-actions'?: () => unknown
  'composer-before'?: (props: ChatSenderSlotProps) => unknown
  'composer-after'?: (props: ChatSenderSlotProps) => unknown
  'layout-footer'?: (props: ChatSenderSlotProps) => unknown
  'sender-header'?: () => unknown
  'sender-content'?: (props: { editor: unknown }) => unknown
  'sender-actions-inline'?: (scope: SenderSlotScope) => unknown
  'sender-footer'?: (scope: SenderSlotScope) => unknown
  'sender-footer-right'?: (scope: SenderSlotScope) => unknown
}>()

const senderRef = shallowRef<InstanceType<typeof ChatSender> | null>(null)
defineExpose({ focusInput: () => senderRef.value?.focusInput() ?? Promise.resolve(false) })

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
    <slot name="scroll-actions" />
    <slot name="composer-before" v-bind="layoutFooterProps" />
    <slot name="layout-footer" v-bind="layoutFooterProps">
      <ChatSender
        ref="senderRef"
        :sender="props.sender"
        :value="props.value"
        :sender-options="props.senderOptions"
        :labels="props.labels"
        :model="props.model"
        :model-options="props.modelOptions"
        :mcp="props.mcp"
        :has-registered-extensions="props.hasRegisteredExtensions"
        @submit="handleSubmit"
        @cancel="emit('cancel')"
        @clear="emit('clear')"
        @update:value="handleInputValue"
        @open-mcp-panel="emit('openMcpPanel')"
        @open-extensions-panel="emit('openExtensionsPanel')"
        @model-select="emit('modelSelect', $event)"
        @model-feature-change="emit('modelFeatureChange', $event)"
        @model-reasoning-effort-change="emit('modelReasoningEffortChange', $event)"
      >
        <template v-if="$slots['sender-header']" #sender-header>
          <slot name="sender-header" />
        </template>
        <template v-if="$slots['sender-content']" #sender-content="slotProps">
          <slot name="sender-content" v-bind="slotProps" />
        </template>
        <template v-if="$slots['sender-actions-inline']" #sender-actions-inline="slotProps">
          <slot name="sender-actions-inline" v-bind="slotProps" />
        </template>
        <template v-if="$slots['sender-footer']" #sender-footer="slotProps">
          <slot name="sender-footer" v-bind="slotProps" />
        </template>
        <template v-if="$slots['sender-footer-right']" #sender-footer-right="slotProps">
          <slot name="sender-footer-right" v-bind="slotProps" />
        </template>
      </ChatSender>
    </slot>
    <slot name="composer-after" v-bind="layoutFooterProps" />
  </div>
</template>

<style scoped>
.chat-footer {
  position: relative;
  flex-shrink: 0;
  container: chat-composer / inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--tr-chat-ui-composer-gap, 0px);
}
</style>
