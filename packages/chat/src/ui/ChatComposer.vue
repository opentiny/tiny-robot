<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from '../components/MCPSelector.vue'
import ModelFeatures from '../components/ModelFeatures.vue'
import ModelSelector from '../components/ModelSelector.vue'
import type { ChatLabels, ChatMcpView, ChatModelView, ChatSenderView, ChatSubmitPayload } from '../types'
import type { ResolvedChatMcpOptions, ResolvedChatModelOptions, ResolvedChatSenderOptions } from './resolveOptions'

interface SenderInstance {
  clear: () => void
  getContent: () => string
  setContent: (content: string) => void
}

const props = defineProps<{
  sender: Required<Omit<ChatSenderView, 'inputValue'>> & Pick<ChatSenderView, 'inputValue'>
  senderOptions: ResolvedChatSenderOptions
  labels: ChatLabels
  model?: ChatModelView
  mcp?: ChatMcpView
  modelOptions: false | ResolvedChatModelOptions
  mcpOptions: false | ResolvedChatMcpOptions
}>()

const emit = defineEmits<{
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
}>()

const senderRef = shallowRef<SenderInstance | null>(null)
const draftValue = shallowRef(props.sender.inputValue ?? '')

const senderProps = computed(() => {
  const {
    clearOnSubmit: _clearOnSubmit,
    onInput: _onInput,
    onFocus: _onFocus,
    onBlur: _onBlur,
    ...sender
  } = props.senderOptions

  return {
    mode: 'multiple' as const,
    clearable: true,
    placeholder: props.sender.loading ? props.labels.composerLoadingPlaceholder : props.labels.composerPlaceholder,
    showWordLimit: true,
    maxLength: 1000,
    ...sender,
    defaultActions: {
      ...sender.defaultActions,
      submit: {
        ...sender.defaultActions?.submit,
        disabled: props.sender.submitDisabled,
      },
    },
    modelValue: props.sender.inputValue,
    loading: props.sender.loading,
    disabled: props.sender.disabled,
  }
})

watch(
  () => props.sender.inputValue,
  (value) => {
    if (value !== undefined) {
      draftValue.value = value
    }
  },
)

function setInputValue(value: string) {
  draftValue.value = value

  const sender = senderRef.value

  if (!sender) {
    props.senderOptions.onInput(value)
    return
  }

  if (sender.getContent() !== value) {
    sender.setContent(value)
  }
}

function handleUpdateSenderValue(value: string) {
  draftValue.value = value
  props.senderOptions.onInput(value)
}

function handleSubmit(text: string, structuredData?: ChatSubmitPayload['structuredData']) {
  draftValue.value = text
  emit('submit', { text, structuredData })
}

function handleClear() {
  draftValue.value = ''
  emit('clear')
}

function handleFocus(event: FocusEvent) {
  props.senderOptions.onFocus(event)
}

function handleBlur(event: FocusEvent) {
  props.senderOptions.onBlur(event)
}

function handleSelectModel(payload: { id: string | null }) {
  if (props.modelOptions !== false) {
    props.modelOptions.onSelect(payload)
  }
}

function handleFeatureChange(payload: { id: string; enabled: boolean }) {
  if (props.modelOptions !== false) {
    props.modelOptions.onFeatureChange(payload)
  }
}

function handleAddServer(payload: { id: string }) {
  if (props.mcpOptions !== false) {
    props.mcpOptions.onAddServer(payload)
  }
}

function handleRemoveServer(payload: { id: string }) {
  if (props.mcpOptions !== false) {
    props.mcpOptions.onRemoveServer(payload)
  }
}

function handleServerEnabledChange(payload: { id: string; enabled: boolean }) {
  if (props.mcpOptions !== false) {
    props.mcpOptions.onServerEnabledChange(payload)
  }
}

function handleToolEnabledChange(payload: { serverId: string; toolId: string; enabled: boolean }) {
  if (props.mcpOptions !== false) {
    props.mcpOptions.onToolEnabledChange(payload)
  }
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
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <template v-if="$slots['sender-footer'] || model || mcp" #footer>
          <slot v-if="$slots['sender-footer']" name="sender-footer" />
          <div v-else class="model-actions">
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
