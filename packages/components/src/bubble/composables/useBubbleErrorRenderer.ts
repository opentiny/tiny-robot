import { computed, inject, provide, toValue, type Component, type MaybeRefOrGetter } from 'vue'
import { BUBBLE_ERROR_RENDERER_KEY } from '../constants'
import type { BubbleErrorRendererProps } from '../index.type'
import { BubbleRenderers } from '../renderers/allRenderers'

export function setupBubbleErrorRenderer(renderer: MaybeRefOrGetter<Component<BubbleErrorRendererProps>>): void {
  provide(BUBBLE_ERROR_RENDERER_KEY, renderer)
}

export function useBubbleErrorRenderer() {
  const renderer = inject(BUBBLE_ERROR_RENDERER_KEY, BubbleRenderers.Error)

  return computed(() => toValue(renderer))
}
