import type { Component, InjectionKey, MaybeRefOrGetter } from 'vue'
import { BubbleBoxRendererMatch, BubbleContentRendererMatch, BubbleMessageGroup } from './index.type'

/**
 * Injection key for bubble message group
 * Used to provide/inject message group between BubbleItem and Bubble components
 */
export const BUBBLE_MESSAGE_GROUP_KEY: InjectionKey<MaybeRefOrGetter<BubbleMessageGroup | undefined>> =
  Symbol('bubble-message-group')

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

export const BUBBLE_STATE_CHANGE_FN_KEY: InjectionKey<(key: string, value: unknown) => void> =
  Symbol('bubble-state-change-fn')

export const BubbleRendererMatchPriority = {
  LOADING: -1,
  NORMAL: 0,
  CONTENT: 10,
  ROLE: 20,
} as const
