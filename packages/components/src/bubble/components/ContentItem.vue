<script setup lang="ts">
import { computed, h, inject } from 'vue'
import { BubbleContentClassRenderer } from '../renderers/class-renderer'
import {
  defaultContentRendererMap,
  FALLBACK_RENDERER_PROVIDER_KEY,
  RENDERER_MAP_PROVIDER_KEY,
} from '../renderers/defaultRendererMap'
import { BubbleContentFunctionRenderer, BubbleContentItem, BubbleContentRenderer } from '../renderers/index.type'
import { BubbleTextContentRenderer } from '../renderers/text'

const rendererMap: Map<string, BubbleContentRenderer> = inject(RENDERER_MAP_PROVIDER_KEY, defaultContentRendererMap)
const fallbackRenderer: BubbleContentRenderer = inject(FALLBACK_RENDERER_PROVIDER_KEY, BubbleTextContentRenderer)

const props = defineProps<{ item: BubbleContentItem }>()

const getVNodeOrComponent = (type: string) => {
  const renderer = rendererMap.get(type) || fallbackRenderer

  if (typeof renderer === 'function') {
    const renderFn = renderer as BubbleContentFunctionRenderer
    return h(() => renderFn(props.item))
  }

  if (renderer instanceof BubbleContentClassRenderer) {
    return h(() => renderer.render(props.item))
  }

  return h(renderer, props.item)
}

const contentRenderer = computed(() => {
  return getVNodeOrComponent(props.item.type)
})
</script>

<template>
  <component :is="contentRenderer"></component>
</template>
