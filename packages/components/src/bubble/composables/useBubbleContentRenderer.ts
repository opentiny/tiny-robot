import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import { BUBBLE_CONTENT_RENDERER_MATCHES_KEY, BUBBLE_FALLBACK_CONTENT_RENDERER_KEY } from '../constants'
import type { BubbleContentRendererMatch, BubbleRendererMessage } from '../index.type'
import { defaultContentRendererMatches, defaultFallbackContentRenderer } from '../renderers/defaultRenderers'

/**
 * Setup bubble content renderer
 * Call this function to provide content renderer matches and fallback renderer
 *
 * @param contentRendererMatches - Array of content renderer matches, can be a ref or getter
 * @param fallbackContentRenderer - Fallback content renderer component, can be a ref or getter
 */
export function setupBubbleContentRenderer(renderers: {
  contentRendererMatches?: MaybeRefOrGetter<Array<BubbleContentRendererMatch>>
  fallbackContentRenderer?: MaybeRefOrGetter<Component>
}): void {
  const { contentRendererMatches, fallbackContentRenderer } = renderers
  if (contentRendererMatches) {
    provide(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, contentRendererMatches)
  }
  if (fallbackContentRenderer) {
    provide(BUBBLE_FALLBACK_CONTENT_RENDERER_KEY, fallbackContentRenderer)
  }
}

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
export function useBubbleContentRenderer(
  message: MaybeRefOrGetter<BubbleRendererMessage>,
  fallbackRenderer?: MaybeRefOrGetter<Component>,
): ComputedRef<Component> {
  const contentRendererMatches = inject(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, defaultContentRendererMatches)
  const fallbackContentRenderer = inject(BUBBLE_FALLBACK_CONTENT_RENDERER_KEY)

  return computed(() => {
    const msg = toValue(message)
    return (
      toValue(contentRendererMatches).find((match) => match.find(msg))?.renderer ||
      toValue(fallbackRenderer) ||
      toValue(fallbackContentRenderer) ||
      defaultFallbackContentRenderer
    )
  })
}
