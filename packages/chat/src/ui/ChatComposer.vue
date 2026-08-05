<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from '../components/MCPSelector.vue'
import ModelFeatures from '../components/ModelFeatures.vue'
import ModelSelector from '../components/ModelSelector.vue'
import type {
  ChatComposerOptions,
  ChatComposerView,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
  ChatSubmitPayload,
} from '../types'

const props = defineProps<{
  composer: Required<ChatComposerView> & { value: string; submitDisabled: boolean }
  options: ChatComposerOptions
  labels: ChatLabels
  model?: ChatModelView
  mcp?: ChatMcpView
}>()

const emit = defineEmits<{
  updateComposerValue: [value: string]
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  selectModel: [payload: { id: string | null }]
  updateModelFeature: [payload: { id: string; enabled: boolean }]
  addMcpServer: [payload: { id: string }]
  removeMcpServer: [payload: { id: string }]
  loadMcpTools: [payload: { serverId: string }]
  updateMcpServerEnabled: [payload: { id: string; enabled: boolean }]
  updateMcpToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}>()

const composerValue = computed(() => props.composer.value)
const isSubmitDisabled = computed(
  () => props.composer.disabled || props.composer.submitDisabled || composerValue.value.trim().length === 0,
)

const senderProps = computed(() => {
  const { 'onUpdate:modelValue': _onUpdateModelValue, ...sender } = (props.options.sender ?? {}) as NonNullable<
    typeof props.options.sender
  > & {
    'onUpdate:modelValue'?: (value: string) => unknown
  }

  return {
    mode: 'multiple' as const,
    clearable: true,
    placeholder: props.composer.loading ? props.labels.composerLoadingPlaceholder : props.labels.composerPlaceholder,
    showWordLimit: true,
    maxLength: 1000,
    ...sender,
    defaultActions: {
      ...sender.defaultActions,
      submit: {
        ...sender.defaultActions?.submit,
        disabled: isSubmitDisabled.value,
      },
    },
    modelValue: composerValue.value,
    loading: props.composer.loading,
    disabled: props.composer.disabled,
  }
})

function handleSubmit(text: string, structuredData?: ChatSubmitPayload['structuredData']) {
  emit('submit', { text, structuredData })
}

function handleUpdateComposerValue(value: string) {
  emit('updateComposerValue', value)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function submitCurrentValue() {
  emit('submit', { text: composerValue.value })
}
</script>

<template>
  <div class="chat-footer">
    <slot
      :input-value="composerValue"
      :loading="composer.loading"
      :disabled="composer.disabled"
      :submit-disabled="isSubmitDisabled"
      :model="model"
      :mcp="mcp"
      :set-input-value="handleUpdateComposerValue"
      :submit="submitCurrentValue"
      :cancel="() => emit('cancel')"
      :clear="() => emit('clear')"
    >
      <TrSender
        v-bind="senderProps"
        @update:model-value="handleUpdateComposerValue"
        @submit="handleSubmit"
        @cancel="emit('cancel')"
        @clear="emit('clear')"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <template v-if="$slots['sender-footer'] || model || mcp" #footer="slotProps">
          <slot v-if="$slots['sender-footer']" name="sender-footer" v-bind="slotProps" />
          <div v-else class="model-actions">
            <MCPSelector
              v-if="mcp"
              :mcp="mcp"
              :labels="labels"
              @add-server="emit('addMcpServer', $event)"
              @remove-server="emit('removeMcpServer', $event)"
              @load-tools="emit('loadMcpTools', $event)"
              @update-server-enabled="emit('updateMcpServerEnabled', $event)"
              @update-tool-enabled="emit('updateMcpToolEnabled', $event)"
            />
            <ModelSelector v-if="model" :model="model" :labels="labels" @select-model="emit('selectModel', $event)" />
            <ModelFeatures
              v-if="model"
              :model="model"
              :labels="labels"
              @update-feature="emit('updateModelFeature', $event)"
            />
          </div>
        </template>
        <template v-if="$slots['sender-footer-right']" #footer-right="slotProps">
          <slot name="sender-footer-right" v-bind="slotProps" />
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
