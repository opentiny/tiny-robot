import { type MaybeComputedElementRef, unrefElement, useEventListener, useScroll, watchThrottled } from '@vueuse/core'
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
 * 当目标滚动容器 `target` 接近底部时，且源数据 `source` 变化，自动滚动到底部
 * @param target 目标滚动容器的元素引用
 * @param source 监听的源数据，当该数据变化时会触发自动滚动
 * @param options 配置选项
 * @param options.scrollOnMount 是否在组件挂载时滚动到底部，默认为 true
 * @param options.bottomThreshold 判断接近底部的阈值（像素），默认为 20
 * @returns scrollToBottom 手动滚动到底部的方法
 */
export function useAutoScroll(
  target: MaybeComputedElementRef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: MaybeRefOrGetter<any>,
  options?: {
    scrollOnMount?: boolean
    scrollThrottle?: number
    bottomThreshold?: number
  },
) {
  const { scrollOnMount = true, bottomThreshold = 20, scrollThrottle = 0 } = options ?? {}

  const autoScrollEnabled = ref(true)
  let scheduled = false
  const stopWatches = new Set<WatchHandle>()

  const targetElement = () => unrefElement(target)

  const { y, isScrolling, arrivedState } = useScroll(targetElement, { throttle: scrollThrottle })

  /** 判断是否接近底部 */
  const isNearBottom = (el: HTMLElement) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= bottomThreshold
  }

  const scrollToBottom = async (behavior: ScrollBehavior = 'auto') => {
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
    if (scheduled || !autoScrollEnabled.value) return
    scheduled = true

    requestAnimationFrame(async () => {
      scheduled = false
      await scrollToBottom('auto')
    })
  }

  /** 用户滚动行为控制自动滚动开关 */
  watch(
    y,
    () => {
      const el = toValue(targetElement)
      if (!el) return
      autoScrollEnabled.value = isNearBottom(el as HTMLElement)
    },
    { flush: 'post' },
  )

  /** 业务信号变化 → 尝试滚动 */
  watchThrottled(
    source,
    () => {
      scheduleScroll()
    },
    { flush: 'post', throttle: 100 },
  )

  onMounted(() => {
    if (scrollOnMount) {
      scrollToBottom('smooth')
    }
  })

  onUnmounted(() => {
    stopWatches.forEach((stopWatch) => {
      stopWatch()
    })
    stopWatches.clear()
  })

  // 处理用户按下 End 键的滚动行为
  useEventListener('keydown', (e) => {
    if (e.key === 'End' && !autoScrollEnabled.value) {
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
