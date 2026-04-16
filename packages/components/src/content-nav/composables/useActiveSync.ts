import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { defaultContentNavActiveResolver } from '../defaults'
import type { ContentNavActiveSyncOptions } from '../internal.type'
import {
  getContentNavClientHeight,
  getContentNavScrollHeight,
  getContentNavScrollTop,
  getContentNavViewportTop,
  resolveContentNavScrollRoot,
  scrollContentNavTo,
} from '../scroll'

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
    const scrollRoot = resolveContentNavScrollRoot(options.container.value)
    if (!scrollRoot) {
      return
    }

    const currentScrollTop = getContentNavScrollTop(scrollRoot)

    if (pendingProgrammaticScroll) {
      const reachedTarget = Math.abs(currentScrollTop - pendingProgrammaticScroll.top) <= scrollSyncTolerance
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
      viewport: {
        top: getContentNavViewportTop(scrollRoot),
        scrollTop: currentScrollTop,
        clientHeight: getContentNavClientHeight(scrollRoot),
        scrollHeight: getContentNavScrollHeight(scrollRoot),
      },
      anchors,
      items: options.items.value,
    })

    if (nextId !== undefined) {
      setActiveId(nextId)
    }
  }

  function scrollTo(id: string) {
    const scrollRoot = resolveContentNavScrollRoot(options.container.value)
    const target = options.resolveTarget(id)

    if (!scrollRoot || !target) {
      return
    }

    const currentScrollTop = getContentNavScrollTop(scrollRoot)
    const targetRect = target.getBoundingClientRect()
    const targetTop = currentScrollTop + targetRect.top - getContentNavViewportTop(scrollRoot) - getScrollOffset(target)
    const maxScrollTop = Math.max(0, getContentNavScrollHeight(scrollRoot) - getContentNavClientHeight(scrollRoot))
    const nextTop = Math.max(0, Math.min(targetTop, maxScrollTop))

    pendingProgrammaticScroll = {
      top: nextTop,
      startedAt: Date.now(),
    }
    setActiveId(id)

    scrollContentNavTo(scrollRoot, nextTop, preferredReducedMotion.value === 'reduce' ? 'auto' : 'smooth')
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
