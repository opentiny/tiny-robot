import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import {
  BUBBLE_BOX_RENDERER_MATCHES_KEY,
  BUBBLE_BOX_FALLBACK_RENDERER_KEY,
  BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY,
} from '../constants'
import type { BubbleBoxRendererMatch, BubbleContent } from '../index.type'
import { defaultBoxRendererMatches, defaultFallbackBoxRenderer } from '../renderers/defaultRenderers'

export function setupBubbleBoxRenderer(renderers: {
  boxRendererMatches?: MaybeRefOrGetter<Array<BubbleBoxRendererMatch>>
  fallbackBoxRenderer?: MaybeRefOrGetter<Component>
}): void {
  const { boxRendererMatches, fallbackBoxRenderer } = renderers
  if (boxRendererMatches) {
    provide(BUBBLE_BOX_RENDERER_MATCHES_KEY, boxRendererMatches)
  }
  if (fallbackBoxRenderer) {
    provide(BUBBLE_BOX_FALLBACK_RENDERER_KEY, fallbackBoxRenderer)
  }
}

/**
 * Setup prop-level fallback box renderer
 * Used in Bubble component to provide prop-level configuration that won't override parent provider
 */
export function setupBubblePropBoxRenderer(renderers: {
  fallbackBoxRenderer?: MaybeRefOrGetter<Component | undefined>
}): void {
  const { fallbackBoxRenderer } = renderers
  if (fallbackBoxRenderer) {
    provide(BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY, fallbackBoxRenderer)
  }
}

export function useBubbleBoxRenderer(
  messages: MaybeRefOrGetter<BubbleContent[]>,
  contentIndex?: number,
): ComputedRef<{
  renderer: Component
  attributes?: Record<string, string>
}> {
  const boxRendererMatches = inject(BUBBLE_BOX_RENDERER_MATCHES_KEY, defaultBoxRendererMatches)
  const fallbackBoxRenderer = inject(BUBBLE_BOX_FALLBACK_RENDERER_KEY, undefined)
  const propFallbackBoxRenderer = inject(BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY, undefined)

  return computed(() => {
    const msgs = toValue(messages)

    const match = toValue(boxRendererMatches).find((match) => match.find(msgs, contentIndex))

    if (match) {
      return {
        renderer: match.renderer,
        attributes: match.attributes,
      }
    }

    // Priority: prop-level > provider-level > default
    return {
      renderer: toValue(propFallbackBoxRenderer) || toValue(fallbackBoxRenderer) || defaultFallbackBoxRenderer,
    }
  })
}
