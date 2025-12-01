<script setup lang="ts">
import { computed, provide } from 'vue'
import {
  BUBBLE_BOX_RENDERER_MATCHES_KEY,
  BUBBLE_CONTENT_RENDERER_MATCHES_KEY,
  BUBBLE_FALLBACK_BOX_RENDERER_KEY,
  BUBBLE_FALLBACK_CONTENT_RENDERER_KEY,
} from './constants'
import type { BubbleProviderProps } from './index.type'
import {
  defaultBoxRendererMatches,
  defaultContentRendererMatches,
  defaultFallbackBoxRenderer,
  defaultFallbackContentRenderer,
} from './ren/defaultRenderers'

const props = defineProps<BubbleProviderProps>()

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

provide(BUBBLE_BOX_RENDERER_MATCHES_KEY, boxRendererMatches)
provide(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, contentRendererMatches)
provide(BUBBLE_FALLBACK_BOX_RENDERER_KEY, fallbackBoxRenderer)
provide(BUBBLE_FALLBACK_CONTENT_RENDERER_KEY, fallbackContentRenderer)
</script>

<template>
  <slot></slot>
</template>
