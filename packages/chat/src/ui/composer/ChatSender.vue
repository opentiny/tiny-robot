<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import ExtensionSelector from './ExtensionSelector.vue'
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
      disabled: props.sender.submitDisabled && !props.sender.loading,
    },
  },
}))
const activeMcpCount = computed(
  () => props.mcp?.servers?.filter((server) => server.installed && server.enabled).length ?? 0,
)

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

function handleOpenExtensionsPanel() {
  emit('openExtensionsPanel')
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
    <template v-if="$slots['sender-footer'] || model || mcp || hasRegisteredExtensions" #footer>
      <div v-if="model || mcp || hasRegisteredExtensions" class="model-actions">
        <ModelFeatures v-if="model" :model="model" :labels="labels" @update-feature="handleFeatureChange" />
        <ModelSelector
          v-if="model"
          :model="model"
          :labels="labels"
          :append-to="modelOptions?.appendTo"
          @select-model="handleSelectModel"
          @update-reasoning-effort="handleReasoningEffortChange"
        />
        <ExtensionSelector
          v-if="hasRegisteredExtensions"
          :count="activeMcpCount"
          :label="labels.extensions"
          @open="handleOpenExtensionsPanel"
        />
        <ExtensionSelector v-else-if="mcp" :count="activeMcpCount" :label="labels.mcp" @open="handleOpenMcpPanel" />
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
