<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from '../components/MCPSelector.vue'
import ModelFeatures from '../components/ModelFeatures.vue'
import ModelSelector from '../components/ModelSelector.vue'
import type { ChatLabels, ChatMcpView, ChatModelView, ChatSenderView, ChatSubmitPayload } from '../types'
import type { ResolvedChatSenderOptions } from './resolveOptions'

interface SenderInstance {
  clear: () => void
  getContent: () => string
  setContent: (content: string) => void
}

const props = defineProps<{
  sender: Required<ChatSenderView>
  value: string
  senderOptions: ResolvedChatSenderOptions
  labels: ChatLabels
  model?: ChatModelView
  mcp?: ChatMcpView
}>()

const emit = defineEmits<{
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  'update:value': [value: string]
  modelSelect: [payload: { id: string | null }]
  modelFeatureChange: [payload: { id: string; enabled: boolean }]
  mcpAddServer: [payload: { id: string }]
  mcpRemoveServer: [payload: { id: string }]
  mcpServerEnabledChange: [payload: { id: string; enabled: boolean }]
  mcpToolEnabledChange: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

const senderRef = shallowRef<SenderInstance | null>(null)

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

watch(
  () => props.value,
  (value) => {
    const sender = senderRef.value

    if (sender && sender.getContent() !== value) {
      sender.setContent(value)
    }
  },
)

function setInputValue(value: string) {
  const sender = senderRef.value

  if (!sender) {
    emit('update:value', value)
    return
  }

  if (sender.getContent() !== value) {
    sender.setContent(value)
  }

  emit('update:value', value)
}

function handleUpdateSenderValue(value: string) {
  emit('update:value', value)
}

function handleSubmit(text: string, structuredData?: ChatSubmitPayload['structuredData']) {
  emit('submit', { text, structuredData })
}

function handleClear() {
  emit('clear')
}

function handleSelectModel(payload: { id: string | null }) {
  emit('modelSelect', payload)
}

function handleFeatureChange(payload: { id: string; enabled: boolean }) {
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

defineExpose({
  setInputValue,
})
</script>

<template>
  <div class="chat-footer">
    <slot>
      <TrSender
        ref="senderRef"
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
