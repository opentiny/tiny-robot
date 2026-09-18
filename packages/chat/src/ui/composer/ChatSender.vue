<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from './MCPSelector.vue'
import ModelFeatures from './ModelFeatures.vue'
import ModelSelector from './ModelSelector.vue'
import type {
  ChatBuiltInModelFeature,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
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
  'sender-header'?: () => unknown
  'sender-footer'?: () => unknown
  'sender-footer-right'?: () => unknown
}>()

const senderProps = computed(() => ({
  ...props.senderOptions,
  placeholder:
    props.senderOptions.placeholder ??
    (props.sender.loading ? props.labels.composerLoadingPlaceholder : props.labels.composerPlaceholder),
  modelValue: props.value,
  loading: props.sender.loading,
  disabled: props.sender.disabled,
  defaultActions: {
    ...props.senderOptions.defaultActions,
    submit: {
      ...props.senderOptions.defaultActions?.submit,
      disabled: props.sender.submitDisabled,
    },
  },
}))

function handleUpdateSenderValue(value: string) {
  emit('update:value', value)
}

function handleSubmit(text: string, structuredData?: ChatSendPayload['structuredData']) {
  emit('submit', { text, structuredData })
}

function handleFeatureChange(payload: { id: ChatBuiltInModelFeature; enabled: boolean }) {
  emit('modelFeatureChange', payload)
}

function handleReasoningEffortChange(payload: { effort: string | null }) {
  emit('modelReasoningEffortChange', payload)
}

function handleSelectModel(payload: { id: string | null }) {
  emit('modelSelect', payload)
}

function handleOpenMcpPanel() {
  emit('openMcpPanel')
}

function handleAddServer(payload: { id: string }) {
  emit('mcpAddServer', payload)
}

function handleRemoveServer(payload: { id: string }) {
  emit('mcpRemoveServer', payload)
}

function handleServerEnabledChange(payload: { id: string; enabled: boolean }) {
  emit('mcpServerEnabledChange', payload)
}

function handleToolEnabledChange(payload: { serverId: string; toolId: string; enabled: boolean }) {
  emit('mcpToolEnabledChange', payload)
}
</script>

<template>
  <TrSender
    v-bind="senderProps"
    @update:model-value="handleUpdateSenderValue"
    @submit="handleSubmit"
    @cancel="emit('cancel')"
    @clear="emit('clear')"
  >
    <template v-if="$slots['sender-header']" #header>
      <slot name="sender-header" />
    </template>
    <template v-if="$slots['sender-footer'] || model || mcp" #footer>
      <div v-if="model || mcp" class="model-actions">
        <ModelFeatures v-if="model" :model="model" :labels="labels" @update-feature="handleFeatureChange" />
        <ModelSelector
          v-if="model"
          :model="model"
          :labels="labels"
          :append-to="modelOptions?.appendTo"
          @select-model="handleSelectModel"
          @update-reasoning-effort="handleReasoningEffortChange"
        />
        <MCPSelector
          v-if="mcp"
          :mcp="mcp"
          :labels="labels"
          @open="handleOpenMcpPanel"
          @add-server="handleAddServer"
          @remove-server="handleRemoveServer"
          @update-server-enabled="handleServerEnabledChange"
          @update-tool-enabled="handleToolEnabledChange"
        />
      </div>
      <slot name="sender-footer" />
    </template>
    <template v-if="$slots['sender-footer-right']" #footer-right>
      <slot name="sender-footer-right" />
    </template>
  </TrSender>
</template>

<style scoped>
.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@container chat-composer (max-width: 640px) {
  .model-actions {
    flex-wrap: nowrap;
    gap: 6px;
  }
}
</style>
