import type { LayoutAsideOpenDetail, LayoutAsideResizeDetail, LayoutEmits } from '../index.type'

type LayoutEmit = <K extends keyof LayoutEmits>(event: K, ...args: LayoutEmits[K]) => void

export type LayoutAsideResizePhase = 'start' | 'resize' | 'end'

const OPEN_CHANGE_EVENT_BY_SIDE = {
  left: 'left-aside-open-change',
  right: 'right-aside-open-change',
} as const

const RESIZE_EVENTS_BY_PHASE = {
  start: {
    generic: 'aside-resize-start',
    left: 'left-aside-resize-start',
    right: 'right-aside-resize-start',
  },
  resize: {
    generic: 'aside-resize',
    left: 'left-aside-resize',
    right: 'right-aside-resize',
  },
  end: {
    generic: 'aside-resize-end',
    left: 'left-aside-resize-end',
    right: 'right-aside-resize-end',
  },
} as const

export function emitAsideOpenChangeEvents(emit: LayoutEmit, detail: LayoutAsideOpenDetail): void {
  emit('aside-open-change', detail)
  emit(OPEN_CHANGE_EVENT_BY_SIDE[detail.side], {
    open: detail.open,
  })
}

export function emitAsideResizeEvents(
  emit: LayoutEmit,
  phase: LayoutAsideResizePhase,
  detail: LayoutAsideResizeDetail,
): void {
  const events = RESIZE_EVENTS_BY_PHASE[phase]

  emit(events.generic, detail)
  emit(events[detail.side], {
    expandedWidth: detail.expandedWidth,
  })
}
