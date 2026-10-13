<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import Chat from '../Chat.vue'
import type {
  ChatHistoryData,
  ChatRightAsidePanelId,
  ChatRuntime,
  ChatSendPayload,
  ChatUIOptions,
  LayoutFloatingState,
} from '../types'
import { RendererOutlet } from './elementRenderers'
import { useExperimentalElementHost } from './elementHost'
import type { TrChatRenderers } from './elementTypes'
import { createChatRuntime } from './runtime/createChatRuntime'
import type { CreateChatRuntimeOptions, CreateChatRuntimeResult } from './runtime/types'

const props = withDefaults(
  defineProps<{
    runtime?: ChatRuntime
    runtimeOptions?: CreateChatRuntimeOptions
    ui?: ChatUIOptions
    renderers?: Readonly<TrChatRenderers>
    title?: string
    floatingState?: LayoutFloatingState
    rightAsideOpen?: boolean
    defaultRightAsideOpen?: boolean
    activeRightAsidePanelId?: ChatRightAsidePanelId
    defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
    historyData?: ChatHistoryData
  }>(),
  { rightAsideOpen: undefined },
)
const chat = ref<InstanceType<typeof Chat>>()
const resolvedRuntime = shallowRef<ChatRuntime>()
let ownedRuntime: CreateChatRuntimeResult | undefined
const { forward } = useExperimentalElementHost(props as unknown as Record<string, unknown>, [
  'rightAsideOpen',
  'defaultRightAsideOpen',
])

function resolveRuntime(runtime: ChatRuntime | undefined) {
  if (runtime) {
    void ownedRuntime?.dispose()
    ownedRuntime = undefined
    resolvedRuntime.value = runtime
    return
  }

  ownedRuntime = createChatRuntime(props.runtimeOptions ?? {})
  resolvedRuntime.value = ownedRuntime.runtime
}

watch(() => props.runtime, resolveRuntime, { immediate: true })
onUnmounted(() => void ownedRuntime?.dispose())

defineExpose({
  send: (payload: ChatSendPayload) => chat.value?.send(payload) ?? Promise.resolve(false),
  getRuntime: () => resolvedRuntime.value,
  openRightAside: (panel?: ChatRightAsidePanelId) => chat.value?.openRightAside(panel),
  closeRightAside: () => chat.value?.closeRightAside(),
  toggleRightAside: (panel?: ChatRightAsidePanelId) => chat.value?.toggleRightAside(panel),
  activateRightAsidePanel: (panel: ChatRightAsidePanelId) => chat.value?.activateRightAsidePanel(panel) ?? false,
})
</script>

<template>
  <Chat
    v-if="resolvedRuntime"
    ref="chat"
    :runtime="resolvedRuntime"
    :ui="props.ui"
    :title="props.title"
    :floating-state="props.floatingState"
    :right-aside-open="props.rightAsideOpen"
    :default-right-aside-open="props.defaultRightAsideOpen"
    :active-right-aside-panel-id="props.activeRightAsidePanelId"
    :default-active-right-aside-panel-id="props.defaultActiveRightAsidePanelId"
    :history-data="props.historyData"
    @update:floating-state="forward('update:floating-state', $event)"
    @floating-drag-start="forward('floating-drag-start', $event)"
    @floating-drag="forward('floating-drag', $event)"
    @floating-drag-end="forward('floating-drag-end', $event)"
    @floating-resize-start="forward('floating-resize-start', $event)"
    @floating-resize="forward('floating-resize', $event)"
    @floating-resize-end="forward('floating-resize-end', $event)"
    @runtime-action-error="forward('runtime-action-error', $event)"
    @history-action="forward('history-action', $event)"
    @mcp-create-server="forward('mcp-create-server', $event)"
    @prompt-click="forward('prompt-click', $event)"
    @bubble-state-change="forward('bubble-state-change', $event)"
    @bubble-event="forward('bubble-event', $event)"
    @left-aside-open-change="forward('left-aside-open-change', $event)"
    @right-aside-open-change="forward('right-aside-open-change', $event)"
    @update:right-aside-open="forward('update:right-aside-open', $event)"
    @update:active-right-aside-panel-id="forward('update:active-right-aside-panel-id', $event)"
  >
    <template v-for="name in Object.keys(props.renderers ?? {})" #[name]="slotProps" :key="name">
      <RendererOutlet
        v-if="props.renderers?.[name as keyof TrChatRenderers]"
        :renderer="props.renderers[name as keyof TrChatRenderers]!"
        :context="name === 'layout-empty-state' ? { ...slotProps, renderComposer: undefined } : slotProps"
      />
    </template>
    <template #header-notice><slot name="header-notice" /></template>
    <template #welcome-footer><slot name="welcome-footer" /></template>
    <template #prompts-footer><slot name="prompts-footer" /></template>
    <template #sender-header><slot name="sender-header" /></template>
    <template #sender-footer><slot name="sender-footer" /></template>
    <template #sender-footer-right><slot name="sender-footer-right" /></template>
  </Chat>
</template>
