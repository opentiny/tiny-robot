<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { shallowRef } from 'vue'
import Chat from '../Chat.vue'
import type { ChatRuntime, ChatUIOptions, ChatHistoryData, LayoutFloatingState } from '../types'
import { useExperimentalElementHost } from './elementHost'
import { CHAT_EVENTS } from './elementEvents'
import { createElementEventListeners, elementEventNames } from './events'
import { useElementMethods } from './elementMethods'
import { ElementSlot, useOrdinaryElementSlots } from './elementSlots'
const ordinarySlots = useOrdinaryElementSlots()
import type { TrChatElementMethods } from './elementTypes'
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
)
const emit = defineEmits(elementEventNames(CHAT_EVENTS))
const props = withDefaults(
  defineProps<{
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
const events = createElementEventListeners(CHAT_EVENTS, emit)
</script>
<template>
  <Chat
    ref="componentRef"
    v-if="props.runtime"
    :runtime="props.runtime"
    :ui="props.ui"
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
    <template v-for="name in ordinarySlots" :key="name" #[name]><ElementSlot :name="name" /></template>
  </Chat>
</template>
