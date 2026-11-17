<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { computed, shallowRef } from 'vue'
import ElementRenderer from './ElementScopedSlot'
import { elementUIOptions, useElementRendererHost } from './elementRendererHost'
import { SCOPED_RENDERER_NAMES, type ChatRenderers } from './elementRenderers'
import Chat from '../Chat.vue'
import type { ChatRuntime, ChatUIOptions, ChatHistoryData, LayoutFloatingState } from '../types'
import { useExperimentalElementHost } from './elementHost'
import { CHAT_EVENTS } from './elementEvents'
import { createElementEventListeners, elementEventNames } from './events'
import { useElementMethods } from './elementMethods'
import { ElementSlot, useOrdinaryElementSlots } from './elementSlots'
const hostSlots = useOrdinaryElementSlots()
const ordinarySlots = computed(() =>
  hostSlots.value.filter((name) => !rendererNames.value.some((renderer) => renderer === name)),
)
import type { TrChatElementMethods } from './elementTypes'
const rendererFocus = useElementRendererHost(() => props.runtime)
const componentRef = shallowRef<TrChatElementMethods | null>(null)
useElementMethods(
  () => componentRef.value,
  [
    'send',
    'setInputValue',
    'clearInput',
    'focusInput',
    'openRightAside',
    'closeRightAside',
    'toggleRightAside',
    'activateRightAsidePanel',
  ],
  () => (rendererFocus.value ? { focusInput: rendererFocus.value.focus } : {}),
)
const emit = defineEmits([...elementEventNames(CHAT_EVENTS), 'renderer-error'])
const props = withDefaults(
  defineProps<{
    renderers?: Readonly<ChatRenderers>
    title?: string
    runtime?: ChatRuntime
    ui?: Readonly<ChatUIOptions>
    floatingState?: LayoutFloatingState
    historyData?: ChatHistoryData
    isEmpty?: boolean
    rightAsideOpen?: boolean
    defaultRightAsideOpen?: boolean
    activeRightAsidePanelId?: string
    defaultActiveRightAsidePanelId?: string
  }>(),
  { isEmpty: undefined, rightAsideOpen: undefined },
)
useExperimentalElementHost(
  props as unknown as Record<string, unknown>,
  ['isEmpty', 'rightAsideOpen', 'defaultRightAsideOpen'],
  () => emit('ready'),
  () => Boolean(props.runtime),
)
const componentUI = computed(() => elementUIOptions(props.ui))
const events = createElementEventListeners(CHAT_EVENTS, emit)
const rendererNames = computed(() =>
  SCOPED_RENDERER_NAMES.filter((name) => typeof props.renderers?.[name] === 'function'),
)
</script>
<template>
  <Chat
    ref="componentRef"
    v-if="props.runtime"
    :runtime="props.runtime"
    :ui="componentUI"
    :floating-state="props.floatingState"
    :history-data="props.historyData"
    :is-empty="props.isEmpty"
    :title="props.title"
    :right-aside-open="props.rightAsideOpen"
    :default-right-aside-open="props.defaultRightAsideOpen"
    :active-right-aside-panel-id="props.activeRightAsidePanelId"
    :default-active-right-aside-panel-id="props.defaultActiveRightAsidePanelId"
    v-on="events"
  >
    <template v-for="name in rendererNames" :key="name" #[name]="context">
      <ElementRenderer
        :name="name"
        :context="context"
        :renderer="props.renderers![name]!"
        @error="emit('renderer-error', $event)"
      />
    </template>
    <template v-for="name in ordinarySlots" :key="name" #[name]><ElementSlot :name="name" /></template>
  </Chat>
</template>
