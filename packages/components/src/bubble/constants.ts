import type { Component, InjectionKey, MaybeRefOrGetter } from 'vue'
import { BubbleBoxRendererMatch, BubbleContent, BubbleContentRendererMatch, BubbleMessageGroup } from './index.type'

/**
 * Injection key for bubble message group
 * Used to provide/inject message group between BubbleItem and Bubble components
 */
export const BUBBLE_MESSAGE_GROUP_KEY: InjectionKey<MaybeRefOrGetter<BubbleMessageGroup | undefined>> =
  Symbol('bubble-message-group')

/**
 * Injection key for bubble content message
 * Used to provide/inject current message between BubbleContent and renderer components
 */
export const BUBBLE_CONTENT_MESSAGE_KEY: InjectionKey<BubbleContent> = Symbol('bubble-content-message')

export const BUBBLE_BOX_RENDERER_MATCHES_KEY: InjectionKey<MaybeRefOrGetter<Array<BubbleBoxRendererMatch>>> =
  Symbol('bubble-box-renderer-matches')

export const BUBBLE_BOX_FALLBACK_RENDERER_KEY: InjectionKey<MaybeRefOrGetter<Component>> =
  Symbol('bubble-box-fallback-renderer')

export const BUBBLE_BOX_PROP_FALLBACK_RENDERER_KEY: InjectionKey<MaybeRefOrGetter<Component | undefined>> = Symbol(
  'bubble-box-prop-fallback-renderer',
)

export const BUBBLE_CONTENT_RENDERER_MATCHES_KEY: InjectionKey<MaybeRefOrGetter<Array<BubbleContentRendererMatch>>> =
  Symbol('bubble-content-renderer-matches')

export const BUBBLE_CONTENT_FALLBACK_RENDERER_KEY: InjectionKey<MaybeRefOrGetter<Component>> = Symbol(
  'bubble-content-fallback-renderer',
)

export const BUBBLE_CONTENT_PROP_FALLBACK_RENDERER_KEY: InjectionKey<MaybeRefOrGetter<Component | undefined>> = Symbol(
  'bubble-content-prop-fallback-renderer',
)

/**
 * Injection key for bubble store
 * Used to provide/inject a global store for sharing data between BubbleList and Bubble components
 */
export const BUBBLE_STORE_KEY: InjectionKey<Record<string, unknown>> = Symbol('bubble-store')

export const BubbleRendererMatchPriority = {
  LOADING: -1,
  NORMAL: 0,
  CONTENT: 10,
  ROLE: 20,
} as const
