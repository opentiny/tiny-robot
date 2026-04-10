import { inject, type MaybeRefOrGetter, provide, toValue } from 'vue'
import type { BubbleMessage, BubbleProps } from '../index.type'

const BUBBLE_CONTENT_RESOLVER_KEY = Symbol('BUBBLE_CONTENT_RESOLVER_KEY')

type Resolver = BubbleProps['contentResolver']
type ResolverSource = MaybeRefOrGetter<Resolver | undefined>

export const createContentResolver = (source?: ResolverSource) => {
  return source
    ? (message: BubbleMessage) => {
        const fn = toValue(source)
        return fn?.(message)
      }
    : (message: BubbleMessage) => message.content
}

export const useContentResolver = (contentResolver?: ResolverSource) => {
  const injected = inject<MaybeRefOrGetter<Resolver> | undefined>(BUBBLE_CONTENT_RESOLVER_KEY, undefined)

  const source = injected ?? contentResolver

  // 当前组件首次创建时 → 注册为 provider
  if (!injected && contentResolver) {
    provide(BUBBLE_CONTENT_RESOLVER_KEY, contentResolver)
  }

  /**
   * 统一返回「可直接调用」的函数
   * 内部按需 toValue，保证始终取到最新值
   */
  return createContentResolver(source)
}
