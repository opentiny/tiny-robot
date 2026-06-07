<script setup lang="ts">
import { computed } from 'vue'
import { setupBubbleEventFn, useBubbleContentRenderer } from './composables'
import type { BubbleContentRendererProps, BubbleEvent, BubbleStateUpdateEvent } from './index.type'

const props = defineProps<BubbleContentRendererProps>()

const renderer = useBubbleContentRenderer(() => props.message, props.contentIndex)
const componentProps = computed(() => ({
  ...renderer.value.attributes,
  message: props.message,
  contentIndex: props.contentIndex,
}))

const emit = defineEmits<{
  (e: 'state-change', payload: { key: string; value: unknown; contentIndex: number }): void
  (e: 'bubble-event', payload: BubbleEvent & { contentIndex: number }): void
}>()

const handleBubbleEvent = (event: BubbleEvent) => {
  emit('bubble-event', {
    ...event,
    contentIndex: props.contentIndex,
  })

  if (event.name === 'state:update') {
    const payload = event.payload as BubbleStateUpdateEvent['payload']

    emit('state-change', {
      key: payload.key,
      value: payload.value,
      contentIndex: props.contentIndex,
    })
  }
}

setupBubbleEventFn(handleBubbleEvent)
</script>

<template>
  <component :is="renderer.renderer" v-bind="componentProps"></component>
</template>
