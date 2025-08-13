<script setup lang="ts">
import { computed, inject } from 'vue'
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
    return { isComponent: false, vNodeOrComponent: renderFn(props.item) }
  }

  if (renderer instanceof BubbleContentClassRenderer) {
    return { isComponent: false, vNodeOrComponent: renderer.render(props.item) }
  }

  return { isComponent: true, vNodeOrComponent: renderer }
}

const contentRenderer = computed(() => {
  return getVNodeOrComponent(props.item.type)
})
</script>

<template>
  <component v-if="contentRenderer.isComponent" :is="contentRenderer.vNodeOrComponent" v-bind="props.item"></component>
  <component v-else :is="contentRenderer.vNodeOrComponent"></component>
</template>
