import { tryOnScopeDispose, useEventListener, type MaybeRefOrGetter } from '@vueuse/core'
import { computed, shallowRef, toValue } from 'vue'
import type { ComputedRef } from 'vue'

export type PointerDragEndReason = 'pointerup' | 'pointercancel' | 'manual' | 'scope-dispose'

export interface PointerDragEndDetail {
  reason: PointerDragEndReason
  event?: PointerEvent
}

export interface UsePointerDragOptions<T> {
  disabled?: MaybeRefOrGetter<boolean>
  buttons?: MaybeRefOrGetter<readonly number[]>
  onStart: (event: PointerEvent) => T | false | null | undefined
  onMove?: (context: T, event: PointerEvent) => void
  onEnd?: (context: T, detail: PointerDragEndDetail) => void
}

export interface UsePointerDragReturn {
  isDragging: ComputedRef<boolean>
  cancel: () => void
}

const DEFAULT_POINTER_BUTTONS = [0]

export function usePointerDrag<T>(
  handle: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UsePointerDragOptions<T>,
): UsePointerDragReturn {
  const dragContext = shallowRef<T | null>(null)
  const activePointerId = shallowRef<number | null>(null)
  const captureTarget = shallowRef<HTMLElement | null>(null)
  const listenerTarget = shallowRef<Window | null>(null)

  function startDrag(event: PointerEvent): void {
    const buttons = toValue(options.buttons) ?? DEFAULT_POINTER_BUTTONS
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (
      !handleEl ||
      dragContext.value ||
      toValue(options.disabled) ||
      !event.isPrimary ||
      !buttons.includes(event.button)
    ) {
      return
    }

    const context = options.onStart(event)

    if (!context) {
      return
    }

    dragContext.value = context
    activePointerId.value = event.pointerId
    captureTarget.value = handleEl
    listenerTarget.value = handleEl.ownerDocument.defaultView

    try {
      handleEl.setPointerCapture(event.pointerId)
    } catch {
      finishDrag('manual')
    }
  }

  function moveDrag(event: PointerEvent): void {
    const context = dragContext.value

    if (!context || event.pointerId !== activePointerId.value) {
      return
    }

    options.onMove?.(context, event)
  }

  function finishDrag(reason: PointerDragEndReason, event?: PointerEvent): void {
    const context = dragContext.value

    if (!context || (event && event.pointerId !== activePointerId.value)) {
      return
    }

    const pointerId = activePointerId.value
    const target = captureTarget.value

    dragContext.value = null
    activePointerId.value = null
    captureTarget.value = null
    listenerTarget.value = null

    if (target && pointerId !== null && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId)
    }

    options.onEnd?.(context, { reason, event })
  }

  useEventListener(handle, 'pointerdown', startDrag)

  useEventListener(listenerTarget, 'pointermove', moveDrag)

  useEventListener(listenerTarget, 'pointerup', (event: PointerEvent) => {
    finishDrag('pointerup', event)
  })

  useEventListener(listenerTarget, 'pointercancel', (event: PointerEvent) => {
    finishDrag('pointercancel', event)
  })

  tryOnScopeDispose(() => {
    finishDrag('scope-dispose')
  })

  return {
    isDragging: computed(() => dragContext.value !== null),
    cancel: () => finishDrag('manual'),
  }
}
