import type { LayoutFloatingResizeHandle } from '../index.type'
import type { LayoutFloatingRect } from '../internal.type'

interface ResolveFloatingResizeRectOptions {
  handle: LayoutFloatingResizeHandle
  deltaX: number
  deltaY: number
  startRect: LayoutFloatingRect
}

function applyNorth(rect: LayoutFloatingRect, deltaY: number): LayoutFloatingRect {
  return {
    ...rect,
    y: rect.y + deltaY,
    height: rect.height - deltaY,
  }
}

function applySouth(rect: LayoutFloatingRect, deltaY: number): LayoutFloatingRect {
  return {
    ...rect,
    height: rect.height + deltaY,
  }
}

function applyEast(rect: LayoutFloatingRect, deltaX: number): LayoutFloatingRect {
  return {
    ...rect,
    width: rect.width + deltaX,
  }
}

function applyWest(rect: LayoutFloatingRect, deltaX: number): LayoutFloatingRect {
  return {
    ...rect,
    x: rect.x + deltaX,
    width: rect.width - deltaX,
  }
}

export function resolveFloatingResizeRect(options: ResolveFloatingResizeRectOptions): LayoutFloatingRect {
  let nextRect = { ...options.startRect }

  if (options.handle.includes('n')) {
    nextRect = applyNorth(nextRect, options.deltaY)
  }

  if (options.handle.includes('s')) {
    nextRect = applySouth(nextRect, options.deltaY)
  }

  if (options.handle.includes('e')) {
    nextRect = applyEast(nextRect, options.deltaX)
  }

  if (options.handle.includes('w')) {
    nextRect = applyWest(nextRect, options.deltaX)
  }

  return nextRect
}
