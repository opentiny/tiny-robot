<script setup lang="ts">
import { computed } from 'vue'
import { useBubbleEventFn, useBubbleStateChangeFn, useBubbleStore } from '../../../components/src/bubble/composables'
import type { BubbleContentRendererProps, ChatMessageContentItem } from '../../../components/src/bubble/index.type'

const props = defineProps<BubbleContentRendererProps>()
const emitBubbleEvent = useBubbleEventFn()
const emitStateChange = useBubbleStateChangeFn()
const store = useBubbleStore<{ label?: string }>()

const content = computed(() => {
  if (!Array.isArray(props.message.content)) return undefined
  return props.message.content[props.contentIndex] as ChatMessageContentItem | undefined
})
</script>

<template>
  <article
    data-testid="test-content-renderer"
    :data-content-index="props.contentIndex"
    :data-store-label="store.label || ''"
  >
    <span>{{ content?.text || content?.label || 'custom content' }}</span>
    <button type="button" @click="emitStateChange('expanded', true)">Update bubble state</button>
    <button type="button" @click="emitBubbleEvent({ name: 'retry', payload: { source: 'renderer' } })">
      Retry bubble
    </button>
  </article>
</template>
