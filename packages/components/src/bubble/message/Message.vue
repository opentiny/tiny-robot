<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { BubbleMessageClassRenderer } from './class-renderer'
import {
  defaultMessageRendererMap,
  FALLBACK_RENDERER_PROVIDER_KEY,
  RENDERER_MAP_PROVIDER_KEY,
} from './defaultRendererMap'
import { BubbleMessageFunctionRenderer, BubbleMessageProps, BubbleMessageRenderer } from './index.type'
import { BubbleTextMessageRenderer } from './text'

const rendererMap: Map<string, BubbleMessageRenderer> = inject(RENDERER_MAP_PROVIDER_KEY, defaultMessageRendererMap)
const fallbackRenderer: BubbleMessageRenderer = inject(FALLBACK_RENDERER_PROVIDER_KEY, BubbleTextMessageRenderer)

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleMessageProps>()
const attrs = useAttrs()

const getVNodeOrComponent = (type: string) => {
  const options = { ...attrs, ...props }

  const renderer = rendererMap.get(type) || fallbackRenderer

  if (typeof renderer === 'function') {
    const renderFn = renderer as BubbleMessageFunctionRenderer
    return { isComponent: false, vNodeOrComponent: renderFn(options) }
  }

  if (renderer instanceof BubbleMessageClassRenderer) {
    return { isComponent: false, vNodeOrComponent: renderer.render(options) }
  }

  if (typeof renderer === 'object' && 'component' in renderer) {
    return { isComponent: true, vNodeOrComponent: renderer.component, defaultProps: renderer.defaultProps }
  }

  return { isComponent: true, vNodeOrComponent: renderer }
}

const { isComponent, vNodeOrComponent, defaultProps } = getVNodeOrComponent(props.type)
</script>

<template>
  <component
    v-if="isComponent"
    :is="vNodeOrComponent"
    v-bind="{ ...defaultProps, ...props, ...attrs }"
    :data-type="props.type"
  ></component>
  <component v-else :is="vNodeOrComponent" :data-type="props.type"></component>
</template>
