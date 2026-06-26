<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { usePointerDrag } from '../composables/usePointerDrag'
import type { LayoutAsideResizeDetail, LayoutSide } from '../index.type'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
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
  (event: 'aside-resize', value: LayoutAsideResizeDetail): void
  (event: 'aside-resize-end', value: LayoutAsideResizeDetail): void
}>()

const triggerRef = shallowRef<HTMLElement | null>(null)

interface ResizeState {
  pointerId: number
  handleEl: HTMLElement
  side: LayoutSide
  startX: number
  startWidth: number
  currentWidth: number
  minWidth: number
  effectiveMax: number
  pendingWidth: number | null
  frameId: number | null
  bodyState: BodyInteractionState
}

interface ResizeBounds {
  startWidth: number
  minWidth: number
  effectiveMax: number
}

const { rootEl } = useLayoutContext()

const { dragState: activeResize } = usePointerDrag<ResizeState>(triggerRef, {
  onStart: (event) => {
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    const asideEl = props.asideEl
    const layoutEl = rootEl.value

    if (!handleEl || !asideEl || !layoutEl) {
      return null
    }

    const bounds = resolveResizeBounds(layoutEl, asideEl)

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    const bodyState = lockBodyInteraction(layoutEl.ownerDocument.body, 'col-resize')
    const state = createResizeState(event, handleEl, bounds, bodyState)

    emit('aside-resize-start', {
      side: props.side,
      expandedWidth: state.startWidth,
    })

    return state
  },
  onMove: (state, event) => {
    const nextWidth = resolveNextWidth(state, event.clientX)
    queueWidthChange(nextWidth)
  },
  onEnd: (state) => {
    if (state.frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(state.frameId)
      state.frameId = null
    }

    flushWidthChange(state)

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)
    emit('aside-resize-end', {
      side: props.side,
      expandedWidth: state.currentWidth,
    })
  },
})

const triggerClass = computed(() => [
  `tr-layout__resize-trigger--${props.side}`,
  {
    'is-dragging': activeResize.value?.side === props.side,
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
  handleEl: HTMLElement,
  bounds: ResizeBounds,
  bodyState: BodyInteractionState,
): ResizeState {
  return {
    pointerId: event.pointerId,
    handleEl,
    side: props.side,
    startX: event.clientX,
    startWidth: bounds.startWidth,
    currentWidth: bounds.startWidth,
    minWidth: bounds.minWidth,
    effectiveMax: bounds.effectiveMax,
    pendingWidth: null,
    frameId: null,
    bodyState,
  }
}

function resolveNextWidth(state: ResizeState, pointerX: number): number {
  const deltaX = pointerX - state.startX
  const rawWidth = state.side === 'left' ? state.startWidth + deltaX : state.startWidth - deltaX

  return clamp(rawWidth, state.minWidth, state.effectiveMax)
}

function queueWidthChange(nextWidth: number): void {
  const state = activeResize.value
  if (!state || nextWidth === state.currentWidth) {
    return
  }

  state.pendingWidth = nextWidth
  state.currentWidth = nextWidth

  if (state.frameId !== null || typeof window === 'undefined') {
    return
  }

  state.frameId = window.requestAnimationFrame(() => {
    const current = activeResize.value
    if (!current) {
      return
    }

    current.frameId = null
    flushWidthChange(current)
  })
}

function flushWidthChange(state: ResizeState): void {
  if (state.pendingWidth === null) {
    return
  }

  const width = state.pendingWidth

  emit('width-change', width)
  emit('aside-resize', {
    side: props.side,
    expandedWidth: width,
  })

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
