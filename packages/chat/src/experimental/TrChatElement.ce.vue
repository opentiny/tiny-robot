<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, useAttrs, watch } from 'vue'
import Chat from '../Chat.vue'
import type {
  Attachment,
  ChatHistoryData,
  ChatBubbleRenderers,
  ChatRightAsidePanelId,
  ChatRuntime,
  ChatSendPayload,
  ChatUIOptions,
  LayoutFloatingState,
} from '../types'
import { useExperimentalElementHost } from './elementHost'
import type { TrChatRenderers } from './elementTypes'
import { createChatRuntime } from './runtime/createChatRuntime'
import { createRuntimeSnapshot } from './runtime/runtimeSnapshot'
import type { CreateChatRuntimeOptions, CreateChatRuntimeResult } from './runtime/types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    runtime?: ChatRuntime
    runtimeOptions?: CreateChatRuntimeOptions
    ui?: ChatUIOptions
    renderers?: Readonly<TrChatRenderers>
    bubbleRenderers?: Readonly<ChatBubbleRenderers>
    floatingState?: LayoutFloatingState
    rightAsideOpen?: boolean
    defaultRightAsideOpen?: boolean
    activeRightAsidePanelId?: ChatRightAsidePanelId
    defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
    historyData?: ChatHistoryData
    attachments?: readonly Attachment[]
  }>(),
  { rightAsideOpen: undefined },
)
const attrs = useAttrs()
const chatTitle = computed(() => (typeof attrs.title === 'string' ? attrs.title : undefined))
const chat = ref<InstanceType<typeof Chat>>()
const resolvedRuntime = shallowRef<ChatRuntime>()
let ownedRuntime: CreateChatRuntimeResult | undefined
let runtimeResolution = 0
let runtimeTransition = Promise.resolve()
let runtimeTransitioning = false
const { forward } = useExperimentalElementHost(
  props as unknown as Record<string, unknown>,
  ['rightAsideOpen', 'defaultRightAsideOpen'],
  () => Boolean(resolvedRuntime.value),
)
const runtimeSnapshot = computed(() => createRuntimeSnapshot(resolvedRuntime.value))

function publishRuntimeState() {
  if (runtimeSnapshot.value) forward('runtime-state-change', runtimeSnapshot.value)
}

function resolveRuntime(runtime: ChatRuntime | undefined, runtimeOptions: CreateChatRuntimeOptions | undefined) {
  const resolution = ++runtimeResolution
  const previousOwnedRuntime = ownedRuntime
  const previousTransition = runtimeTransition
  ownedRuntime = undefined
  runtimeTransitioning = true
  if (previousOwnedRuntime) resolvedRuntime.value = undefined

  runtimeTransition = Promise.allSettled([
    previousTransition,
    ...(previousOwnedRuntime ? [previousOwnedRuntime.dispose()] : []),
  ]).then(() => {
    if (resolution !== runtimeResolution) return

    if (runtime) {
      resolvedRuntime.value = runtime
      runtimeTransitioning = false
      return
    }

    if (!runtimeOptions) {
      resolvedRuntime.value = undefined
      runtimeTransitioning = false
      return
    }

    ownedRuntime = createChatRuntime(runtimeOptions)
    resolvedRuntime.value = ownedRuntime.runtime
    runtimeTransitioning = false
  })
}

watch(
  [() => props.runtime, () => props.runtimeOptions],
  ([runtime, runtimeOptions]) => {
    resolveRuntime(runtime, runtimeOptions)
  },
  { immediate: true },
)
watch(runtimeSnapshot, publishRuntimeState, { deep: true, flush: 'post' })
onMounted(publishRuntimeState)
onUnmounted(() => {
  runtimeResolution++
  runtimeTransitioning = true
  const previousOwnedRuntime = ownedRuntime
  const previousTransition = runtimeTransition
  ownedRuntime = undefined
  resolvedRuntime.value = undefined
  runtimeTransition = Promise.allSettled([
    previousTransition,
    ...(previousOwnedRuntime ? [previousOwnedRuntime.dispose()] : []),
  ]).then(() => undefined)
})

defineExpose({
  send: (payload: ChatSendPayload) =>
    runtimeTransitioning ? Promise.resolve(false) : (chat.value?.send(payload) ?? Promise.resolve(false)),
  getRuntime: () => resolvedRuntime.value,
  getRuntimeSnapshot: () => runtimeSnapshot.value,
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
    :title="chatTitle"
    :floating-state="props.floatingState"
    :right-aside-open="props.rightAsideOpen"
    :default-right-aside-open="props.defaultRightAsideOpen"
    :active-right-aside-panel-id="props.activeRightAsidePanelId"
    :default-active-right-aside-panel-id="props.defaultActiveRightAsidePanelId"
    :history-data="props.historyData"
    :attachments="props.attachments"
    :renderers="props.renderers"
    :bubble-renderers="props.bubbleRenderers"
    @update:floating-state="forward('update:floating-state', $event)"
    @floating-drag-start="forward('floating-drag-start', $event)"
    @floating-drag="forward('floating-drag', $event)"
    @floating-drag-end="forward('floating-drag-end', $event)"
    @floating-resize-start="forward('floating-resize-start', $event)"
    @floating-resize="forward('floating-resize', $event)"
    @floating-resize-end="forward('floating-resize-end', $event)"
    @runtime-action-error="forward('runtime-action-error', $event)"
    @history-action="forward('history-action', $event)"
    @attachments-select="forward('attachments-select', $event)"
    @update:attachments="forward('update:attachments', $event)"
    @attachment-error="forward('attachment-error', $event)"
    @mcp-create-server="forward('mcp-create-server', $event)"
    @extension-action="forward('extension-action', $event)"
    @extension-name-click="forward('extension-name-click', $event)"
    @extension-tab-change="forward('extension-tab-change', $event)"
    @prompt-click="forward('prompt-click', $event)"
    @bubble-state-change="forward('bubble-state-change', $event)"
    @bubble-event="forward('bubble-event', $event)"
    @left-aside-open-change="forward('left-aside-open-change', $event)"
    @right-aside-open-change="forward('right-aside-open-change', $event)"
    @update:right-aside-open="forward('update:right-aside-open', $event)"
    @update:active-right-aside-panel-id="forward('update:active-right-aside-panel-id', $event)"
    @renderer-error="forward('experimental-error', { source: 'renderer', error: $event })"
  >
    <template #header-notice><slot name="header-notice" /></template>
    <template #welcome-footer><slot name="welcome-footer" /></template>
    <template #prompts-footer><slot name="prompts-footer" /></template>
    <template #sender-header><slot name="sender-header" /></template>
    <template #sender-footer><slot name="sender-footer" /></template>
    <template #sender-footer-right><slot name="sender-footer-right" /></template>
  </Chat>
</template>
