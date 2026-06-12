import { useEventListener, useMutationObserver, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clamp } from '../utils/math'

interface UseLayoutMainScrollbarOptions {
  scrollHostRef: Ref<HTMLElement | null>
}

interface ScrollMetrics {
  clientHeight: number
  scrollHeight: number
  scrollTop: number
  trackHeight: number
  thumbHeight: number
  thumbOffset: number
  isScrollable: boolean
}

interface ThumbDragState {
  pointerId: number
  startY: number
  startScrollTop: number
  bodyEl: HTMLBodyElement
  bodyState: BodyInteractionState
}

const MIN_THUMB_HEIGHT = 36

function createEmptyMetrics(): ScrollMetrics {
  return {
    clientHeight: 0,
    scrollHeight: 0,
    scrollTop: 0,
    trackHeight: 0,
    thumbHeight: 0,
    thumbOffset: 0,
    isScrollable: false,
  }
}

function resolveTrackHeight(scrollHost: HTMLElement, clientHeight: number): number {
  const mainEl = scrollHost.closest('.tr-layout-main')

  if (!(mainEl instanceof HTMLElement)) {
    return clientHeight
  }

  const styles = window.getComputedStyle(mainEl)
  const insetBlock = resolveCssLengthToPx(
    styles.getPropertyValue('--tr-layout-inner-padding-block').trim(),
    mainEl,
    0,
    'height',
  )
  return Math.max(clientHeight - insetBlock * 2, 0)
}

export function useLayoutMainScrollbar(options: UseLayoutMainScrollbarOptions) {
  const metrics = shallowRef<ScrollMetrics>(createEmptyMetrics())
  const thumbDragState = shallowRef<ThumbDragState | null>(null)
  const isHovering = shallowRef(false)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  let frameId: number | null = null

  const showScrollbar = computed(() => metrics.value.isScrollable)
  const isDraggingThumb = computed(() => thumbDragState.value !== null)
  const scrollbarVisible = computed(() => showScrollbar.value && (isHovering.value || isDraggingThumb.value))

  function syncMetrics(): void {
    frameId = null

    const scrollHost = options.scrollHostRef.value
    if (!scrollHost) {
      metrics.value = createEmptyMetrics()
      return
    }

    const clientHeight = scrollHost.clientHeight
    const scrollHeight = scrollHost.scrollHeight
    const scrollTop = scrollHost.scrollTop
    const trackHeight = resolveTrackHeight(scrollHost, clientHeight)
    const isScrollable = scrollHeight - clientHeight > 1

    if (!isScrollable) {
      metrics.value = {
        clientHeight,
        scrollHeight,
        scrollTop,
        trackHeight,
        thumbHeight: trackHeight,
        thumbOffset: 0,
        isScrollable: false,
      }
      return
    }

    const scrollRange = scrollHeight - clientHeight
    const thumbHeight = clamp((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT, trackHeight)
    const thumbTravel = Math.max(0, trackHeight - thumbHeight)
    const thumbOffset = scrollRange > 0 ? (scrollTop / scrollRange) * thumbTravel : 0

    metrics.value = {
      clientHeight,
      scrollHeight,
      scrollTop,
      trackHeight,
      thumbHeight,
      thumbOffset,
      isScrollable: true,
    }
  }

  function scheduleSync(): void {
    if (typeof window === 'undefined') {
      syncMetrics()
      return
    }

    if (frameId !== null) {
      return
    }

    frameId = window.requestAnimationFrame(syncMetrics)
  }

  function stopThumbDrag(pointerId?: number): void {
    const dragState = thumbDragState.value
    if (!dragState || (pointerId !== undefined && dragState.pointerId !== pointerId)) {
      return
    }

    restoreBodyInteraction(dragState.bodyEl, dragState.bodyState)
    thumbDragState.value = null
  }

  function startThumbDrag(event: PointerEvent): void {
    const scrollHost = options.scrollHostRef.value
    if (!scrollHost || !metrics.value.isScrollable || event.button !== 0 || !event.isPrimary) {
      return
    }

    const bodyEl = scrollHost.ownerDocument.body
    if (!(bodyEl instanceof HTMLBodyElement)) {
      return
    }

    event.preventDefault()
    thumbDragState.value = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: scrollHost.scrollTop,
      bodyEl,
      bodyState: lockBodyInteraction(bodyEl, 'grabbing'),
    }
  }

  useEventListener(options.scrollHostRef, 'scroll', () => {
    scheduleSync()
  })

  useEventListener(options.scrollHostRef, 'wheel', () => {
    scheduleSync()
  })

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const dragState = thumbDragState.value
    const scrollHost = options.scrollHostRef.value
    const currentMetrics = metrics.value
    if (!dragState || !scrollHost || event.pointerId !== dragState.pointerId || !currentMetrics.isScrollable) {
      return
    }

    const deltaY = event.clientY - dragState.startY
    const scrollRange = currentMetrics.scrollHeight - currentMetrics.clientHeight
    const thumbTravel = currentMetrics.trackHeight - currentMetrics.thumbHeight
    const ratio = thumbTravel > 0 ? scrollRange / thumbTravel : 0
    scrollHost.scrollTop = dragState.startScrollTop + deltaY * ratio
    scheduleSync()
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useResizeObserver(options.scrollHostRef, () => {
    scheduleSync()
  })

  useMutationObserver(
    options.scrollHostRef,
    () => {
      scheduleSync()
    },
    { childList: true, subtree: true },
  )

  watch(
    options.scrollHostRef,
    (nextHost, prevHost) => {
      stopThumbDrag()
      prevHost?.removeAttribute('data-tr-layout-scroll-host')
      nextHost?.setAttribute('data-tr-layout-scroll-host', '')
      scheduleSync()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(frameId)
    }

    stopThumbDrag()
    options.scrollHostRef.value?.removeAttribute('data-tr-layout-scroll-host')
  })

  const thumbStyle = computed<CSSProperties>(() => ({
    height: `${metrics.value.thumbHeight}px`,
    transform: `translateY(${metrics.value.thumbOffset}px)`,
  }))

  const rootClass = computed(() => ({
    'tr-layout-main--scrollbar-visible': scrollbarVisible.value,
    'tr-layout-main--dragging-thumb': isDraggingThumb.value,
  }))

  return {
    showScrollbar,
    rootClass,
    thumbStyle,
    setHovering: (value: boolean) => {
      isHovering.value = value
    },
    startThumbDrag,
  }
}
