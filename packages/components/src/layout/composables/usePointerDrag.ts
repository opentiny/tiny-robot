import { tryOnScopeDispose, useEventListener, type MaybeRefOrGetter } from '@vueuse/core'
import { computed, shallowRef, toValue } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'

export interface PointerDragState {
  pointerId: number
}

export interface UsePointerDragOptions<T extends PointerDragState> {
  disabled?: MaybeRefOrGetter<boolean>
  buttons?: MaybeRefOrGetter<number[]>
  onStart: (event: PointerEvent) => T | false | null | undefined
  onMove?: (state: T, event: PointerEvent) => void
  onEnd?: (state: T, event?: PointerEvent) => void
}

export interface UsePointerDragReturn<T extends PointerDragState> {
  dragState: ShallowRef<T | null>
  isDragging: ComputedRef<boolean>
  endDrag: (pointerId?: number, event?: PointerEvent) => void
}

const DEFAULT_POINTER_BUTTONS = [0]

export function usePointerDrag<T extends PointerDragState>(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UsePointerDragOptions<T>,
): UsePointerDragReturn<T> {
  const dragState = shallowRef(null) as ShallowRef<T | null>

  function startDrag(event: PointerEvent): void {
    const buttons = toValue(options.buttons) ?? DEFAULT_POINTER_BUTTONS

    if (dragState.value || toValue(options.disabled) || !event.isPrimary || !buttons.includes(event.button)) {
      return
    }

    const state = options.onStart(event)

    if (!state) {
      return
    }

    dragState.value = state
  }

  function moveDrag(event: PointerEvent): void {
    const state = dragState.value

    if (!state || event.pointerId !== state.pointerId) {
      return
    }

    options.onMove?.(state, event)
  }

  function endDrag(pointerId?: number, event?: PointerEvent): void {
    const state = dragState.value

    if (!state || (pointerId !== undefined && state.pointerId !== pointerId)) {
      return
    }

    try {
      options.onEnd?.(state, event)
    } finally {
      dragState.value = null
    }
  }

  useEventListener(target, 'pointerdown', startDrag)

  useEventListener('pointermove', moveDrag)

  useEventListener(['pointerup', 'pointercancel'], (event: PointerEvent) => {
    endDrag(event.pointerId, event)
  })

  tryOnScopeDispose(() => {
    endDrag()
  })

  return {
    dragState,
    isDragging: computed(() => dragState.value !== null),
    endDrag,
  }
}
