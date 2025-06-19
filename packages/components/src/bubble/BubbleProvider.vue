<script setup lang="ts">
import { provide } from 'vue'
import {
  defaultMessageRendererMap,
  RENDERER_MAP_PROVIDER_KEY,
  FALLBACK_RENDERER_PROVIDER_KEY,
  BubbleTextMessageRenderer,
  BubbleMessageRenderer,
} from './message'

const props = defineProps<{
  messageRenderers: Record<string, BubbleMessageRenderer>
}>()

const bubbleMessageRendererMap = new Map<string, BubbleMessageRenderer>()

for (const [type, renderer] of defaultMessageRendererMap.entries()) {
  bubbleMessageRendererMap.set(type, renderer)
}

for (const [type, renderer] of Object.entries(props.messageRenderers)) {
  bubbleMessageRendererMap.set(type, renderer)
}

provide(RENDERER_MAP_PROVIDER_KEY, bubbleMessageRendererMap)
provide(FALLBACK_RENDERER_PROVIDER_KEY, BubbleTextMessageRenderer)
</script>

<template>
  <slot></slot>
</template>
