<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import type { SenderSlotScope, SenderSubmitExtra } from '@opentiny/tiny-robot'
import ExtensionSelector from './ExtensionSelector.vue'
import ModelFeatureButton from './ModelFeatureButton.vue'
import ModelSelector from './ModelSelector.vue'
import ChatToolbarButton from './ChatToolbarButton.vue'
import type {
  ChatBuiltInModelFeature,
  ChatLabels,
  ChatMcpView,
  ChatModelView,
  ChatSenderView,
  ChatSenderToolbarItem,
  ChatSendPayload,
  SenderDragPayload,
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
  senderDragEnter: [payload: SenderDragPayload]
  senderDragOver: [payload: SenderDragPayload]
  senderDragLeave: [payload: SenderDragPayload]
  senderDrop: [payload: SenderDragPayload]
  senderPaste: [event: ClipboardEvent]
}>()

defineSlots<{
  'sender-header'?: () => unknown
  'sender-content'?: (props: { editor: unknown }) => unknown
  'sender-actions-inline'?: (scope: SenderSlotScope) => unknown
  'sender-footer'?: (scope: SenderSlotScope) => unknown
  'sender-footer-right'?: (scope: SenderSlotScope) => unknown
}>()

const senderRef = shallowRef<InstanceType<typeof TrSender> | null>(null)

async function focusInput(): Promise<boolean> {
  const sender = senderRef.value
  const editor = sender?.editor
  if (!sender || !editor || props.sender.disabled || editor.isDestroyed) return false

  sender.focus()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  return senderRef.value === sender && !props.sender.disabled && !editor.isDestroyed && editor.isFocused
}

defineExpose({ focusInput })

const defaultToolbar: readonly ChatSenderToolbarItem[] = [
  { type: 'builtin', id: 'thinking' },
  { type: 'builtin', id: 'search' },
  { type: 'builtin', id: 'model' },
  { type: 'builtin', id: 'mcp' },
]

const toolbarItems = computed(() => {
  const toolbar = props.senderOptions.toolbar
  const items = typeof toolbar === 'function' ? toolbar(defaultToolbar) : (toolbar ?? defaultToolbar)
  const ids = new Set<string>()
  return items
    .filter((item) => {
      if (item.type === 'custom' && defaultToolbar.some((builtin) => builtin.id === item.id)) return false
      if (ids.has(item.id)) return false
      ids.add(item.id)
      if (item.visible === false) return false
      if (item.type === 'custom') return true
      if (item.id === 'mcp') return Boolean(props.mcp || props.hasRegisteredExtensions)
      if (item.id === 'model') return Boolean(props.model?.options?.length)
      return Boolean(props.model)
    })
    .map((item) => ({ ...item, disabled: props.sender.disabled || item.disabled === true }))
})

const senderProps = computed(() => {
  const { toolbar: _toolbar, ...options } = props.senderOptions
  return {
    ...options,
    placeholder:
      options.placeholder ??
      (props.sender.loading ? props.labels.composerLoadingPlaceholder : props.labels.composerPlaceholder),
    modelValue: props.value,
    loading: props.sender.loading,
    disabled: props.sender.disabled,
    defaultActions: {
      ...options.defaultActions,
      submit: {
        ...options.defaultActions?.submit,
        disabled: props.sender.submitDisabled && !props.sender.loading,
      },
    },
  }
})
const activeMcpCount = computed(
  () => props.mcp?.servers?.filter((server) => server.installed && server.enabled).length ?? 0,
)

function handleCustomAction(id: string) {
  const item = toolbarItems.value.find((item) => item.id === id)
  if (item?.type !== 'custom' || item.disabled) return
  return item.onClick()
}

function handleUpdateSenderValue(value: string) {
  emit('update:value', value)
}

function handleSubmit(text: string, structuredData?: ChatSendPayload['structuredData'], extra?: SenderSubmitExtra) {
  emit('submit', { text, structuredData, externalPayloads: extra?.externalPayloads })
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

function handleSenderDrag(event: DragEvent, emitEvent: (payload: SenderDragPayload) => void) {
  const target = event.currentTarget
  if (target instanceof HTMLElement) emitEvent({ event, target })
}

function handleOpenExtensionPanel() {
  if (props.hasRegisteredExtensions) {
    handleOpenExtensionsPanel()
  } else {
    handleOpenMcpPanel()
  }
}

function getSenderSlotScope(scope: unknown): SenderSlotScope {
  return scope as SenderSlotScope
}
</script>

<template>
  <TrSender
    ref="senderRef"
    v-bind="senderProps"
    @update:model-value="handleUpdateSenderValue"
    @submit="handleSubmit"
    @cancel="emit('cancel')"
    @clear="emit('clear')"
    @dragenter.capture="handleSenderDrag($event, (payload) => emit('senderDragEnter', payload))"
    @dragover.capture="handleSenderDrag($event, (payload) => emit('senderDragOver', payload))"
    @dragleave.capture="handleSenderDrag($event, (payload) => emit('senderDragLeave', payload))"
    @drop.capture="handleSenderDrag($event, (payload) => emit('senderDrop', payload))"
    @paste.capture="emit('senderPaste', $event)"
  >
    <template v-if="$slots['sender-header']" #header>
      <slot name="sender-header" />
    </template>
    <template v-if="$slots['sender-content']" #content="slotProps">
      <slot name="sender-content" v-bind="slotProps" />
    </template>
    <template v-if="$slots['sender-actions-inline']" #actions-inline="slotProps">
      <slot name="sender-actions-inline" v-bind="getSenderSlotScope(slotProps)" />
    </template>
    <template v-if="$slots['sender-footer'] || toolbarItems.length" #footer="slotProps">
      <div v-if="toolbarItems.length" class="tr-chat-toolbar">
        <template v-for="item in toolbarItems" :key="item.id">
          <ChatToolbarButton
            v-if="item.type === 'custom'"
            :label="item.label"
            :icon="item.icon"
            :active="item.active"
            :disabled="item.disabled"
            @click="handleCustomAction(item.id)"
          />
          <ModelSelector
            v-else-if="item.id === 'model' && model"
            :model="model"
            :labels="labels"
            :disabled="item.disabled"
            :append-to="modelOptions?.appendTo"
            @select-model="handleSelectModel"
            @update-reasoning-effort="handleReasoningEffortChange"
          />
          <ExtensionSelector
            v-else-if="item.id === 'mcp' && (mcp || hasRegisteredExtensions)"
            :count="activeMcpCount"
            :label="hasRegisteredExtensions ? labels.extensions : labels.mcp"
            :disabled="item.disabled"
            @open="handleOpenExtensionPanel"
          />
          <ModelFeatureButton
            v-else-if="model && (item.id === 'thinking' || item.id === 'search')"
            :id="item.id"
            :model="model"
            :labels="labels"
            :disabled="item.disabled"
            @update-feature="handleFeatureChange"
          />
        </template>
      </div>
      <slot name="sender-footer" v-bind="getSenderSlotScope(slotProps)" />
    </template>
    <template v-if="$slots['sender-footer-right']" #footer-right="slotProps">
      <slot name="sender-footer-right" v-bind="getSenderSlotScope(slotProps)" />
    </template>
  </TrSender>
</template>

<style scoped>
.tr-chat-toolbar {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.tr-chat-toolbar > :not(.tr-chat-model-selector) {
  flex: 0 0 auto;
}

@container chat-composer (max-width: 640px) {
  .tr-chat-toolbar {
    gap: 6px;
  }
}
</style>
