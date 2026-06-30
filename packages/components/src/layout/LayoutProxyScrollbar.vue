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
import { usePointerDrag } from './composables/usePointerDrag'
import type { LayoutProxyScrollbarProps, LayoutScrollTarget } from './index.type'
import { lockBodyDragInteraction } from './utils/domInteraction'
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
  scrollTarget: HTMLElement
  startY: number
  startScrollTop: number
  releaseBodyInteraction: () => void
}

const MIN_THUMB_HEIGHT = 36
const SCROLL_TARGET_CLASS = 'tr-layout-proxy-scrollbar-target'

defineOptions({
  name: 'LayoutProxyScrollbar',
})

const props = defineProps<LayoutProxyScrollbarProps>()
const scrollbarRef = ref<HTMLElement | null>(null)
const thumbRef = shallowRef<HTMLElement | null>(null)
const metrics = shallowRef<ScrollMetrics>(createEmptyMetrics())
const isTargetHovering = shallowRef(false)
const isTrackHovering = shallowRef(false)
let frameId: number | null = null

const scrollTargetRef = computed<HTMLElement | null>(() => resolveScrollTargetElement(props.scrollTarget))
const isScrollable = computed(() => metrics.value.isScrollable)

const { isDragging: isDraggingThumb, cancel: cancelThumbDrag } = usePointerDrag<ThumbDragState>(thumbRef, {
  disabled: computed(() => !metrics.value.isScrollable),
  onStart: (event) => {
    const scrollTarget = scrollTargetRef.value
    if (!scrollTarget || !metrics.value.isScrollable) {
      return null
    }

    const bodyEl = scrollTarget.ownerDocument.body
    if (!bodyEl) {
      return null
    }

    event.preventDefault()

    return {
      scrollTarget,
      startY: event.clientY,
      startScrollTop: scrollTarget.scrollTop,
      releaseBodyInteraction: lockBodyDragInteraction(bodyEl, 'grabbing'),
    }
  },
  onMove: (state, event) => {
    const currentMetrics = metrics.value
    if (!currentMetrics.isScrollable) {
      return
    }

    state.scrollTarget.scrollTop = resolveScrollTopFromThumbDrag(state, event.clientY, currentMetrics)
    scheduleMetricsSync()
  },
  onEnd: (state) => {
    state.releaseBodyInteraction()
  },
})

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

// 把 ref / 组件实例统一解析成真实滚动容器。
function resolveScrollTargetElement(scrollTarget: LayoutScrollTarget): HTMLElement | null {
  const element = unrefElement(scrollTarget as HTMLElement | ComponentPublicInstance | null | undefined)
  return element instanceof HTMLElement ? element : null
}

// 轨道还没挂载时，直接用目标容器高度兜底。
function resolveTrackHeight(containerEl: HTMLElement | null, fallbackHeight: number): number {
  if (!(containerEl instanceof HTMLElement)) {
    return fallbackHeight
  }

  return Math.max(containerEl.clientHeight, 0)
}

// 基于当前 DOM 尺寸，计算 thumb 的尺寸和位置。
function resolveScrollMetrics(scrollTarget: HTMLElement, trackHeight: number): ScrollMetrics {
  const clientHeight = scrollTarget.clientHeight
  const scrollHeight = scrollTarget.scrollHeight
  const scrollTop = scrollTarget.scrollTop
  const scrollRange = scrollHeight - clientHeight
  const isScrollable = scrollRange > 1

  if (!isScrollable) {
    return {
      clientHeight,
      scrollHeight,
      scrollTop,
      trackHeight,
      thumbHeight: trackHeight,
      thumbOffset: 0,
      isScrollable: false,
    }
  }

  const thumbHeight = clamp((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT, trackHeight)
  const thumbTravel = trackHeight - thumbHeight
  const thumbOffset = (scrollTop / scrollRange) * thumbTravel

  return {
    clientHeight,
    scrollHeight,
    scrollTop,
    trackHeight,
    thumbHeight,
    thumbOffset,
    isScrollable: true,
  }
}

// 把 thumb 的位移换算成 scrollTop。
function resolveScrollTopFromThumbDrag(state: ThumbDragState, pointerY: number, currentMetrics: ScrollMetrics): number {
  const deltaY = pointerY - state.startY
  const scrollRange = currentMetrics.scrollHeight - currentMetrics.clientHeight
  const thumbTravel = currentMetrics.trackHeight - currentMetrics.thumbHeight
  const ratio = thumbTravel > 0 ? scrollRange / thumbTravel : 0

  return state.startScrollTop + deltaY * ratio
}

// 统一读取滚动容器和轨道尺寸，刷新当前 metrics。
function syncMetrics(): void {
  frameId = null

  const scrollTarget = scrollTargetRef.value
  if (!scrollTarget) {
    metrics.value = createEmptyMetrics()
    return
  }

  const trackHeight = resolveTrackHeight(scrollbarRef.value, scrollTarget.clientHeight)
  metrics.value = resolveScrollMetrics(scrollTarget, trackHeight)
}

// 用 rAF 合并多次更新，避免滚动和尺寸变化时重复计算。
function scheduleMetricsSync(): void {
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

useEventListener(scrollTargetRef, 'mouseenter', () => {
  isTargetHovering.value = true
})

useEventListener(scrollTargetRef, 'mouseleave', () => {
  isTargetHovering.value = false
})

useEventListener(scrollTargetRef, 'scroll', () => {
  scheduleMetricsSync()
})

useResizeObserver(scrollTargetRef, () => {
  scheduleMetricsSync()
})

useResizeObserver(scrollbarRef, () => {
  scheduleMetricsSync()
})

useMutationObserver(
  scrollTargetRef,
  () => {
    scheduleMetricsSync()
  },
  { childList: true, subtree: true },
)

watch(
  scrollTargetRef,
  (nextTarget, prevTarget) => {
    cancelThumbDrag()
    isTargetHovering.value = false
    isTrackHovering.value = false
    prevTarget?.classList.remove(SCROLL_TARGET_CLASS)
    nextTarget?.classList.add(SCROLL_TARGET_CLASS)
    scheduleMetricsSync()
  },
  { immediate: true },
)

watch(scrollbarRef, () => {
  scheduleMetricsSync()
})

onBeforeUnmount(() => {
  if (frameId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(frameId)
  }

  cancelThumbDrag()
  scrollTargetRef.value?.classList.remove(SCROLL_TARGET_CLASS)
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
    <div ref="thumbRef" class="tr-layout-proxy-scrollbar__thumb" :style="thumbStyle" />
  </div>
</template>

<style lang="less">
.tr-layout-proxy-scrollbar-target {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>

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
