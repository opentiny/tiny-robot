import { useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch, type CSSProperties } from 'vue'
import type {
  LayoutFloatingDragEventDetail,
  LayoutFloatingResizeEventDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
} from '../index.type'
import type { LayoutContext, LayoutFloatingRect } from '../internal.type'
import { useLayoutFloatingDrag } from './useLayoutFloatingDrag'
import { useLayoutFloatingResize } from './useLayoutFloatingResize'
import {
  areFloatingGeometryEqual,
  clampFloatingRect,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_WIDTH,
  normalizeFloatingRect,
  resolveFloatingSnapshot,
  toCommittedFloatingState,
} from '../utils/surfaceGeometry'

type FloatingInteraction = 'drag' | 'resize'

interface UseLayoutFloatingOptions {
  context: LayoutContext
  onFloatingDragStart?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragEventDetail) => void
  onFloatingResizeStart?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResize?: (detail: LayoutFloatingResizeEventDetail) => void
  onFloatingResizeEnd?: (detail: LayoutFloatingResizeEventDetail) => void
}

export function useLayoutFloating(options: UseLayoutFloatingOptions) {
  const { width: viewportWidth, height: viewportHeight } = useWindowSize({
    type: 'visual',
    initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
    initialHeight: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
  })

  const mode = options.context.floating.state.mode
  const isFloating = computed(() => mode.value === 'floating')
  const isNormal = computed(() => mode.value === 'normal')
  const floatingStateValue = options.context.floating.state.value
  const floatingValue = options.context.floating.state.resolved
  const floatingRect = computed(() => normalizeFloatingRect(floatingValue.value))
  const isFloatingDraggable = computed(() => floatingRect.value.draggable ?? true)
  const isFloatingResizable = computed(() => floatingRect.value.resizable === true)
  const activeInteraction = shallowRef<FloatingInteraction | null>(null)
  const canStartDrag = computed(() => isFloating.value && isFloatingDraggable.value && activeInteraction.value === null)
  const canStartResize = computed(
    () => isFloating.value && isFloatingResizable.value && activeInteraction.value === null,
  )
  const isDragEnabled = computed(
    () => isFloating.value && isFloatingDraggable.value && activeInteraction.value !== 'resize',
  )
  const isResizeVisible = computed(() => isFloating.value && isFloatingResizable.value)

  function toFloatingState(rect: LayoutFloatingRect, normalizeCenter = false): LayoutFloatingState {
    return toCommittedFloatingState(resolveFloatingSnapshot(rect, floatingValue.value), floatingStateValue.value, {
      normalizeCenter,
    })
  }

  function toResizeDetail(
    handle: LayoutFloatingResizeHandle,
    rect: LayoutFloatingRect,
  ): LayoutFloatingResizeEventDetail {
    return {
      ...toFloatingState(rect, true),
      handle,
    }
  }

  function commitRect(nextRect: LayoutFloatingRect): LayoutFloatingRect {
    const normalizedRect = clampFloatingRect(nextRect)

    if (areFloatingGeometryEqual(floatingRect.value, normalizedRect)) {
      return normalizedRect
    }

    options.context.floating.actions.commit(toFloatingState(normalizedRect, true))

    return normalizedRect
  }

  function applyDraggedPosition(nextX: number, nextY: number) {
    const nextRect = commitRect({
      ...floatingRect.value,
      x: nextX,
      y: nextY,
    })

    return nextRect
  }

  function startInteraction(type: FloatingInteraction): void {
    activeInteraction.value = type
  }

  function endInteraction(type: FloatingInteraction): void {
    if (activeInteraction.value === type) {
      activeInteraction.value = null
    }
  }

  const drag = useLayoutFloatingDrag({
    context: options.context,
    floatingRect,
    canStart: canStartDrag,
    isEnabled: isDragEnabled,
    toFloatingState,
    applyPosition: applyDraggedPosition,
    onInteractionStart: () => startInteraction('drag'),
    onInteractionEnd: () => endInteraction('drag'),
    onFloatingDragStart: options.onFloatingDragStart,
    onFloatingDrag: options.onFloatingDrag,
    onFloatingDragEnd: options.onFloatingDragEnd,
  })

  const resize = useLayoutFloatingResize({
    context: options.context,
    floatingRect,
    canStart: canStartResize,
    isVisible: isResizeVisible,
    commitRect,
    toResizeDetail,
    onInteractionStart: () => startInteraction('resize'),
    onInteractionEnd: () => endInteraction('resize'),
    onFloatingResizeStart: options.onFloatingResizeStart,
    onFloatingResize: options.onFloatingResize,
    onFloatingResizeEnd: options.onFloatingResizeEnd,
  })

  function syncFloatingRect(): void {
    if (!isFloating.value || activeInteraction.value !== null) {
      return
    }

    if (!floatingStateValue.value) {
      options.context.floating.actions.initialize(toFloatingState(floatingRect.value))
    }

    const nextRect = commitRect(floatingRect.value)
    drag.setPosition(nextRect.x, nextRect.y)
  }

  watch(
    [mode, floatingValue, viewportWidth, viewportHeight],
    () => {
      syncFloatingRect()
    },
    { immediate: true },
  )

  const floatingClass = computed(() => ({
    'tr-layout--floating': isFloating.value,
    'tr-layout--floating-dragging': drag.isDragging.value,
    'tr-layout--floating-resizing': resize.isResizing.value,
  }))

  const floatingStyle = computed<CSSProperties>(() => {
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

  return {
    isFloating,
    showDragBar: computed(() => isFloating.value),
    floatingClass,
    floatingStyle,
    dragBarClass: drag.dragBarClass,
    resizeHandles: resize.resizeHandles,
  }
}
