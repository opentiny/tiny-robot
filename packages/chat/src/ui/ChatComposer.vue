<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from '../components/MCPSelector.vue'
import ModelFeatures from '../components/ModelFeatures.vue'
import ModelSelector from '../components/ModelSelector.vue'
import type { ChatSubmitPayload, ChatUIComposerControls, ChatUIComposerState, ChatSenderUi } from '../types'

const props = defineProps<{
  composer: ChatUIComposerState
  sender: ChatSenderUi
  controls?: ChatUIComposerControls
}>()

const emit = defineEmits<{
  updateComposerValue: [value: string]
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const composerValue = computed(() => props.composer.value ?? '')
const isSubmitDisabled = computed(() => props.composer.submitDisabled ?? composerValue.value.trim().length === 0)

const senderProps = computed(() => {
  const {
    onInput: _onInput,
    onSubmit: _onSubmit,
    onCancel: _onCancel,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    'onUpdate:modelValue': _onUpdateModelValue,
    ...sender
  } = props.sender as typeof props.sender & {
    'onUpdate:modelValue'?: (value: string) => unknown
  }

  return {
    mode: 'multiple' as const,
    clearable: true,
    placeholder: props.composer.loading ? '思考中...' : '请输入你的问题...',
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
</script>

<template>
  <div class="chat-footer">
    <slot
      :input-value="composerValue"
      :loading="composer.loading"
      :disabled="composer.disabled"
      :submit-disabled="isSubmitDisabled"
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
        <template v-if="$slots['sender-footer'] || controls?.model || controls?.mcp" #footer="slotProps">
          <slot v-if="$slots['sender-footer']" name="sender-footer" v-bind="slotProps" />
          <div v-else class="model-actions">
            <MCPSelector v-if="controls?.mcp" :mcp="controls.mcp" />
            <ModelSelector v-if="controls?.model" :model="controls.model" />
            <ModelFeatures v-if="controls?.model" :model="controls.model" />
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
