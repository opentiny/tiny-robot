import { type MaybeComputedElementRef, unrefElement, useScroll } from '@vueuse/core'
import { type MaybeRefOrGetter, nextTick, onMounted, ref, watch } from 'vue'

export function useAutoScroll(
  target: MaybeComputedElementRef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: MaybeRefOrGetter<any>,
  options?: {
    behavior?: ScrollBehavior
    scrollOnMount?: boolean
    bottomThreshold?: number
  },
) {
  const { behavior = 'auto', scrollOnMount = true, bottomThreshold = 12 } = options ?? {}

  const autoScrollEnabled = ref(true)
  const targetElement = () => unrefElement(target)

  let scheduled = false

  const scrollToBottom = async () => {
    const el = targetElement()
    if (!el) return

    await nextTick()
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  const scheduleScroll = () => {
    if (scheduled || !autoScrollEnabled.value) return
    scheduled = true

    requestAnimationFrame(async () => {
      scheduled = false
      await scrollToBottom()
    })
  }

  const { y } = useScroll(targetElement)

  /** 判断是否接近底部 */
  const isNearBottom = (el: HTMLElement) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= bottomThreshold
  }

  /** 用户滚动行为控制自动滚动开关 */
  watch(
    y,
    () => {
      const el = targetElement()
      if (!el) return
      autoScrollEnabled.value = isNearBottom(el as HTMLElement)
    },
    { flush: 'post' },
  )

  /** 业务信号变化 → 尝试滚动 */
  watch(
    source,
    () => {
      scheduleScroll()
    },
    { flush: 'post' },
  )

  onMounted(() => {
    if (scrollOnMount) {
      scrollToBottom()
    }
  })

  return {
    autoScrollEnabled,
    scrollToBottom,
  }
}

export default useAutoScroll
