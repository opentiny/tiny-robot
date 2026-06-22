<script setup lang="ts">
import { unrefElement, useEventListener, useMutationObserver, useResizeObserver } from '@vueuse/core'
import {
  computed,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type ComponentPublicInstance,
  type CSSProperties,
} from 'vue'
import { usePointerDragSession } from './composables/usePointerDragSession'
import type { LayoutProxyScrollbarProps, LayoutScrollTarget } from './index.type'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from './utils/domInteraction'
import { clamp } from './utils/number'

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
  scrollTarget: HTMLElement
  startY: number
  startScrollTop: number
  bodyEl: HTMLBodyElement
  bodyState: BodyInteractionState
}

const MIN_THUMB_HEIGHT = 36

defineOptions({
  name: 'LayoutProxyScrollbar',
})

const props = defineProps<LayoutProxyScrollbarProps>()
const scrollbarRef = ref<HTMLElement | null>(null)
const metrics = shallowRef<ScrollMetrics>(createEmptyMetrics())
const isTargetHovering = shallowRef(false)
const isTrackHovering = shallowRef(false)
let frameId: number | null = null

const resolveScrollTargetElement = (scrollTarget: LayoutScrollTarget): HTMLElement | null => {
  const element = unrefElement(scrollTarget as HTMLElement | ComponentPublicInstance | null | undefined)
  return element instanceof HTMLElement ? element : null
}

const scrollTargetRef = computed<HTMLElement | null>(() => resolveScrollTargetElement(props.scrollTarget))
const isScrollable = computed(() => metrics.value.isScrollable)

const {
  activeSession: activeThumbDrag,
  startSession,
  stopSession,
} = usePointerDragSession<ThumbDragState>({
  onMove: (state, event) => {
    const currentMetrics = metrics.value
    if (!currentMetrics.isScrollable) {
      return
    }

    const deltaY = event.clientY - state.startY
    const scrollRange = currentMetrics.scrollHeight - currentMetrics.clientHeight
    const thumbTravel = currentMetrics.trackHeight - currentMetrics.thumbHeight
    const ratio = thumbTravel > 0 ? scrollRange / thumbTravel : 0
    state.scrollTarget.scrollTop = state.startScrollTop + deltaY * ratio
    scheduleSync()
  },
  onStop: (state) => {
    restoreBodyInteraction(state.bodyEl, state.bodyState)
  },
})

const isDraggingThumb = computed(() => activeThumbDrag.value !== null)
const scrollbarVisible = computed(
  () => isScrollable.value && (isTargetHovering.value || isTrackHovering.value || isDraggingThumb.value),
)

const thumbStyle = computed<CSSProperties>(() => ({
  height: `${metrics.value.thumbHeight}px`,
  transform: `translateY(${metrics.value.thumbOffset}px)`,
}))

const rootClass = computed(() => ({
  'tr-layout-proxy-scrollbar--visible': scrollbarVisible.value,
  'tr-layout-proxy-scrollbar--dragging-thumb': isDraggingThumb.value,
}))

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

function syncMetrics(): void {
  frameId = null

  const scrollTarget = scrollTargetRef.value
  if (!scrollTarget) {
    metrics.value = createEmptyMetrics()
    return
  }

  const clientHeight = scrollTarget.clientHeight
  const scrollHeight = scrollTarget.scrollHeight
  const scrollTop = scrollTarget.scrollTop
  const trackHeight = resolveTrackHeight(scrollbarRef.value, clientHeight)
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

function setTrackHovering(value: boolean): void {
  isTrackHovering.value = value
}

function stopThumbDrag(pointerId?: number): void {
  stopSession(pointerId)
}

function startThumbDrag(event: PointerEvent): void {
  const scrollTarget = scrollTargetRef.value
  if (!scrollTarget || !metrics.value.isScrollable) {
    return
  }

  startSession(event, (event) => {
    const bodyEl = scrollTarget.ownerDocument.body
    if (!(bodyEl instanceof HTMLBodyElement)) {
      return null
    }

    event.preventDefault()

    return {
      pointerId: event.pointerId,
      scrollTarget,
      startY: event.clientY,
      startScrollTop: scrollTarget.scrollTop,
      bodyEl,
      bodyState: lockBodyInteraction(bodyEl, 'grabbing'),
    }
  })
}

useEventListener(scrollTargetRef, 'scroll', () => {
  scheduleSync()
})

useEventListener(scrollTargetRef, 'wheel', () => {
  scheduleSync()
})

useEventListener(scrollTargetRef, 'mouseenter', () => {
  isTargetHovering.value = true
})

useEventListener(scrollTargetRef, 'mouseleave', () => {
  isTargetHovering.value = false
})

useResizeObserver(scrollTargetRef, () => {
  scheduleSync()
})

useResizeObserver(scrollbarRef, () => {
  scheduleSync()
})

useMutationObserver(
  scrollTargetRef,
  () => {
    scheduleSync()
  },
  { childList: true, subtree: true },
)

watch(
  scrollTargetRef,
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

watch(scrollbarRef, () => {
  scheduleSync()
})

onBeforeUnmount(() => {
  if (frameId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(frameId)
  }

  stopThumbDrag()
  scrollTargetRef.value?.removeAttribute('data-tr-layout-scroll-target')
})
</script>

<template>
  <div
    v-if="isScrollable"
    ref="scrollbarRef"
    class="tr-layout-proxy-scrollbar"
    :class="rootClass"
    aria-hidden="true"
    @mouseenter="setTrackHovering(true)"
    @mouseleave="setTrackHovering(false)"
  >
    <div class="tr-layout-proxy-scrollbar__thumb" :style="thumbStyle" @pointerdown="startThumbDrag" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout-proxy-scrollbar {
  position: absolute;
  top: var(--scrollbar-block-inset);
  right: var(--scrollbar-inline-end);
  bottom: var(--scrollbar-block-inset);
  width: var(--tr-layout-main-scrollbar-width);
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 140ms ease;
  z-index: 2;

  &--visible {
    opacity: 1;
    pointer-events: auto;
  }

  &__thumb {
    position: absolute;
    left: var(--scrollbar-thumb-inset);
    right: var(--scrollbar-thumb-inset);
    min-height: 36px;
    border-radius: 999px;
    background: var(--tr-layout-main-scrollbar-thumb-bg);
    cursor: grab;
    pointer-events: auto;
    transition: background-color 140ms ease;

    &:hover {
      background: var(--tr-layout-main-scrollbar-thumb-bg-hover);
    }
  }

  &--dragging-thumb &__thumb {
    cursor: grabbing;
    background: var(--tr-layout-main-scrollbar-thumb-bg-active);
  }
}
</style>
