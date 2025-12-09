<script setup lang="ts">
import { computed } from 'vue'
import { setupBubbleBoxRenderer, setupBubbleContentRenderer, setupBubbleStore } from './composables'
import type { BubbleProviderProps } from './index.type'
import {
  defaultBoxRendererMatches,
  defaultContentRendererMatches,
  defaultFallbackBoxRenderer,
  defaultFallbackContentRenderer,
} from './renderers/defaultRenderers'

const props = defineProps<BubbleProviderProps>()

setupBubbleStore(props.initialStore)

const boxRendererMatches = computed(() => {
  return (props.boxRendererMatches || [])
    .concat(defaultBoxRendererMatches)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
})

const contentRendererMatches = computed(() => {
  return (props.contentRendererMatches || [])
    .concat(defaultContentRendererMatches)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
})

const fallbackBoxRenderer = computed(() => {
  return props.fallbackBoxRenderer || defaultFallbackBoxRenderer
})

const fallbackContentRenderer = computed(() => {
  return props.fallbackContentRenderer || defaultFallbackContentRenderer
})

setupBubbleBoxRenderer(boxRendererMatches, fallbackBoxRenderer)
setupBubbleContentRenderer(contentRendererMatches, fallbackContentRenderer)
</script>

<template>
  <slot></slot>
</template>
