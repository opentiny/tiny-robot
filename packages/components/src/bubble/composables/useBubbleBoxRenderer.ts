import type { Component, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, inject, toValue } from 'vue'
import { BUBBLE_BOX_RENDERER_MATCHES_KEY, BUBBLE_FALLBACK_BOX_RENDERER_KEY } from '../constants'
import type { BubbleContentBoxProps } from '../index.type'
import { defaultBoxRendererMatches, defaultFallbackBoxRenderer } from '../ren/defaultRenderers'

/**
 * Composable for box renderer matching
 * Used to match and get the appropriate box renderer component based on content box props
 *
 * @param props - The content box props to match against, can be BubbleContentBoxProps, a function that returns it, or a computed ref
 * @returns A computed ref of the matched renderer component
 *
 * @example
 * const renderer = useBubbleBoxRenderer(() => ({
 *   placement: props.placement,
 *   shape: props.shape,
 *   messages: props.messages
 * }))
 */
export function useBubbleBoxRenderer(props: MaybeRefOrGetter<BubbleContentBoxProps>): ComputedRef<Component> {
  const boxRendererMatches = inject(BUBBLE_BOX_RENDERER_MATCHES_KEY, defaultBoxRendererMatches)
  const fallbackBoxRenderer = inject(BUBBLE_FALLBACK_BOX_RENDERER_KEY, defaultFallbackBoxRenderer)

  return computed(() => {
    const boxProps = toValue(props)
    return toValue(boxRendererMatches).find((match) => match.find(boxProps))?.renderer || toValue(fallbackBoxRenderer)
  })
}
