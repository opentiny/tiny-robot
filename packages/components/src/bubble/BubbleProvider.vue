<script setup lang="ts">
import { provide } from 'vue'
import {
  BubbleContentRenderer,
  BubbleTextContentRenderer,
  defaultContentRendererMap,
  FALLBACK_RENDERER_PROVIDER_KEY,
  RENDERER_MAP_PROVIDER_KEY,
} from './renderers'

const props = withDefaults(
  defineProps<{
    contentRenderers?: Record<string, BubbleContentRenderer>
  }>(),
  {
    contentRenderers: () => ({}),
  },
)

const bubbleContentRendererMap = new Map<string, BubbleContentRenderer>()

for (const [type, renderer] of defaultContentRendererMap.entries()) {
  bubbleContentRendererMap.set(type, renderer)
}

for (const [type, renderer] of Object.entries(props.contentRenderers)) {
  bubbleContentRendererMap.set(type, renderer)
}

provide(RENDERER_MAP_PROVIDER_KEY, bubbleContentRendererMap)
provide(FALLBACK_RENDERER_PROVIDER_KEY, BubbleTextContentRenderer)
</script>

<template>
  <slot></slot>
</template>
