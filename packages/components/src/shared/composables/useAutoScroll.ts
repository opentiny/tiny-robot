import {
  type MaybeComputedElementRef,
  type UseScrollReturn,
  unrefElement,
  useEventListener,
  useResizeObserver,
  useScroll,
  watchThrottled,
} from '@vueuse/core'
import {
  type MaybeRefOrGetter,
  nextTick,
  onMounted,
  onUnmounted,
  type Ref,
  ref,
  toValue,
  watch,
  type WatchHandle,
  type WatchSource,
} from 'vue'

/**
 * 监听下降沿 (True -> False)，且只触发一次
 * @param source 监听的 boolean ref
 * @param cb 触发的回调函数
 */
function useOnceFallingEdge(source: Ref<boolean>, cb: () => void) {
  const stop = watch(source, (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      cb()
      stop() // 触发后自毁
    }
  })

  return stop
}

interface AutoScrollBehaviorOptions {
  /** 是否在组件挂载时滚动到底部，默认为 true */
  scrollOnMount?: boolean
  /** 滚动事件的节流时间（毫秒），默认为 0 */
  scrollThrottle?: number
  /** 判断接近底部的阈值（像素），默认为 20 */
  bottomThreshold?: number
  /** 是否启用自动滚动，可传入响应式值 */
  enabled?: MaybeRefOrGetter<boolean>
}

export interface UseAutoScrollOptions extends AutoScrollBehaviorOptions {
  /** 目标滚动容器的元素引用 */
  scrollRef: MaybeComputedElementRef
  /** 滚动容器内用于监听尺寸变化的内容元素引用 */
  contentRef: MaybeComputedElementRef
}

/** @deprecated 仅用于旧位置参数结构，请改用 `UseAutoScrollOptions` */
export interface LegacyUseAutoScrollOptions extends AutoScrollBehaviorOptions {
  contentTarget?: MaybeComputedElementRef
}

export interface UseAutoScrollReturn {
  scrollToBottom: (behavior?: ScrollBehavior) => Promise<void>
  arrivedState: UseScrollReturn['arrivedState']
}

function isUseAutoScrollOptions(value: UseAutoScrollOptions | MaybeComputedElementRef): value is UseAutoScrollOptions {
  if (typeof value !== 'object' || value === null) return false

  const prototype = Object.getPrototypeOf(value)
  const isPlainObject = prototype === Object.prototype || prototype === null

  return isPlainObject && 'scrollRef' in value && 'contentRef' in value
}

/**
 * 当滚动容器保持跟随状态时，根据内容或容器尺寸变化自动滚动到底部
 * @param options 滚动容器、内容元素及行为配置
 * @returns 手动滚动方法和当前位置状态
 */
export function useAutoScroll(options: UseAutoScrollOptions): UseAutoScrollReturn

/**
 * @deprecated 请改用对象参数：`useAutoScroll({ scrollRef, contentRef, ...options })`
 */
export function useAutoScroll(
  target: MaybeComputedElementRef,
  source?: MaybeRefOrGetter<unknown>,
  options?: LegacyUseAutoScrollOptions,
): UseAutoScrollReturn

export function useAutoScroll(
  optionsOrTarget: UseAutoScrollOptions | MaybeComputedElementRef,
  legacySource?: MaybeRefOrGetter<unknown>,
  legacyOptions?: LegacyUseAutoScrollOptions,
): UseAutoScrollReturn {
  let scrollRef: MaybeComputedElementRef
  let contentRef: MaybeComputedElementRef | undefined
  let source: MaybeRefOrGetter<unknown> | undefined
  let options: AutoScrollBehaviorOptions | undefined

  if (arguments.length === 1 && isUseAutoScrollOptions(optionsOrTarget)) {
    scrollRef = optionsOrTarget.scrollRef
    contentRef = optionsOrTarget.contentRef
    source = undefined
    options = optionsOrTarget
  } else {
    scrollRef = optionsOrTarget as MaybeComputedElementRef
    contentRef = legacyOptions?.contentTarget
    source = legacySource
    options = legacyOptions
  }

  const { scrollOnMount = true, bottomThreshold = 20, scrollThrottle = 0, enabled = true } = options ?? {}

  const isFollowing = ref(true)
  let scheduledFrame: number | null = null
  const stopWatches = new Set<WatchHandle>()

  const targetElement = () => unrefElement(scrollRef)
  const contentElement = () => (contentRef ? unrefElement(contentRef) : null)
  const automaticScrollingEnabled = () => toValue(enabled)

  const { y, isScrolling, arrivedState } = useScroll(targetElement, { throttle: scrollThrottle })

  /** 判断是否接近底部 */
  const isNearBottom = (el: HTMLElement) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= bottomThreshold
  }

  const scrollToBottom = async (behavior: ScrollBehavior = 'auto') => {
    isFollowing.value = true
    const el = toValue(targetElement)
    if (!el) return

    await nextTick()
    el.scrollTo({ top: el.scrollHeight, behavior })

    if (behavior === 'smooth' && !isNearBottom(el as HTMLElement)) {
      const stopWatch = useOnceFallingEdge(isScrolling, () => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
        stopWatches.delete(stopWatch)
      })
      stopWatches.add(stopWatch)
    }
  }

  const scheduleScroll = () => {
    if (scheduledFrame !== null || !automaticScrollingEnabled() || !isFollowing.value) return

    scheduledFrame = requestAnimationFrame(async () => {
      scheduledFrame = null
      if (!automaticScrollingEnabled() || !isFollowing.value) return
      await scrollToBottom('auto')
    })
  }

  const createResizeHandler = () => {
    let initialized = false

    return () => {
      if (!initialized) {
        initialized = true
        if (!scrollOnMount) return
      }
      scheduleScroll()
    }
  }

  /** 用户向上离开底部时停止跟随；内容增长本身不会清除跟随意图 */
  watch(
    y,
    (newY, oldY) => {
      const el = toValue(targetElement)
      if (!el) return

      if (isNearBottom(el as HTMLElement)) {
        isFollowing.value = true
      } else if (newY < oldY) {
        isFollowing.value = false
      }
    },
    { flush: 'post' },
  )

  useResizeObserver(contentElement, createResizeHandler())
  useResizeObserver(targetElement, createResizeHandler())

  /** 保留旧版业务信号驱动方式 */
  if (source !== undefined) {
    watchThrottled(source as WatchSource<unknown>, scheduleScroll, { flush: 'post', throttle: 100 })
  }

  watch(
    automaticScrollingEnabled,
    (value) => {
      if (value && isFollowing.value) scheduleScroll()
    },
    { flush: 'post' },
  )

  onMounted(() => {
    if (scrollOnMount && automaticScrollingEnabled()) {
      scrollToBottom('smooth')
    }
  })

  onUnmounted(() => {
    if (scheduledFrame !== null) {
      cancelAnimationFrame(scheduledFrame)
      scheduledFrame = null
    }
    stopWatches.forEach((stopWatch) => {
      stopWatch()
    })
    stopWatches.clear()
  })

  // 处理用户按下 End 键的滚动行为
  useEventListener('keydown', (e) => {
    if (e.key === 'End' && !isFollowing.value) {
      const stopWatch = useOnceFallingEdge(isScrolling, () => {
        scrollToBottom('auto')
        stopWatches.delete(stopWatch)
      })
      stopWatches.add(stopWatch)
    }
  })

  return {
    scrollToBottom,
    arrivedState,
  }
}

export default useAutoScroll
