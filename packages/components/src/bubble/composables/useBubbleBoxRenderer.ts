import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import { BUBBLE_BOX_RENDERER_MATCHES_KEY, BUBBLE_FALLBACK_BOX_RENDERER_KEY } from '../constants'
import type { BubbleBoxRendererMatch, BubbleRendererMessage } from '../index.type'
import { defaultBoxRendererMatches, defaultFallbackBoxRenderer } from '../renderers/defaultRenderers'

/**
 * Setup bubble box renderer
 * Call this function to provide box renderer matches and fallback renderer
 *
 * @param boxRendererMatches - Array of box renderer matches, can be a ref or getter
 * @param fallbackBoxRenderer - Fallback box renderer component, can be a ref or getter
 */
export function setupBubbleBoxRenderer(renderers: {
  boxRendererMatches?: MaybeRefOrGetter<Array<BubbleBoxRendererMatch>>
  fallbackBoxRenderer?: MaybeRefOrGetter<Component>
}): void {
  const { boxRendererMatches, fallbackBoxRenderer } = renderers
  if (boxRendererMatches) {
    provide(BUBBLE_BOX_RENDERER_MATCHES_KEY, boxRendererMatches)
  }
  if (fallbackBoxRenderer) {
    provide(BUBBLE_FALLBACK_BOX_RENDERER_KEY, fallbackBoxRenderer)
  }
}

/**
 * Composable for box renderer matching
 * Used to match and get the appropriate box renderer component based on messages
 *
 * @param messages - The messages to match against, can be BubbleRendererMessage[], a function that returns it, or a computed ref
 * @returns A computed ref of the matched renderer component
 *
 * @example
 * const renderer = useBubbleBoxRenderer(() => messages)
 */
export function useBubbleBoxRenderer(
  messages: MaybeRefOrGetter<BubbleRendererMessage[]>,
  fallbackRenderer?: MaybeRefOrGetter<Component>,
): ComputedRef<Component> {
  const boxRendererMatches = inject(BUBBLE_BOX_RENDERER_MATCHES_KEY, defaultBoxRendererMatches)
  const fallbackBoxRenderer = inject(BUBBLE_FALLBACK_BOX_RENDERER_KEY)

  return computed(() => {
    const msgs = toValue(messages)
    return (
      toValue(boxRendererMatches).find((match) => match.find(msgs))?.renderer ||
      toValue(fallbackRenderer) ||
      toValue(fallbackBoxRenderer) ||
      defaultFallbackBoxRenderer
    )
  })
}
