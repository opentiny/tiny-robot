import { useEventListener } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, type ComputedRef } from 'vue'
import type { LayoutFloatingResizeEventDetail, LayoutFloatingResizeHandle } from '../index.type'
import type { LayoutContext, LayoutFloatingRect } from '../internal.type'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clampFloatingRectByHandle } from '../utils/surfaceGeometry'
import { resolveFloatingResizeRect } from '../utils/surfaceResize'

interface UseLayoutFloatingResizeOptions {
  context: LayoutContext
  floatingRect: ComputedRef<LayoutFloatingRect>
  canStart: ComputedRef<boolean>
  isVisible: ComputedRef<boolean>
  commitRect: (nextRect: LayoutFloatingRect) => LayoutFloatingRect
  toResizeDetail: (handle: LayoutFloatingResizeHandle, rect: LayoutFloatingRect) => LayoutFloatingResizeEventDetail
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  onFloatingResizeStart?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResize?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResizeEnd?: (detail: LayoutFloatingResizeEventDetail) => void
}

interface FloatingResizeState {
  pointerId: number
  handleEl: HTMLElement
  handle: LayoutFloatingResizeHandle
  currentRect: LayoutFloatingRect
  lastPointerX: number
  lastPointerY: number
  bodyState: BodyInteractionState
}

const RESIZE_HANDLES: LayoutFloatingResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

function resolveResizeCursor(handle: LayoutFloatingResizeHandle): string {
  if (handle === 'n' || handle === 's') {
    return 'ns-resize'
  }

  if (handle === 'e' || handle === 'w') {
    return 'ew-resize'
  }

  if (handle === 'ne' || handle === 'sw') {
    return 'nesw-resize'
  }

  return 'nwse-resize'
}

export function useLayoutFloatingResize(options: UseLayoutFloatingResizeOptions) {
  const activeResize = shallowRef<FloatingResizeState | null>(null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  const isResizing = computed(() => activeResize.value !== null)
  const activeResizeHandle = computed<LayoutFloatingResizeHandle | null>(() => activeResize.value?.handle ?? null)

  function stopResize(pointerId?: number): void {
    const state = activeResize.value

    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)
    options.onFloatingResizeEnd?.(options.toResizeDetail(state.handle, state.currentRect))
    activeResize.value = null
    options.onInteractionEnd?.()
  }

  function startResize(handle: LayoutFloatingResizeHandle, event: PointerEvent): void {
    if (activeResize.value || !event.isPrimary || event.button !== 0 || !options.canStart.value) {
      return
    }

    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return
    }

    const startRect = options.floatingRect.value

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      handle,
      currentRect: startRect,
      lastPointerX: event.clientX,
      lastPointerY: event.clientY,
      bodyState: lockBodyInteraction(handleEl.ownerDocument.body, resolveResizeCursor(handle)),
    }

    options.onInteractionStart?.()
    options.onFloatingResizeStart?.(options.toResizeDetail(handle, startRect))
  }

  function applyResize(state: FloatingResizeState, pointerX: number, pointerY: number): void {
    const nextRect = options.commitRect(
      clampFloatingRectByHandle(
        resolveFloatingResizeRect({
          handle: state.handle,
          deltaX: pointerX - state.lastPointerX,
          deltaY: pointerY - state.lastPointerY,
          startRect: state.currentRect,
        }),
        state.handle,
      ),
    )

    state.currentRect = nextRect
    state.lastPointerX = pointerX
    state.lastPointerY = pointerY

    options.onFloatingResize?.(options.toResizeDetail(state.handle, nextRect))
  }

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const state = activeResize.value

    if (!state || event.pointerId !== state.pointerId) {
      return
    }

    if (event.clientX === state.lastPointerX && event.clientY === state.lastPointerY) {
      return
    }

    applyResize(state, event.clientX, event.clientY)
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopResize(event.pointerId)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopResize(event.pointerId)
  })

  onBeforeUnmount(() => {
    stopResize()
  })

  const resizeHandles = computed(() => {
    if (!options.isVisible.value) {
      return []
    }

    return RESIZE_HANDLES.map((handle) => ({
      handle,
      active: activeResizeHandle.value === handle,
      onPointerdown: (event: PointerEvent) => startResize(handle, event),
    }))
  })

  return {
    isResizing,
    resizeHandles,
  }
}
