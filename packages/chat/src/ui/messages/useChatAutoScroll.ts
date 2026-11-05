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
    const grew = scrollRange > previousScrollRange
    previousScrollTop = el.scrollTop
    previousScrollRange = scrollRange
    if (!resumeReady || !enabled() || grew) return
    const distance = scrollRange - el.scrollTop
    // 尺寸变化只在实际到底时恢复，避免收起内容后跳过仍未读完的部分。
    if (distance <= 1 || (fromScroll && movedDown && distance <= 50)) scrollToBottom()
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
  useResizeObserver([contentRef, scrollRoot], () => checkRendererResume())

  watch(
    enabled,
    (value) => {
      if (value) checkRendererResume()
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
