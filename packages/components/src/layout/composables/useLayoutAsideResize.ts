import { useEventListener } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import type { LayoutAsideResizeEventDetail } from '../index.type'
import type { LayoutContext, LayoutPanelContext } from '../internal.type'
import type { LayoutPlacement } from '../index.type'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clamp } from '../utils/math'

interface UseLayoutAsideResizeOptions {
  context: LayoutContext
  panel: LayoutPanelContext
  onResizeStart?: (detail: LayoutAsideResizeEventDetail) => void
  onResize?: (detail: LayoutAsideResizeEventDetail) => void
  onResizeEnd?: (detail: LayoutAsideResizeEventDetail) => void
}

interface ResizeState {
  pointerId: number
  handleEl: HTMLElement
  panel: LayoutPanelContext
  placement: LayoutPlacement
  startX: number
  startWidth: number
  currentWidth: number
  minWidth: number
  effectiveMax: number
  pendingWidth: number | null
  frameId: number | null
  bodyState: BodyInteractionState
}

function getDockedAsideWidth(panel: LayoutPanelContext, asideEl: HTMLElement | null | undefined): number {
  if (!panel.state.isDock.value || panel.state.isHidden.value || !asideEl) {
    return 0
  }

  return asideEl.getBoundingClientRect().width
}

export function useLayoutAsideResize(options: UseLayoutAsideResizeOptions) {
  const activeResize = shallowRef<ResizeState | null>(null)
  const isResizing = computed(() => activeResize.value !== null)
  const draggingPlacement = computed(() => activeResize.value?.placement ?? null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window

  function scheduleWidth(nextWidth: number): void {
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

      current.panel.actions.setWidth(current.pendingWidth)
      options.onResize?.({
        placement: current.placement,
        expandedWidth: current.pendingWidth,
      })
      current.pendingWidth = null
    })
  }

  function stopResize(pointerId?: number): void {
    const state = activeResize.value
    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    if (state.frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(state.frameId)
      state.frameId = null
    }

    if (state.pendingWidth !== null) {
      state.panel.actions.setWidth(state.pendingWidth)
      options.onResize?.({
        placement: state.placement,
        expandedWidth: state.pendingWidth,
      })
      state.pendingWidth = null
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)

    options.onResizeEnd?.({
      placement: state.placement,
      expandedWidth: state.currentWidth,
    })

    activeResize.value = null
  }

  function startResize(event: PointerEvent): void {
    const panel = options.panel

    if (activeResize.value || !event.isPrimary || event.button !== 0 || !panel.state.canResize.value) {
      return
    }

    const rootEl = options.context.rootEl.value
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    const asideEl = panel.el.value

    if (!rootEl || !handleEl || !asideEl) {
      return
    }

    const isLeft = panel.state.placement === 'left'
    const oppositePanel = isLeft ? options.context.right : options.context.left
    const oppositeAsideEl = oppositePanel.el.value
    const rootRect = rootEl.getBoundingClientRect()
    const startWidth = asideEl.getBoundingClientRect().width
    const maxWidth = panel.state.maxWidth.value
    const minWidth = panel.state.minWidth.value
    const mainMinWidth = resolveCssLengthToPx(
      getComputedStyle(rootEl).getPropertyValue('--tr-layout-main-min-width').trim() || '320px',
      rootEl,
      320,
    )
    const oppositeDockWidth = getDockedAsideWidth(oppositePanel, oppositeAsideEl)
    const effectiveMax = Math.max(minWidth, Math.min(maxWidth, rootRect.width - mainMinWidth - oppositeDockWidth))

    event.preventDefault()
    handleEl.setPointerCapture(event.pointerId)

    activeResize.value = {
      pointerId: event.pointerId,
      handleEl,
      panel,
      placement: panel.state.placement,
      startX: event.clientX,
      startWidth,
      currentWidth: startWidth,
      minWidth,
      effectiveMax,
      pendingWidth: null,
      frameId: null,
      bodyState: lockBodyInteraction(rootEl.ownerDocument.body, 'col-resize'),
    }

    options.onResizeStart?.({
      placement: panel.state.placement,
      expandedWidth: startWidth,
    })
  }

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const state = activeResize.value
    if (!state || event.pointerId !== state.pointerId) {
      return
    }

    const deltaX = event.clientX - state.startX
    const rawWidth = state.placement === 'left' ? state.startWidth + deltaX : state.startWidth - deltaX
    scheduleWidth(clamp(rawWidth, state.minWidth, state.effectiveMax))
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

  return {
    isResizing,
    draggingPlacement,
    startResize,
  }
}
