import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import {
  BUBBLE_CONTENT_ATTRIBUTES_KEY,
  BUBBLE_CONTENT_FALLBACK_RENDERER_KEY,
  BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY,
  BUBBLE_CONTENT_RENDERER_MATCHES_KEY,
} from '../constants'
import type {
  BubbleAttributes,
  BubbleContentAttributesConfig,
  BubbleContentRendererMatch,
  BubbleMessage,
  ChatMessageContentItem,
} from '../index.type'
import { defaultContentRendererMatches, defaultFallbackContentRenderer } from '../renderers/defaultRenderers'
import { useContentResolver } from './useContentResolver'

export function setupBubbleContentRenderer(renderers: {
  contentRendererMatches?: MaybeRefOrGetter<Array<BubbleContentRendererMatch>>
  contentAttributes?: MaybeRefOrGetter<BubbleContentAttributesConfig | undefined>
  fallbackContentRenderer?: MaybeRefOrGetter<Component>
}): void {
  const { contentRendererMatches, contentAttributes, fallbackContentRenderer } = renderers
  if (contentRendererMatches) {
    provide(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, contentRendererMatches)
  }
  if (contentAttributes) {
    provide(BUBBLE_CONTENT_ATTRIBUTES_KEY, contentAttributes)
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
  contentIndex: number,
): ComputedRef<{
  renderer: Component
  attributes?: BubbleAttributes
}> {
  const contentRendererMatches = inject(BUBBLE_CONTENT_RENDERER_MATCHES_KEY, defaultContentRendererMatches)
  const contentAttributes = inject(BUBBLE_CONTENT_ATTRIBUTES_KEY, undefined)
  const fallbackContentRenderer = inject(BUBBLE_CONTENT_FALLBACK_RENDERER_KEY, undefined)
  const propFallbackContentRenderer = inject(BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY, undefined)
  const contentResolver = useContentResolver()

  return computed(() => {
    const msg = toValue(message)
    const resolvedContent = contentResolver(msg)
    const content = Array.isArray(resolvedContent)
      ? (resolvedContent.at(contentIndex ?? 0) as ChatMessageContentItem)
      : { type: 'text', text: resolvedContent || '' }
    const resolvedProviderAttributes = (() => {
      const attrs = toValue(contentAttributes)
      if (!attrs) {
        return undefined
      }
      return typeof attrs === 'function' ? attrs(msg, content, contentIndex) : attrs
    })()
    const match = toValue(contentRendererMatches).find((match) => match.find(msg, content, contentIndex))
    if (match) {
      return {
        renderer: match.renderer,
        attributes: {
          ...resolvedProviderAttributes,
          ...match.attributes,
        },
      }
    }

    // Priority: prop-level > provider-level > default
    return {
      renderer:
        toValue(propFallbackContentRenderer) || toValue(fallbackContentRenderer) || defaultFallbackContentRenderer,
      attributes: resolvedProviderAttributes,
    }
  })
}
