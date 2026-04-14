import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { defaultContentNavActiveResolver } from '../defaults'
import type { ContentNavActiveSyncOptions } from '../internal.type'

export function useActiveSync(options: ContentNavActiveSyncOptions) {
  const scrollSyncTolerance = 2
  const maxProgrammaticScrollDuration = 2000
  const localActiveId = ref<string | undefined>(options.activeId?.value)
  let pendingProgrammaticScroll: {
    top: number
    startedAt: number
  } | null = null

  const activeId = computed(() => options.activeId?.value ?? localActiveId.value)
  const preferredReducedMotion = usePreferredReducedMotion()

  function setActiveId(value: string | undefined) {
    if (options.activeId?.value === undefined) {
      localActiveId.value = value
    }

    options.onUpdateActiveId?.(value)
  }

  function clearPendingScroll() {
    pendingProgrammaticScroll = null
  }

  function sortAnchors(anchors: Array<{ id: string; el: HTMLElement }>) {
    return [...anchors].sort((left, right) => {
      if (left.el === right.el) {
        return 0
      }

      const position = left.el.compareDocumentPosition(right.el)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1
      }

      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1
      }

      return left.el.getBoundingClientRect().top - right.el.getBoundingClientRect().top
    })
  }

  function getScrollOffset(target: HTMLElement) {
    const scrollMarginTop = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop || '0')
    return Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0
  }

  function sync() {
    const container = options.container.value
    if (!container) {
      return
    }

    if (pendingProgrammaticScroll) {
      const reachedTarget = Math.abs(container.scrollTop - pendingProgrammaticScroll.top) <= scrollSyncTolerance
      const timedOut = Date.now() - pendingProgrammaticScroll.startedAt > maxProgrammaticScrollDuration

      if (!reachedTarget && !timedOut) {
        return
      }

      clearPendingScroll()
    }

    const anchors = sortAnchors(
      options.items.value.flatMap((item) => {
        const target = options.resolveTarget(item.id)
        return target ? [{ id: item.id, el: target }] : []
      }),
    )
    const nextId = defaultContentNavActiveResolver({
      container,
      anchors,
      items: options.items.value,
    })

    if (nextId !== undefined) {
      setActiveId(nextId)
    }
  }

  function scrollTo(id: string) {
    const container = options.container.value
    const target = options.resolveTarget(id)

    if (!container || !target) {
      return
    }

    const targetRect = target.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const targetTop = container.scrollTop + (targetRect.top - containerRect.top) - getScrollOffset(target)
    const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight)
    const nextTop = Math.max(0, Math.min(targetTop, maxScrollTop))

    pendingProgrammaticScroll = {
      top: nextTop,
      startedAt: Date.now(),
    }
    setActiveId(id)

    container.scrollTo({
      top: nextTop,
      behavior: preferredReducedMotion.value === 'reduce' ? 'auto' : 'smooth',
    })
  }

  watch(
    () => options.activeId?.value,
    (value) => {
      if (value !== undefined) {
        localActiveId.value = value
      }
    },
  )

  onBeforeUnmount(() => {
    clearPendingScroll()
  })

  return {
    activeId,
    scrollTo,
    sync,
    clearPendingScroll,
  }
}
