import type { LayoutAsideOpenDetail, LayoutAsideResizeDetail, LayoutEmits } from '../index.type'

export type LayoutEmitFn = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

function emitSideOpenChange(emit: LayoutEmitFn, detail: LayoutAsideOpenDetail): void {
  if (detail.side === 'left') {
    emit('left-aside-open-change', { open: detail.open })
    return
  }

  emit('right-aside-open-change', { open: detail.open })
}

export function emitAsideOpenChange(emit: LayoutEmitFn, detail: LayoutAsideOpenDetail): void {
  emit('aside-open-change', detail)
  emitSideOpenChange(emit, detail)
}

function emitSideResizeEvent(
  emit: LayoutEmitFn,
  phase: 'start' | 'progress' | 'end',
  detail: LayoutAsideResizeDetail,
): void {
  if (detail.side === 'left') {
    if (phase === 'start') {
      emit('left-aside-resize-start', { expandedWidth: detail.expandedWidth })
      return
    }

    if (phase === 'end') {
      emit('left-aside-resize-end', { expandedWidth: detail.expandedWidth })
      return
    }

    emit('left-aside-resize', { expandedWidth: detail.expandedWidth })
    return
  }

  if (phase === 'start') {
    emit('right-aside-resize-start', { expandedWidth: detail.expandedWidth })
    return
  }

  if (phase === 'end') {
    emit('right-aside-resize-end', { expandedWidth: detail.expandedWidth })
    return
  }

  emit('right-aside-resize', { expandedWidth: detail.expandedWidth })
}

export function emitAsideResizeEvent(
  emit: LayoutEmitFn,
  phase: 'start' | 'progress' | 'end',
  detail: LayoutAsideResizeDetail,
): void {
  if (phase === 'start') {
    emit('aside-resize-start', detail)
  } else if (phase === 'end') {
    emit('aside-resize-end', detail)
  } else {
    emit('aside-resize', detail)
  }

  emitSideResizeEvent(emit, phase, detail)
}
