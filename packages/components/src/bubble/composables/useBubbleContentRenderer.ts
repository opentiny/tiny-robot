import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, toValue } from 'vue'
import { BUBBLE_CONTENT_RENDERER_MATCHES_KEY, BUBBLE_FALLBACK_CONTENT_RENDERER_KEY } from '../constants'
import type { BubbleRendererMessage } from '../index.type'
import { defaultContentRendererMatches, defaultFallbackContentRenderer } from '../renderers/defaultRenderers'

/**
 * Composable for nested content renderer matching
 * Used when a renderer needs to render nested content by excluding certain fields from the message
 *
 * @param message - The message to match against, can be a BubbleRendererMessage, a function that returns it, or a computed ref
 * @returns A computed ref of the matched renderer component
 *
 * @example
 * // Exclude reasoning_content field
 * const renderer = useBubbleContentRenderer(() => {
 *   const { reasoning_content: _, ...rest } = props
 *   return rest
 * })
 */
export function useBubbleContentRenderer(message: MaybeRefOrGetter<BubbleRendererMessage>): ComputedRef<Component> {
  const contentRendererMatches = inject(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, defaultContentRendererMatches)
  const fallbackContentRenderer = inject(BUBBLE_FALLBACK_CONTENT_RENDERER_KEY, defaultFallbackContentRenderer)

  return computed(() => {
    const restProps = toValue(message)
    return (
      toValue(contentRendererMatches).find((match) => match.find(restProps))?.renderer ||
      toValue(fallbackContentRenderer)
    )
  })
}
