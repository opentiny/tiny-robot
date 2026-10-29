import { computed, inject, provide, toValue, type Component, type MaybeRefOrGetter } from 'vue'
import { BUBBLE_ERROR_RENDERER_KEY } from '../constants'
import type { BubbleErrorRendererProps } from '../index.type'

export function setupBubbleErrorRenderer(
  renderer: MaybeRefOrGetter<Component<BubbleErrorRendererProps> | null | undefined>,
): void {
  provide(BUBBLE_ERROR_RENDERER_KEY, renderer)
}

export function useBubbleErrorRenderer() {
  const renderer = inject(BUBBLE_ERROR_RENDERER_KEY)

  return computed(() => toValue(renderer))
}
