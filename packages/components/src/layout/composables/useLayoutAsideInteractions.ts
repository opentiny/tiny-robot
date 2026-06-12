import { useEventListener } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import type { LayoutAsideResizeEventDetail, LayoutPlacement } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'
import { resolveCssLengthToPx } from '../utils/cssLength'
import { lockBodyInteraction, restoreBodyInteraction, type BodyInteractionState } from '../utils/domInteraction'
import { clamp } from '../utils/math'

interface UseLayoutAsideInteractionsOptions {
  rootRef: Ref<HTMLElement | null>
  leftAsideRef: Ref<HTMLElement | null>
  rightAsideRef: Ref<HTMLElement | null>
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: MaybeRefOrGetter<boolean>
  closeDrawers: () => void
  onResizeStart?: (detail: LayoutAsideResizeEventDetail) => void
  onResize?: (detail: LayoutAsideResizeEventDetail) => void
  onResizeEnd?: (detail: LayoutAsideResizeEventDetail) => void
}

interface ResizeState {
  pointerId: number
  handleEl: HTMLElement
  panel: LayoutPanelApi
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

function getDockedAsideWidth(panel: LayoutPanelApi, asideEl: HTMLElement | null | undefined): number {
  if (!panel.isDock || panel.isHidden || !asideEl) {
    return 0
  }

  return asideEl.getBoundingClientRect().width
}

export function useLayoutAsideInteractions(options: UseLayoutAsideInteractionsOptions) {
  const activeResize = shallowRef<ResizeState | null>(null)
  const isResizing = computed(() => activeResize.value !== null)
  const draggingPlacement = computed(() => activeResize.value?.placement ?? null)
  const pointerTarget = typeof window === 'undefined' ? undefined : window
  const keyboardTarget = typeof window === 'undefined' ? undefined : window

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

      current.panel.setWidth(current.pendingWidth)
      options.onResize?.({
        placement: current.placement,
        width: current.pendingWidth,
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
      state.panel.setWidth(state.pendingWidth)
      options.onResize?.({
        placement: state.placement,
        width: state.pendingWidth,
      })
      state.pendingWidth = null
    }

    if (state.handleEl.hasPointerCapture(state.pointerId)) {
      state.handleEl.releasePointerCapture(state.pointerId)
    }

    restoreBodyInteraction(state.handleEl.ownerDocument.body, state.bodyState)

    options.onResizeEnd?.({
      placement: state.placement,
      width: state.currentWidth,
    })

    activeResize.value = null
  }

  function startResize(panel: LayoutPanelApi, event: PointerEvent): void {
    if (activeResize.value || !event.isPrimary || event.button !== 0 || !panel.canResize) {
      return
    }

    const rootEl = options.rootRef.value
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    const asideEl = panel.placement === 'left' ? options.leftAsideRef.value : options.rightAsideRef.value

    if (!rootEl || !handleEl || !asideEl) {
      return
    }

    const oppositePanel = panel.placement === 'left' ? options.right : options.left
    const oppositeAsideEl = panel.placement === 'left' ? options.rightAsideRef.value : options.leftAsideRef.value
    const rootRect = rootEl.getBoundingClientRect()
    const startWidth = asideEl.getBoundingClientRect().width
    const maxWidth = panel.maxWidth
    const minWidth = panel.minWidth
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
      placement: panel.placement,
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
      placement: panel.placement,
      width: startWidth,
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

  useEventListener(keyboardTarget, 'keydown', (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.key !== 'Escape' || !toValue(options.isDrawerVisible)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    options.closeDrawers()
  })

  onBeforeUnmount(() => {
    stopResize()
  })

  return {
    isResizing,
    draggingPlacement,
    leftHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize(options.left, event),
    },
    rightHandleProps: {
      onPointerdown: (event: PointerEvent) => startResize(options.right, event),
    },
  }
}
