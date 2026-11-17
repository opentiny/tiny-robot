<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { computed, shallowRef } from 'vue'
import ElementRenderer from './ElementScopedSlot'
import { useElementBubbleContent } from './ElementBubbleContent'
import type { ChatBubbleRenderers } from './elementBubbleRenderers'
import { elementUIOptions, useElementRendererHost } from './elementRendererHost'
import { SCOPED_RENDERER_NAMES, type ChatRenderers } from './elementRenderers'
import ChatUI from '../ChatUI.vue'
import type { ChatUIProps } from '../types'
import { useExperimentalElementHost } from './elementHost'
import { CHAT_UI_EVENTS } from './elementEvents'
import { createElementEventListeners, elementEventNames } from './events'
import { useElementMethods } from './elementMethods'
import { ElementSlot, useOrdinaryElementSlots } from './elementSlots'
const hostSlots = useOrdinaryElementSlots()
const ordinarySlots = computed(() =>
  hostSlots.value.filter((name) => !rendererNames.value.some((renderer) => renderer === name)),
)
import type { TrChatUIElementMethods } from './elementTypes'
const rendererFocus = useElementRendererHost()
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
  () => (rendererFocus.value ? { focusInput: rendererFocus.value.focus } : {}),
)
const emit = defineEmits([...elementEventNames(CHAT_UI_EVENTS), 'renderer-error'])
const props = withDefaults(
  defineProps<ChatUIProps & { bubbleRenderers?: Readonly<ChatBubbleRenderers>; renderers?: Readonly<ChatRenderers> }>(),
  {
    isEmpty: undefined,
    rightAsideOpen: undefined,
  },
)
useExperimentalElementHost(
  props as unknown as Record<string, unknown>,
  ['isEmpty', 'rightAsideOpen', 'defaultRightAsideOpen'],
  () => emit('ready'),
)
const events = createElementEventListeners(CHAT_UI_EVENTS, emit)
const rendererNames = computed(() =>
  SCOPED_RENDERER_NAMES.filter((name) => typeof props.renderers?.[name] === 'function'),
)
const bubbleUI = useElementBubbleContent(
  () => props.bubbleRenderers,
  (error) => emit('renderer-error', error),
)
const componentProps = computed(() => {
  const value = { ...props }
  delete value.bubbleRenderers
  delete value.renderers
  value.ui = bubbleUI(elementUIOptions(props.ui))
  return value
})
</script>
<template>
  <ChatUI ref="componentRef" v-bind="componentProps" v-on="events">
    <template v-for="name in rendererNames" :key="name" #[name]="context">
      <ElementRenderer
        :name="name"
        :context="context"
        :renderer="props.renderers![name]!"
        @error="emit('renderer-error', $event)"
      />
    </template>
    <template v-for="name in ordinarySlots" :key="name" #[name]><ElementSlot :name="name" /></template>
  </ChatUI>
</template>
