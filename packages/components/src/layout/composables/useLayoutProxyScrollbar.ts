import { useEventListener, useMutationObserver, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type CSSProperties, type Ref } from 'vue'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clamp } from '../utils/math'

interface UseLayoutProxyScrollbarOptions {
  scrollTargetRef: Ref<HTMLElement | null>
  containerRef: Ref<HTMLElement | null>
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

function resolveTrackHeight(containerEl: HTMLElement | null, fallbackHeight: number): number {
  if (!(containerEl instanceof HTMLElement)) {
    return fallbackHeight
  }

  return Math.max(containerEl.clientHeight, 0)
}

export function useLayoutProxyScrollbar(options: UseLayoutProxyScrollbarOptions) {
  const metrics = shallowRef<ScrollMetrics>(createEmptyMetrics())
  const thumbDragState = shallowRef<ThumbDragState | null>(null)
  const isTargetHovering = shallowRef(false)
  const isTrackHovering = shallowRef(false)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  let frameId: number | null = null

  const isScrollable = computed(() => metrics.value.isScrollable)
  const isDraggingThumb = computed(() => thumbDragState.value !== null)
  const scrollbarVisible = computed(
    () => isScrollable.value && (isTargetHovering.value || isTrackHovering.value || isDraggingThumb.value),
  )

  function syncMetrics(): void {
    frameId = null

    const scrollTarget = options.scrollTargetRef.value
    if (!scrollTarget) {
      metrics.value = createEmptyMetrics()
      return
    }

    const clientHeight = scrollTarget.clientHeight
    const scrollHeight = scrollTarget.scrollHeight
    const scrollTop = scrollTarget.scrollTop
    const trackHeight = resolveTrackHeight(options.containerRef.value, clientHeight)
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
    const scrollTarget = options.scrollTargetRef.value
    if (!scrollTarget || !metrics.value.isScrollable || event.button !== 0 || !event.isPrimary) {
      return
    }

    const bodyEl = scrollTarget.ownerDocument.body
    if (!(bodyEl instanceof HTMLBodyElement)) {
      return
    }

    event.preventDefault()
    thumbDragState.value = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: scrollTarget.scrollTop,
      bodyEl,
      bodyState: lockBodyInteraction(bodyEl, 'grabbing'),
    }
  }

  useEventListener(options.scrollTargetRef, 'scroll', () => {
    scheduleSync()
  })

  useEventListener(options.scrollTargetRef, 'wheel', () => {
    scheduleSync()
  })

  useEventListener(options.scrollTargetRef, 'mouseenter', () => {
    isTargetHovering.value = true
  })

  useEventListener(options.scrollTargetRef, 'mouseleave', () => {
    isTargetHovering.value = false
  })

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const dragState = thumbDragState.value
    const scrollTarget = options.scrollTargetRef.value
    const currentMetrics = metrics.value
    if (!dragState || !scrollTarget || event.pointerId !== dragState.pointerId || !currentMetrics.isScrollable) {
      return
    }

    const deltaY = event.clientY - dragState.startY
    const scrollRange = currentMetrics.scrollHeight - currentMetrics.clientHeight
    const thumbTravel = currentMetrics.trackHeight - currentMetrics.thumbHeight
    const ratio = thumbTravel > 0 ? scrollRange / thumbTravel : 0
    scrollTarget.scrollTop = dragState.startScrollTop + deltaY * ratio
    scheduleSync()
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopThumbDrag(event.pointerId)
  })

  useResizeObserver(options.scrollTargetRef, () => {
    scheduleSync()
  })

  useResizeObserver(options.containerRef, () => {
    scheduleSync()
  })

  useMutationObserver(
    options.scrollTargetRef,
    () => {
      scheduleSync()
    },
    { childList: true, subtree: true },
  )

  watch(
    options.scrollTargetRef,
    (nextTarget, prevTarget) => {
      stopThumbDrag()
      isTargetHovering.value = false
      isTrackHovering.value = false
      prevTarget?.removeAttribute('data-tr-layout-scroll-target')
      nextTarget?.setAttribute('data-tr-layout-scroll-target', '')
      scheduleSync()
    },
    { immediate: true },
  )

  watch(options.containerRef, () => {
    scheduleSync()
  })

  onBeforeUnmount(() => {
    if (frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(frameId)
    }

    stopThumbDrag()
    options.scrollTargetRef.value?.removeAttribute('data-tr-layout-scroll-target')
  })

  const thumbStyle = computed<CSSProperties>(() => ({
    height: `${metrics.value.thumbHeight}px`,
    transform: `translateY(${metrics.value.thumbOffset}px)`,
  }))

  const rootClass = computed(() => ({
    'tr-layout-proxy-scrollbar--visible': scrollbarVisible.value,
    'tr-layout-proxy-scrollbar--dragging-thumb': isDraggingThumb.value,
  }))

  return {
    isScrollable,
    rootClass,
    thumbStyle,
    setTrackHovering: (value: boolean) => {
      isTrackHovering.value = value
    },
    startThumbDrag,
  }
}
