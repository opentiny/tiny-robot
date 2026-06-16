import type { LayoutAsideOpenEventDetail, LayoutAsideResizeEventDetail, LayoutEmits } from '../index.type'

export type LayoutEmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

export function emitAsideOpenChange(emit: LayoutEmitFn, detail: LayoutAsideOpenEventDetail): void {
  emit('aside-open-change', detail)

  if (detail.placement === 'left') {
    emit('left-aside-open-change', { open: detail.open })
    return
  }

  emit('right-aside-open-change', { open: detail.open })
}

export function emitAsideResizeEvent(
  emit: LayoutEmitFn,
  phase: 'start' | 'progress' | 'end',
  detail: LayoutAsideResizeEventDetail,
): void {
  if (phase === 'start') {
    emit('aside-resize-start', detail)

    if (detail.placement === 'left') {
      emit('left-aside-resize-start', { expandedWidth: detail.expandedWidth })
      return
    }

    emit('right-aside-resize-start', { expandedWidth: detail.expandedWidth })
    return
  }

  if (phase === 'end') {
    emit('aside-resize-end', detail)

    if (detail.placement === 'left') {
      emit('left-aside-resize-end', { expandedWidth: detail.expandedWidth })
      return
    }

    emit('right-aside-resize-end', { expandedWidth: detail.expandedWidth })
    return
  }

  emit('aside-resize', detail)

  if (detail.placement === 'left') {
    emit('left-aside-resize', { expandedWidth: detail.expandedWidth })
    return
  }

  emit('right-aside-resize', { expandedWidth: detail.expandedWidth })
}
