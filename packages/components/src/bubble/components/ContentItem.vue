<script setup lang="ts">
import { inject, useAttrs } from 'vue'
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

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentItem>()
const attrs = useAttrs()

const getVNodeOrComponent = (type: string) => {
  const options = { ...attrs, ...props }

  const renderer = rendererMap.get(type) || fallbackRenderer

  if (typeof renderer === 'function') {
    const renderFn = renderer as BubbleContentFunctionRenderer
    return { isComponent: false, vNodeOrComponent: renderFn(options) }
  }

  if (renderer instanceof BubbleContentClassRenderer) {
    return { isComponent: false, vNodeOrComponent: renderer.render(options) }
  }

  return { isComponent: true, vNodeOrComponent: renderer }
}

const { isComponent, vNodeOrComponent } = getVNodeOrComponent(props.type)
</script>

<template>
  <component v-if="isComponent" :is="vNodeOrComponent" v-bind="{ ...props, ...attrs }"></component>
  <component v-else :is="vNodeOrComponent"></component>
</template>
