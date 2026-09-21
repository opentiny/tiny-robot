import {
  type MaybeComputedElementRef,
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

/**
 * 当目标滚动容器保持跟随状态时，根据内容尺寸、容器尺寸或兼容业务信号自动滚动到底部
 * @param target 目标滚动容器的元素引用
 * @param source 兼容旧接口的可选业务信号，当该数据变化时会触发自动滚动
 * @param options 配置选项
 * @param options.scrollOnMount 是否在组件挂载时滚动到底部，默认为 true
 * @param options.bottomThreshold 判断接近底部的阈值（像素），默认为 20
 * @param options.contentTarget 滚动容器内用于监听尺寸变化的内容元素
 * @param options.enabled 是否启用自动滚动，可传入响应式值
 * @returns scrollToBottom 手动滚动到底部的方法
 */
export interface UseAutoScrollOptions {
  scrollOnMount?: boolean
  scrollThrottle?: number
  bottomThreshold?: number
  contentTarget?: MaybeComputedElementRef
  enabled?: MaybeRefOrGetter<boolean>
}

export function useAutoScroll(
  target: MaybeComputedElementRef,
  source?: MaybeRefOrGetter<unknown>,
  options?: UseAutoScrollOptions,
) {
  const {
    scrollOnMount = true,
    bottomThreshold = 20,
    scrollThrottle = 0,
    contentTarget,
    enabled = true,
  } = options ?? {}

  const isFollowing = ref(true)
  let scheduledFrame: number | null = null
  const stopWatches = new Set<WatchHandle>()

  const targetElement = () => unrefElement(target)
  const contentElement = () => (contentTarget ? unrefElement(contentTarget) : null)
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
