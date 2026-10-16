<script setup lang="ts">
import { computed } from 'vue'
import { TrSender } from '@opentiny/tiny-robot'
import MCPSelector from './MCPSelector.vue'
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
  isNarrow: boolean
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

const defaultToolbar: readonly ChatSenderToolbarItem[] = [
  { type: 'builtin', id: 'thinking' },
  { type: 'builtin', id: 'search' },
  { type: 'builtin', id: 'model' },
  { type: 'builtin', id: 'mcp' },
]

const toolbarItems = computed(() => {
  const toolbar = props.senderOptions.toolbar
  const items =
    typeof toolbar === 'function' ? toolbar(defaultToolbar, { isNarrow: props.isNarrow }) : (toolbar ?? defaultToolbar)
  const ids = new Set<string>()
  return items
    .filter((item) => {
      if (item.type === 'custom' && defaultToolbar.some((builtin) => builtin.id === item.id)) return false
      if (ids.has(item.id)) return false
      ids.add(item.id)
      if (item.visible === false) return false
      if (item.type === 'custom') return true
      if (item.id === 'mcp') return Boolean(props.mcp)
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

function handleCustomAction(id: string) {
  const item = toolbarItems.value.find((item) => item.id === id)
  if (item?.type !== 'custom' || item.disabled) return
  return item.onClick()
}

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
    <template v-if="$slots['sender-footer'] || toolbarItems.length" #footer>
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
          <MCPSelector
            v-else-if="item.id === 'mcp' && mcp"
            :mcp="mcp"
            :labels="labels"
            :disabled="item.disabled"
            @open="handleOpenMcpPanel"
            @add-server="handleAddServer"
            @remove-server="handleRemoveServer"
            @update-server-enabled="handleServerEnabledChange"
            @update-tool-enabled="handleToolEnabledChange"
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
      <slot name="sender-footer" />
    </template>
    <template v-if="$slots['sender-footer-right']" #footer-right>
      <slot name="sender-footer-right" />
    </template>
  </TrSender>
</template>

<style scoped>
.tr-chat-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@container chat-composer (max-width: 640px) {
  .tr-chat-toolbar {
    flex-wrap: nowrap;
    gap: 6px;
  }
}
</style>
