<script setup lang="ts">
import { computed } from 'vue'
import { usePointerDragSession } from '../composables/usePointerDragSession'
import type { LayoutAsideResizeDetail, LayoutSide } from '../index.type'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { getLayoutAsideElement, getLayoutRootElement, isHTMLElement } from '../utils/layoutElements'
import { clamp } from '../utils/number'

defineOptions({
  name: 'LayoutAsideResizeTrigger',
})

interface LayoutAsideResizeTriggerProps {
  side: LayoutSide
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

interface ResizeElements {
  handleEl: HTMLElement
  asideEl: HTMLElement
  rootEl: HTMLElement
}

interface ResizeBounds {
  startWidth: number
  minWidth: number
  effectiveMax: number
}

const { activeSession: activeResize, startSession } = usePointerDragSession<ResizeState>({
  onMove: (state, event) => {
    queueWidthChange(resolveNextWidth(state, event.clientX))
  },
  onStop: (state) => {
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
const isDragging = computed(() => activeResize.value?.side === props.side)
const triggerClass = computed(() => [
  `tr-layout__resize-trigger--${props.side}`,
  {
    'is-dragging': isDragging.value,
  },
])

function resolveResizeElements(event: PointerEvent): ResizeElements | null {
  const handleEl = isHTMLElement(event.currentTarget) ? event.currentTarget : null

  if (!handleEl) {
    return null
  }

  const asideEl = getLayoutAsideElement(handleEl)
  const rootEl = getLayoutRootElement(handleEl)

  if (!asideEl || !rootEl) {
    return null
  }

  return {
    handleEl,
    asideEl,
    rootEl,
  }
}

function resolveMainMinWidth(rootEl: HTMLElement): number {
  return resolveCssLengthToPx(
    getComputedStyle(rootEl).getPropertyValue('--tr-layout-main-min-width').trim() || '320px',
    320,
  )
}

function resolveResizeBounds(elements: ResizeElements): ResizeBounds {
  const rootRect = elements.rootEl.getBoundingClientRect()
  const startWidth = elements.asideEl.getBoundingClientRect().width
  const mainMinWidth = resolveMainMinWidth(elements.rootEl)
  const maxAvailableWidth = rootRect.width - mainMinWidth - props.oppositeDockWidth

  return {
    startWidth,
    minWidth: props.minWidth,
    effectiveMax: Math.max(props.minWidth, Math.min(props.maxWidth, maxAvailableWidth)),
  }
}

function createResizeState(
  event: PointerEvent,
  elements: ResizeElements,
  bounds: ResizeBounds,
  bodyState: BodyInteractionState,
): ResizeState {
  return {
    pointerId: event.pointerId,
    handleEl: elements.handleEl,
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

    if (current.pendingWidth === null) {
      return
    }

    emit('width-change', current.pendingWidth)
    emit('aside-resize', {
      side: props.side,
      expandedWidth: current.pendingWidth,
    })
    current.pendingWidth = null
  })
}

function flushWidthChange(state: ResizeState): void {
  if (state.pendingWidth === null) {
    return
  }

  emit('width-change', state.pendingWidth)
  emit('aside-resize', {
    side: props.side,
    expandedWidth: state.pendingWidth,
  })
  state.pendingWidth = null
}

function startResize(event: PointerEvent): void {
  const session = startSession(event, (event) => {
    const elements = resolveResizeElements(event)
    if (!elements) {
      return null
    }

    const bounds = resolveResizeBounds(elements)

    event.preventDefault()
    elements.handleEl.setPointerCapture(event.pointerId)

    const bodyState = lockBodyInteraction(elements.rootEl.ownerDocument.body, 'col-resize')
    return createResizeState(event, elements, bounds, bodyState)
  })

  if (session) {
    emit('aside-resize-start', {
      side: props.side,
      expandedWidth: session.startWidth,
    })
  }
}
</script>

<template>
  <div class="tr-layout__resize-trigger" :class="triggerClass" aria-hidden="true" @pointerdown="startResize">
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
