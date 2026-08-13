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

const senderProps = computed(() => {
  return {
    mode: 'multiple' as const,
    clearable: true,
    placeholder: props.sender.loading ? props.labels.composerLoadingPlaceholder : props.labels.composerPlaceholder,
    showWordLimit: true,
    maxLength: 1000,
    ...props.senderOptions,
    defaultActions: {
      ...props.senderOptions.defaultActions,
      submit: {
        ...props.senderOptions.defaultActions?.submit,
        disabled: props.sender.submitDisabled,
      },
    },
    modelValue: props.value,
    loading: props.sender.loading,
    disabled: props.sender.disabled,
  }
})

function handleUpdateSenderValue(value: string) {
  emit('update:value', value)
}

function handleSubmit(text: string, structuredData?: ChatSendPayload['structuredData']) {
  emit('submit', { text, structuredData })
}

function handleClear() {
  emit('clear')
}

function handleSelectModel(payload: { id: string | null }) {
  emit('modelSelect', payload)
}

function handleFeatureChange(payload: { id: ChatBuiltInModelFeature; enabled: boolean }) {
  emit('modelFeatureChange', payload)
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
  <div class="chat-footer">
    <slot>
      <TrSender
        v-bind="senderProps"
        @update:model-value="handleUpdateSenderValue"
        @submit="handleSubmit"
        @cancel="emit('cancel')"
        @clear="handleClear"
      >
        <template v-if="$slots['sender-footer'] || model || mcp" #footer>
          <div v-if="model || mcp" class="model-actions">
            <MCPSelector
              v-if="mcp"
              :mcp="mcp"
              :labels="labels"
              @add-server="handleAddServer"
              @remove-server="handleRemoveServer"
              @update-server-enabled="handleServerEnabledChange"
              @update-tool-enabled="handleToolEnabledChange"
            />
            <ModelSelector v-if="model" :model="model" :labels="labels" @select-model="handleSelectModel" />
            <ModelFeatures v-if="model" :model="model" :labels="labels" @update-feature="handleFeatureChange" />
          </div>
          <slot name="sender-footer" />
        </template>
        <template v-if="$slots['sender-footer-right']" #footer-right>
          <slot name="sender-footer-right" />
        </template>
      </TrSender>
    </slot>
  </div>
</template>

<style scoped>
.chat-footer {
  position: relative;
  flex-shrink: 0;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 959px) {
  .model-actions {
    flex-wrap: nowrap;
    gap: 6px;
  }
}
</style>
