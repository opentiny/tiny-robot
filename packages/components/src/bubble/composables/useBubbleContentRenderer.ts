import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import {
  BUBBLE_CONTENT_RENDERER_MATCHES_KEY,
  BUBBLE_CONTENT_FALLBACK_RENDERER_KEY,
  BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY,
} from '../constants'
import type { BubbleMessage, BubbleContentRendererMatch } from '../index.type'
import { defaultContentRendererMatches, defaultFallbackContentRenderer } from '../renderers/defaultRenderers'

export function setupBubbleContentRenderer(renderers: {
  contentRendererMatches?: MaybeRefOrGetter<Array<BubbleContentRendererMatch>>
  fallbackContentRenderer?: MaybeRefOrGetter<Component>
}): void {
  const { contentRendererMatches, fallbackContentRenderer } = renderers
  if (contentRendererMatches) {
    provide(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, contentRendererMatches)
  }
  if (fallbackContentRenderer) {
    provide(BUBBLE_CONTENT_FALLBACK_RENDERER_KEY, fallbackContentRenderer)
  }
}

/**
 * Setup prop-level fallback content renderer
 * Used in Bubble component to provide prop-level configuration that won't override parent provider
 */
export function setupBubblePropContentRenderer(renderers: {
  fallbackContentRenderer?: MaybeRefOrGetter<Component | undefined>
}): void {
  const { fallbackContentRenderer } = renderers
  if (fallbackContentRenderer) {
    provide(BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY, fallbackContentRenderer)
  }
}

export function useBubbleContentRenderer(
  message: MaybeRefOrGetter<BubbleMessage>,
  contentIndex?: number,
): ComputedRef<Component> {
  const contentRendererMatches = inject(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, defaultContentRendererMatches)
  const fallbackContentRenderer = inject(BUBBLE_CONTENT_FALLBACK_RENDERER_KEY, undefined)
  const propFallbackContentRenderer = inject(BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY, undefined)

  return computed(() => {
    const msg = toValue(message)

    const match = toValue(contentRendererMatches).find((match) => match.find(msg, contentIndex))
    if (match) {
      return match.renderer
    }

    // Priority: prop-level > provider-level > default
    return toValue(propFallbackContentRenderer) || toValue(fallbackContentRenderer) || defaultFallbackContentRenderer
  })
}
