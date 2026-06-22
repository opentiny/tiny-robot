import { tryOnScopeDispose, useEventListener } from '@vueuse/core'
import { shallowRef } from 'vue'
import type { Ref } from 'vue'

export interface PointerDragSession {
  pointerId: number
}

export type PointerDragSessionFactory<T extends PointerDragSession> = (
  event: PointerEvent,
) => T | false | null | undefined

export interface UsePointerDragSessionOptions<T extends PointerDragSession> {
  onMove?: (session: T, event: PointerEvent) => void
  onStop?: (session: T, event?: PointerEvent) => void
}

export interface UsePointerDragSessionReturn<T extends PointerDragSession> {
  activeSession: Ref<T | null>
  startSession: (event: PointerEvent, createSession: PointerDragSessionFactory<T>) => T | null
  stopSession: (pointerId?: number, event?: PointerEvent) => void
}

export function usePointerDragSession<T extends PointerDragSession>(
  options: UsePointerDragSessionOptions<T>,
): UsePointerDragSessionReturn<T> {
  const activeSession = shallowRef(null) as Ref<T | null>
  const pointerTarget = typeof window === 'undefined' ? undefined : window

  function startSession(event: PointerEvent, createSession: PointerDragSessionFactory<T>): T | null {
    if (activeSession.value || !event.isPrimary || event.button !== 0) {
      return null
    }

    const session = createSession(event)

    if (!session) {
      return null
    }

    activeSession.value = session

    return session
  }

  function stopSession(pointerId?: number, event?: PointerEvent): void {
    const session = activeSession.value

    if (!session || (pointerId !== undefined && session.pointerId !== pointerId)) {
      return
    }

    try {
      options.onStop?.(session, event)
    } finally {
      activeSession.value = null
    }
  }

  useEventListener(pointerTarget, 'pointermove', (event: PointerEvent) => {
    const session = activeSession.value

    if (!session || event.pointerId !== session.pointerId) {
      return
    }

    options.onMove?.(session, event)
  })

  useEventListener(pointerTarget, 'pointerup', (event: PointerEvent) => {
    stopSession(event.pointerId, event)
  })

  useEventListener(pointerTarget, 'pointercancel', (event: PointerEvent) => {
    stopSession(event.pointerId, event)
  })

  tryOnScopeDispose(() => {
    stopSession()
  })

  return {
    activeSession,
    startSession,
    stopSession,
  }
}
