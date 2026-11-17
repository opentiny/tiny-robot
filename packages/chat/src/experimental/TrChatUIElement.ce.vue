<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { shallowRef } from 'vue'
import ChatUI from '../ChatUI.vue'
import type { ChatUIProps } from '../types'
import { useExperimentalElementHost } from './elementHost'
import { CHAT_UI_EVENTS } from './elementEvents'
import { createElementEventListeners, elementEventNames } from './events'
import { useElementMethods } from './elementMethods'
import { ElementSlot, useOrdinaryElementSlots } from './elementSlots'
const ordinarySlots = useOrdinaryElementSlots()
import type { TrChatUIElementMethods } from './elementTypes'
const componentRef = shallowRef<TrChatUIElementMethods | null>(null)
useElementMethods(
  () => componentRef.value,
  [
    'setInputValue',
    'clearInput',
    'focusInput',
    'openRightAside',
    'closeRightAside',
    'toggleRightAside',
    'activateRightAsidePanel',
  ],
)
const emit = defineEmits(elementEventNames(CHAT_UI_EVENTS))
const props = withDefaults(defineProps<ChatUIProps>(), { isEmpty: undefined, rightAsideOpen: undefined })
useExperimentalElementHost(
  props as unknown as Record<string, unknown>,
  ['isEmpty', 'rightAsideOpen', 'defaultRightAsideOpen'],
  () => emit('ready'),
)
const events = createElementEventListeners(CHAT_UI_EVENTS, emit)
</script>
<template>
  <ChatUI ref="componentRef" v-bind="props" v-on="events">
    <template v-for="name in ordinarySlots" :key="name" #[name]><ElementSlot :name="name" /></template>
  </ChatUI>
</template>
