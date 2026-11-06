import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'
import { useEventListener, useRafFn, useResizeObserver } from '@vueuse/core'
import { useAutoScroll } from '@opentiny/tiny-robot'

interface UseChatAutoScrollOptions {
  scrollRoot: () => HTMLElement | null
  contentRef: Ref<HTMLElement | null>
  enabled: () => boolean
  conversationId: () => string | null | undefined
  lastMessageRole: () => string | undefined
}

export function useChatAutoScroll({
  scrollRoot,
  contentRef,
  enabled,
  conversationId,
  lastMessageRole,
}: UseChatAutoScrollOptions) {
  const { scrollToBottom: scrollToBottomInternal, pause: pauseFollowing } = useAutoScroll({
    scrollRef: scrollRoot,
    contentRef,
    bottomThreshold: 50,
    enabled,
  })
  let pauseReason: 'renderer' | 'anchor' | null = null
  let pauseRevision = 0
  let resumeReady = false
  let resumeFrames = 0
  let resumeFromScroll = false
  let previousScrollTop = 0
  let previousScrollRange = 0

  const { pause: cancelResume, resume: scheduleResume } = useRafFn(
    () => {
      // Vue Transition 在双帧后启动；有限动画结束前的底部位置不能用于恢复。
      if (++resumeFrames < 3) return
      const animating = contentRef.value
        ?.getAnimations({ subtree: true })
        .some(
          (animation) =>
            (animation.pending || animation.playState === 'running') &&
            animation.effect?.getComputedTiming().endTime !== Infinity,
        )
      if (animating) return
      cancelResume()
      resumeReady = true
      checkRendererResume()
    },
    { immediate: false },
  )

  function clearPause() {
    pauseRevision++
    cancelResume()
    resumeReady = false
    resumeFrames = 0
    resumeFromScroll = false
    pauseReason = null
  }

  function scrollToBottom(behavior?: ScrollBehavior) {
    clearPause()
    return scrollToBottomInternal(behavior)
  }

  function pauseFromAnchor() {
    clearPause()
    pauseReason = 'anchor'
    pauseFollowing()
  }

  function checkRendererResume(fromScroll = false) {
    const el = scrollRoot()
    if (pauseReason !== 'renderer' || !el) return
    const scrollRange = el.scrollHeight - el.clientHeight
    const movedDown = el.scrollTop > previousScrollTop
    const movedUp = el.scrollTop < previousScrollTop
    const grew = scrollRange > previousScrollRange
    const distance = scrollRange - el.scrollTop
    if (grew || movedUp || distance > 50 || !enabled()) resumeFromScroll = false
    // 动画等待期间保留向下回底的意图，布局稳定后仍须复核当前位置。
    if (fromScroll && movedDown && !grew && enabled() && distance <= 50) resumeFromScroll = true
    previousScrollTop = el.scrollTop
    previousScrollRange = scrollRange
    if (!resumeReady || !enabled() || grew) return
    // 尺寸变化只在实际到底时恢复，避免收起内容后跳过仍未读完的部分。
    if (distance <= 1 || (resumeFromScroll && distance <= 50)) scrollToBottom()
  }

  function pauseFromRenderer() {
    if (pauseReason === 'anchor') return
    clearPause()
    pauseReason = 'renderer'
    pauseFollowing()
    const el = scrollRoot()
    if (!el) return
    el.scrollTo({ top: el.scrollTop, left: el.scrollLeft, behavior: 'instant' })
    previousScrollTop = el.scrollTop
    previousScrollRange = el.scrollHeight - el.clientHeight
    const revision = pauseRevision
    // 渲染器同步修改状态后，等待 DOM 更新及布局，避免用展开前的位置解除暂停。
    nextTick(() => {
      if (revision !== pauseRevision) return
      scheduleResume()
    })
  }

  useEventListener(scrollRoot, 'scroll', () => checkRendererResume(true), { passive: true })
  useEventListener(
    scrollRoot,
    'keydown',
    (event) => {
      if (event.key !== 'End' || event.defaultPrevented) return
      const target = event.target as HTMLElement
      if (target.isContentEditable || target.closest('input, textarea, select')) {
        event.stopPropagation()
        return
      }
      const root = scrollRoot()
      if (!root || !root.contains(target)) return
      let element: HTMLElement | null = target
      while (element && element !== root) {
        if (element.scrollHeight > element.clientHeight) {
          const overflowY = getComputedStyle(element).overflowY
          if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
            event.preventDefault()
            element.scrollTop = element.scrollHeight
            event.stopPropagation()
            return
          }
        }
        element = element.parentElement
      }
      // 通过同一入口清除 Chat 层暂停，避免底层恢复后仍残留锚点状态。
      scrollToBottom()
      event.stopPropagation()
    },
    { capture: true },
  )
  useResizeObserver([contentRef, scrollRoot], () => checkRendererResume())

  watch(
    enabled,
    (value) => {
      if (value) checkRendererResume()
      else resumeFromScroll = false
    },
    { flush: 'post' },
  )

  watch(
    scrollRoot,
    () => {
      const reason = pauseReason
      clearPause()
      if (reason === 'anchor') pauseFromAnchor()
      else if (reason === 'renderer') {
        if (enabled()) scrollToBottom()
        else pauseFromRenderer()
      }
    },
    { flush: 'sync' },
  )

  onBeforeUnmount(() => {
    clearPause()
    pauseFollowing()
  })

  watch(
    conversationId,
    () => {
      clearPause()
      pauseFollowing()
      if (enabled()) scrollToBottom()
    },
    { flush: 'sync' },
  )

  watch(lastMessageRole, async (role, _previousRole, onCleanup) => {
    if (enabled() && role === 'user') {
      const revision = pauseRevision
      let active = true
      onCleanup(() => {
        active = false
      })
      await nextTick()
      if (active && revision === pauseRevision && enabled()) scrollToBottom('smooth')
    }
  })

  return { pauseFromRenderer, pauseFromAnchor, scrollToBottom }
}
