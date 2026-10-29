<script setup lang="ts">
import {
  useBubbleEventFn,
  useBubbleStateChangeFn,
  useBubbleStore,
  useMessageContent,
} from '../../../components/src/bubble/composables'
import type { BubbleContentRendererProps } from '../../../components/src/bubble/index.type'

const props = defineProps<BubbleContentRendererProps>()
const emitBubbleEvent = useBubbleEventFn()
const emitStateChange = useBubbleStateChangeFn()
const store = useBubbleStore<{ label?: string }>()
const { content } = useMessageContent(props)
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
