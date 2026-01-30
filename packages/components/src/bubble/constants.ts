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

/**
 * Bubble list 上下文的注入键
 * 用于标识 Bubble 组件是否在 BubbleList 下
 */
export const BUBBLE_LIST_CONTEXT_KEY: InjectionKey<boolean> = Symbol('bubble-list-context')

/**
 * 气泡渲染器匹配优先级常量
 *
 * 用于定义不同类型渲染器的匹配优先级，数值越小优先级越高
 *
 * - LOADING: 通常基于 message.loading 判断。比如: `{ loading: true }`
 * - NORMAL: 普通渲染器的默认优先级
 * - CONTENT: 通常基于 message.content 判断。比如: `{ content: [{ type: 'image_url', image_url: 'xxx' }] }`
 * - ROLE: 通常基于 message.role 判断。比如: `{ role: 'tool' }`
 */
export const BubbleRendererMatchPriority = {
  LOADING: -1,
  NORMAL: 0,
  CONTENT: 10,
  ROLE: 20,
} as const
