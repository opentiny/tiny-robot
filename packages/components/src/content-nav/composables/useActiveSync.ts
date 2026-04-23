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
} from '../utils/scroll'

export function useActiveSync(options: ContentNavActiveSyncOptions) {
  const scrollSyncTolerance = 2
  const maxProgrammaticScrollDuration = 2000
  const localActiveId = ref<string | undefined>(options.activeId?.value)
  let pendingProgrammaticScroll: {
    top: number
    startedAt: number
  } | null = null
  let lockedSelectionId: string | null = null

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

  function clearLockedSelection() {
    lockedSelectionId = null
  }

  function releaseSelectionLock() {
    clearPendingScroll()
    clearLockedSelection()
  }

  function isEditableEventTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    )
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
    const viewportTop = getContentNavViewportTop(scrollRoot)
    const viewportBottom = viewportTop + getContentNavClientHeight(scrollRoot)
    const activeThreshold = viewportTop + Math.max(0, options.activeOffset?.value ?? 120)

    if (pendingProgrammaticScroll) {
      const reachedTarget = Math.abs(currentScrollTop - pendingProgrammaticScroll.top) <= scrollSyncTolerance
      const timedOut = Date.now() - pendingProgrammaticScroll.startedAt > maxProgrammaticScrollDuration

      if (!reachedTarget && !timedOut) {
        return
      }

      clearPendingScroll()
    }

    if (lockedSelectionId) {
      const lockedTarget = options.resolveTarget(lockedSelectionId)
      if (lockedTarget?.isConnected) {
        const rect = lockedTarget.getBoundingClientRect()
        const isAboveActiveZone = rect.bottom <= activeThreshold
        const isBelowViewport = rect.top >= viewportBottom

        if (!isAboveActiveZone && !isBelowViewport) {
          setActiveId(lockedSelectionId)
          return
        }
      }

      if (lockedSelectionId) {
        clearLockedSelection()
      }
    }

    const anchors = sortAnchors(
      options.items.value.flatMap((item) => {
        const target = options.resolveTarget(item.id)
        return target ? [{ id: item.id, el: target }] : []
      }),
    )

    const nextId = defaultContentNavActiveResolver({
      viewport: {
        top: viewportTop,
        scrollTop: currentScrollTop,
        clientHeight: getContentNavClientHeight(scrollRoot),
        scrollHeight: getContentNavScrollHeight(scrollRoot),
      },
      anchors,
      items: options.items.value,
      activeOffset: options.activeOffset?.value,
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
    lockedSelectionId = id
    setActiveId(id)

    scrollContentNavTo(scrollRoot, nextTop, preferredReducedMotion.value === 'reduce' ? 'auto' : 'smooth')
  }

  function handleUserScrollIntent() {
    releaseSelectionLock()
  }

  function handleScrollIntentKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const hostEl = options.host?.value
    if (hostEl && event.target instanceof Node && hostEl.contains(event.target)) {
      return
    }

    if (isEditableEventTarget(event.target)) {
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      return
    }

    releaseSelectionLock()
  }

  watch(
    () => options.activeId?.value,
    (value) => {
      localActiveId.value = value

      if (lockedSelectionId && value !== lockedSelectionId) {
        clearLockedSelection()
      }
    },
  )

  onBeforeUnmount(() => {
    clearPendingScroll()
    clearLockedSelection()
  })

  return {
    activeId,
    scrollTo,
    sync,
    clearPendingScroll,
    releaseSelectionLock,
    handleUserScrollIntent,
    handleScrollIntentKeydown,
  }
}
