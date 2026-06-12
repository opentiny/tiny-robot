import { useDraggable, useEventListener, useWindowSize } from '@vueuse/core'
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type {
  LayoutFloatingDragEventDetail,
  LayoutFloatingResizeEventDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
  LayoutMode,
} from '../index.type'
import type { LayoutFloatingRect, LayoutResolvedFloating } from '../internal.type'
import {
  areFloatingGeometryEqual,
  clampFloatingRect,
  clampFloatingRectByHandle,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_TOP,
  DEFAULT_FLOATING_WIDTH,
  normalizeFloatingRect,
  resolveFloatingSnapshot,
  toCommittedFloatingState,
} from '../utils/surfaceGeometry'
import { resolveFloatingResizeRect } from '../utils/surfaceResize'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'

interface UseLayoutFloatingSurfaceOptions {
  mode: MaybeRefOrGetter<LayoutMode>
  floatingState: MaybeRefOrGetter<LayoutFloatingState | undefined>
  floating: MaybeRefOrGetter<LayoutResolvedFloating | undefined>
  commitFloatingState: (nextFloating: LayoutFloatingState) => void
  initializeFloatingState: (nextFloating: LayoutFloatingState) => void
  frameRef: Ref<HTMLElement | null>
  dragHandleRef: Ref<HTMLElement | null>
  onFloatingDragStart?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragEventDetail) => void
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

export function useLayoutFloatingSurface(options: UseLayoutFloatingSurfaceOptions) {
  const activeResize = shallowRef<FloatingResizeState | null>(null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window

  const { width: viewportWidth, height: viewportHeight } = useWindowSize({
    type: 'visual',
    initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
    initialHeight: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
  })

  const mode = computed<LayoutMode>(() => toValue(options.mode))
  const isFloating = computed(() => mode.value === 'floating')
  const isNormal = computed(() => mode.value === 'normal')
  const floatingStateValue = computed(() => toValue(options.floatingState))
  const floatingValue = computed(() => toValue(options.floating))
  const floatingRect = computed(() => normalizeFloatingRect(floatingValue.value))
  const isFloatingDraggable = computed(() => floatingRect.value.draggable ?? true)
  const isFloatingResizable = computed(() => floatingRect.value.resizable === true)
  const isResizing = computed(() => activeResize.value !== null)
  const activeResizeHandle = computed<LayoutFloatingResizeHandle | null>(() => activeResize.value?.handle ?? null)
  const canDragFloating = computed(() => isFloating.value && isFloatingDraggable.value && !isResizing.value)

  function toFloatingState(rect: LayoutFloatingRect, options?: { normalizeCenter?: boolean }): LayoutFloatingState {
    return toCommittedFloatingState(
      resolveFloatingSnapshot(rect, floatingValue.value),
      floatingStateValue.value,
      options,
    )
  }

  function toDragDetail(
    rect: LayoutFloatingRect,
    options?: { normalizeCenter?: boolean },
  ): LayoutFloatingDragEventDetail {
    return toFloatingState(rect, options)
  }

  function toResizeDetail(
    handle: LayoutFloatingResizeHandle,
    rect: LayoutFloatingRect,
    options?: { normalizeCenter?: boolean },
  ): LayoutFloatingResizeEventDetail {
    return {
      ...toDragDetail(rect, options),
      handle,
    }
  }

  function commitRect(nextRect: LayoutFloatingRect): LayoutFloatingRect {
    const normalizedRect = clampFloatingRect(nextRect)

    if (areFloatingGeometryEqual(floatingRect.value, normalizedRect)) {
      return normalizedRect
    }

    options.commitFloatingState(toFloatingState(normalizedRect, { normalizeCenter: true }))

    return normalizedRect
  }

  function syncFloatingRect(): void {
    if (!isFloating.value || isDragging.value || isResizing.value) {
      return
    }

    if (!floatingStateValue.value) {
      options.initializeFloatingState(toFloatingState(floatingRect.value))
    }

    const nextRect = commitRect(floatingRect.value)
    x.value = nextRect.x
    y.value = nextRect.y
  }

  function applyDraggedPosition(nextX: number, nextY: number) {
    const nextRect = commitRect({
      ...floatingRect.value,
      x: nextX,
      y: nextY,
    })

    x.value = nextRect.x
    y.value = nextRect.y

    return nextRect
  }

  const { x, y, isDragging } = useDraggable(options.frameRef, {
    handle: options.dragHandleRef,
    initialValue: { x: DEFAULT_FLOATING_GAP, y: DEFAULT_FLOATING_TOP },
    preventDefault: true,
    buttons: [0],
    disabled: computed(() => !canDragFloating.value),
    onStart: () => {
      if (!canDragFloating.value) {
        return false
      }

      const rect = floatingRect.value
      x.value = rect.x
      y.value = rect.y
      options.onFloatingDragStart?.(toDragDetail(rect, { normalizeCenter: true }))
    },
    onMove: (position) => {
      const nextRect = applyDraggedPosition(position.x, position.y)
      options.onFloatingDrag?.(toDragDetail(nextRect, { normalizeCenter: true }))
    },
    onEnd: (position) => {
      const nextRect = applyDraggedPosition(position.x, position.y)
      options.onFloatingDragEnd?.(toDragDetail(nextRect, { normalizeCenter: true }))
    },
  })

  const canResizeFloating = computed(() => isFloating.value && isFloatingResizable.value && !isDragging.value)

  function stopResize(pointerId?: number): void {
    const state = activeResize.value

    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)
    options.onFloatingResizeEnd?.(toResizeDetail(state.handle, state.currentRect, { normalizeCenter: true }))
    activeResize.value = null
  }

  function startResize(handle: LayoutFloatingResizeHandle, event: PointerEvent): void {
    if (activeResize.value || isDragging.value || !event.isPrimary || event.button !== 0 || !canResizeFloating.value) {
      return
    }

    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return
    }

    const startRect = floatingRect.value

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

    options.onFloatingResizeStart?.(toResizeDetail(handle, startRect, { normalizeCenter: true }))
  }

  function applyResize(state: FloatingResizeState, pointerX: number, pointerY: number): void {
    const nextRect = commitRect(
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

    options.onFloatingResize?.(toResizeDetail(state.handle, nextRect, { normalizeCenter: true }))
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

  watch(
    [mode, floatingValue, viewportWidth, viewportHeight],
    () => {
      syncFloatingRect()
    },
    { immediate: true },
  )

  const frameClass = computed(() => ({
    'tr-layout-frame--floating': isFloating.value,
    'tr-layout-frame--floating-dragging': isDragging.value,
    'tr-layout-frame--floating-resizing': isResizing.value,
  }))

  const frameStyle = computed<CSSProperties>(() => {
    if (isNormal.value) {
      return {}
    }

    return {
      left: `${floatingRect.value.x}px`,
      top: `${floatingRect.value.y}px`,
      width: `${floatingRect.value.width}px`,
      height: `${floatingRect.value.height}px`,
    }
  })

  const dragBarClass = computed(() => ({
    'tr-layout-frame__drag-bar--draggable': canDragFloating.value,
  }))

  const resizeHandles = computed(() => {
    if (!isFloating.value || !isFloatingResizable.value) {
      return []
    }

    return RESIZE_HANDLES.map((handle) => ({
      handle,
      active: activeResizeHandle.value === handle,
      onPointerdown: (event: PointerEvent) => startResize(handle, event),
    }))
  })

  return {
    isFloating,
    showDragBar: computed(() => isFloating.value),
    frameClass,
    frameStyle,
    dragBarClass,
    resizeHandles,
  }
}
