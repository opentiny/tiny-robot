<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { usePointerDrag } from '../composables/usePointerDrag'
import type { LayoutAsideResizeDetail, LayoutSide } from '../index.type'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyDragInteraction } from '../utils/domInteraction'
import { clamp } from '../utils/number'
import { useLayoutContext } from '../composables/useLayoutContext'

defineOptions({
  name: 'LayoutAsideResizeTrigger',
})

interface LayoutAsideResizeTriggerProps {
  side: LayoutSide
  asideEl: HTMLElement | null
  minWidth: number
  maxWidth: number
  oppositeDockWidth: number
}

const props = defineProps<LayoutAsideResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'width-change', value: number): void
  (event: 'aside-resize-start', value: LayoutAsideResizeDetail): void
  (event: 'aside-resize-end', value: LayoutAsideResizeDetail): void
}>()

const triggerRef = shallowRef<HTMLElement | null>(null)

interface ResizeState {
  side: LayoutSide
  startX: number
  startWidth: number
  currentWidth: number
  minWidth: number
  effectiveMax: number
  pendingWidth: number | null
  frameId: number | null
  view: Window | null
  releaseBodyInteraction: () => void
}

interface ResizeBounds {
  startWidth: number
  minWidth: number
  effectiveMax: number
}

const { rootEl } = useLayoutContext()

const { isDragging: isResizing } = usePointerDrag<ResizeState>(triggerRef, {
  onStart: (event) => {
    const asideEl = props.asideEl
    const layoutEl = rootEl.value

    if (!asideEl || !layoutEl) {
      return null
    }

    const bounds = resolveResizeBounds(layoutEl, asideEl)
    const bodyEl = layoutEl.ownerDocument.body
    const view = layoutEl.ownerDocument.defaultView

    event.preventDefault()

    const state = createResizeState(event, bounds, view, lockBodyDragInteraction(bodyEl, 'col-resize'))

    emit('aside-resize-start', {
      side: props.side,
      expandedWidth: state.startWidth,
    })

    return state
  },
  onMove: (state, event) => {
    const nextWidth = resolveNextWidth(state, event.clientX)
    queueWidthChange(state, nextWidth)
  },
  onEnd: (state) => {
    if (state.frameId !== null && state.view) {
      state.view.cancelAnimationFrame(state.frameId)
      state.frameId = null
    }

    flushWidthChange(state)
    state.releaseBodyInteraction()
    emit('aside-resize-end', {
      side: props.side,
      expandedWidth: state.currentWidth,
    })
  },
})

const triggerClass = computed(() => [
  `tr-layout__resize-trigger--${props.side}`,
  {
    'is-dragging': isResizing.value,
  },
])

function resolveResizeBounds(layoutEl: HTMLElement, asideEl: HTMLElement): ResizeBounds {
  const rootRect = layoutEl.getBoundingClientRect()
  const mainMinWidthValue = getComputedStyle(layoutEl).getPropertyValue('--tr-layout-main-min-width').trim()
  const mainMinWidth = resolveCssLengthToPx(mainMinWidthValue, 320)
  const startWidth = asideEl.getBoundingClientRect().width
  const maxAvailableWidth = rootRect.width - mainMinWidth - props.oppositeDockWidth

  return {
    startWidth,
    minWidth: props.minWidth,
    effectiveMax: Math.max(props.minWidth, Math.min(props.maxWidth, maxAvailableWidth)),
  }
}

function createResizeState(
  event: PointerEvent,
  bounds: ResizeBounds,
  view: Window | null,
  releaseBodyInteraction: () => void,
): ResizeState {
  return {
    side: props.side,
    startX: event.clientX,
    startWidth: bounds.startWidth,
    currentWidth: bounds.startWidth,
    minWidth: bounds.minWidth,
    effectiveMax: bounds.effectiveMax,
    pendingWidth: null,
    frameId: null,
    view,
    releaseBodyInteraction,
  }
}

function resolveNextWidth(state: ResizeState, pointerX: number): number {
  const deltaX = pointerX - state.startX
  const rawWidth = state.side === 'left' ? state.startWidth + deltaX : state.startWidth - deltaX

  return clamp(rawWidth, state.minWidth, state.effectiveMax)
}

function queueWidthChange(state: ResizeState, nextWidth: number): void {
  if (nextWidth === state.currentWidth) {
    return
  }

  state.pendingWidth = nextWidth
  state.currentWidth = nextWidth

  if (!state.view) {
    flushWidthChange(state)
    return
  }

  if (state.frameId !== null) {
    return
  }

  state.frameId = state.view.requestAnimationFrame(() => {
    state.frameId = null
    flushWidthChange(state)
  })
}

function flushWidthChange(state: ResizeState): void {
  if (state.pendingWidth === null) {
    return
  }

  const width = state.pendingWidth

  emit('width-change', width)

  state.pendingWidth = null
}
</script>

<template>
  <div ref="triggerRef" class="tr-layout__resize-trigger" :class="triggerClass" aria-hidden="true">
    <span class="tr-layout__resize-trigger-indicator" aria-hidden="true" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout__resize-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--trigger-size);
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: col-resize;
  z-index: 2;
  display: grid;
  place-items: center;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset-block: 0;
    left: 50%;
    width: 1px;
    background: var(--line-color);
    transform: translateX(-50%);
    transition: background-color 180ms ease;
    z-index: 0;
  }

  &--left {
    right: calc(var(--trigger-size) / -2);

    .tr-layout__resize-trigger-indicator {
      transform: translateX(calc(var(--indicator-idle-offset) * -1)) scale(0.92);
    }
  }

  &--right {
    left: calc(var(--trigger-size) / -2);
  }

  &-indicator {
    position: relative;
    display: block;
    width: var(--indicator-width);
    height: var(--indicator-height);
    border-radius: 999px;
    background: var(--indicator-bg);
    border: 1px solid var(--indicator-border);
    opacity: var(--indicator-idle-opacity);
    transform: translateX(var(--indicator-idle-offset)) scale(0.92);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &:hover,
  &.is-dragging {
    .tr-layout__resize-trigger-indicator {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  &:hover::before,
  &.is-dragging::before {
    background: var(--line-hover-color);
  }

  &.is-dragging {
    &::before {
      background: var(--line-active-color);
    }

    .tr-layout__resize-trigger-indicator {
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
    }
  }
}
</style>
