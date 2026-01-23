import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import {
  BUBBLE_BOX_FALLBACK_RENDERER_KEY,
  BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY,
  BUBBLE_BOX_RENDERER_MATCHES_KEY,
} from '../constants'
import type { BubbleBoxRendererMatch, BubbleMessage, ChatMessageContentItem } from '../index.type'
import { defaultBoxRendererMatches, defaultFallbackBoxRenderer } from '../renderers/defaultRenderers'
import { useContentResolver } from './useContentResolver'

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
  messages: MaybeRefOrGetter<BubbleMessage[]>,
  contentIndex?: number,
): ComputedRef<{
  renderer: Component
  attributes?: Record<string, string>
}> {
  const boxRendererMatches = inject(BUBBLE_BOX_RENDERER_MATCHES_KEY, defaultBoxRendererMatches)
  const fallbackBoxRenderer = inject(BUBBLE_BOX_FALLBACK_RENDERER_KEY, undefined)
  const propFallbackBoxRenderer = inject(BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY, undefined)
  const contentResolver = useContentResolver()

  // 如果 contentIndex 为数字，说明是 split 模式，当前 messages 数组长度为 1
  if (typeof contentIndex === 'number') {
    if (toValue(messages).length !== 1) {
      throw new Error('[BubbleBoxRenderer] When contentIndex is a number, messages array length must be 1')
    }
  }

  const getContentAndIndex = (msgs: BubbleMessage[]) => {
    if (msgs.length !== 1) {
      return { content: undefined, index: undefined }
    }
    const resolvedContent = contentResolver(msgs.at(0)!)
    return {
      content: Array.isArray(resolvedContent)
        ? (resolvedContent.at(contentIndex ?? 0) as ChatMessageContentItem)
        : { type: 'text', text: resolvedContent || '' },
      index: contentIndex ?? 0,
    }
  }

  return computed(() => {
    const msgs = toValue(messages)

    const { content, index } = getContentAndIndex(msgs)

    const match = toValue(boxRendererMatches).find((match) => match.find(msgs, content, index))

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
