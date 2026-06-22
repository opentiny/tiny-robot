import type { LayoutFloatingPlacement, LayoutFloatingResizeHandle, LayoutFloatingState } from '../index.type'
import type { LayoutFloatingRect, LayoutResolvedFloating } from '../internal.type'
import { clamp } from './number'

export interface FloatingBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface FloatingConstraints {
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

export interface FloatingSnapshot {
  placement: LayoutFloatingPlacement
  rect: LayoutFloatingRect
  bounds: FloatingBounds
  constraints: FloatingConstraints
  xMax: number
  yMax: number
}

export const DEFAULT_FLOATING_WIDTH = 420
export const DEFAULT_FLOATING_HEIGHT = 560
export const DEFAULT_FLOATING_GAP = 0
export const DEFAULT_FLOATING_TOP = DEFAULT_FLOATING_GAP
export const DEFAULT_FLOATING_OFFSET = 24
export const DEFAULT_MIN_FLOATING_WIDTH = 320
export const DEFAULT_MIN_FLOATING_HEIGHT = 240

type FloatingRectLike = Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> &
  Partial<Omit<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'>>
type FloatingConfig = LayoutFloatingState &
  Partial<Pick<LayoutResolvedFloating, 'draggable' | 'resizable' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'>>

interface ViewportSize {
  width: number
  height: number
}

interface ResolvedFloatingOffset {
  x: number
  y: number
}

function resolveFloatingPlacement(config: Pick<LayoutFloatingState, 'placement'> | undefined): LayoutFloatingPlacement {
  return config?.placement ?? 'center'
}

function isFloatingRect(value: LayoutFloatingRect | FloatingConfig): value is LayoutFloatingRect {
  return value !== undefined && 'x' in value && 'y' in value
}

function resolveViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
      height: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
    }
  }

  const viewport = window.visualViewport

  if (viewport) {
    return {
      width: viewport.width,
      height: viewport.height,
    }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function getPlacementPosition(
  placement: LayoutFloatingPlacement,
  bounds: FloatingBounds,
  width: number,
  height: number,
  offset: ResolvedFloatingOffset,
) {
  switch (placement) {
    case 'top-left':
      return {
        x: bounds.left + offset.x,
        y: bounds.top + offset.y,
      }
    case 'top-right':
      return {
        x: bounds.right - width - offset.x,
        y: bounds.top + offset.y,
      }
    case 'bottom-left':
      return {
        x: bounds.left + offset.x,
        y: bounds.bottom - height - offset.y,
      }
    case 'bottom-right':
      return {
        x: bounds.right - width - offset.x,
        y: bounds.bottom - height - offset.y,
      }
    case 'center':
    default:
      return {
        x: (bounds.left + bounds.right - width) / 2,
        y: (bounds.top + bounds.bottom - height) / 2,
      }
  }
}

function resolveFloatingOffset(config: LayoutFloatingState | undefined): ResolvedFloatingOffset {
  return {
    x: config?.offsetX ?? DEFAULT_FLOATING_OFFSET,
    y: config?.offsetY ?? DEFAULT_FLOATING_OFFSET,
  }
}

function resolveFloatingOffsetFromRect(
  rect: LayoutFloatingRect,
  bounds: FloatingBounds,
  placement: LayoutFloatingPlacement,
): ResolvedFloatingOffset | null {
  switch (placement) {
    case 'top-left':
      return {
        x: rect.x - bounds.left,
        y: rect.y - bounds.top,
      }
    case 'top-right':
      return {
        x: bounds.right - rect.width - rect.x,
        y: rect.y - bounds.top,
      }
    case 'bottom-left':
      return {
        x: rect.x - bounds.left,
        y: bounds.bottom - rect.height - rect.y,
      }
    case 'bottom-right':
      return {
        x: bounds.right - rect.width - rect.x,
        y: bounds.bottom - rect.height - rect.y,
      }
    case 'center':
    default:
      return null
  }
}

function resolveNearestCornerPlacement(rect: LayoutFloatingRect, bounds: FloatingBounds): LayoutFloatingPlacement {
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const viewportCenterX = (bounds.left + bounds.right) / 2
  const viewportCenterY = (bounds.top + bounds.bottom) / 2
  const horizontal = centerX <= viewportCenterX ? 'left' : 'right'
  const vertical = centerY <= viewportCenterY ? 'top' : 'bottom'

  return `${vertical}-${horizontal}` as Exclude<LayoutFloatingPlacement, 'center'>
}

export function resolveViewportBounds(gap = DEFAULT_FLOATING_GAP, topGap = DEFAULT_FLOATING_TOP): FloatingBounds {
  const viewport = resolveViewportSize()

  return {
    left: gap,
    top: topGap,
    right: Math.max(gap, viewport.width - gap),
    bottom: Math.max(topGap, viewport.height - gap),
  }
}

export function resolveFloatingConstraints(source?: Partial<LayoutFloatingRect | FloatingConfig>): FloatingConstraints {
  const bounds = resolveViewportBounds()
  const maxWidth = Math.max(1, bounds.right - bounds.left)
  const maxHeight = Math.max(1, bounds.bottom - bounds.top)
  const minWidth = clamp(source?.minWidth ?? DEFAULT_MIN_FLOATING_WIDTH, 1, maxWidth)
  const minHeight = clamp(source?.minHeight ?? DEFAULT_MIN_FLOATING_HEIGHT, 1, maxHeight)

  return {
    minWidth,
    maxWidth: clamp(source?.maxWidth ?? maxWidth, minWidth, maxWidth),
    minHeight,
    maxHeight: clamp(source?.maxHeight ?? maxHeight, minHeight, maxHeight),
  }
}

export function clampFloatingRect(
  rect: FloatingRectLike,
  constraints = resolveFloatingConstraints(rect),
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth)
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight)
  const xMax = Math.max(bounds.left, bounds.right - width)
  const yMax = Math.max(bounds.top, bounds.bottom - height)

  return {
    x: clamp(rect.x, bounds.left, xMax),
    y: clamp(rect.y, bounds.top, yMax),
    width,
    height,
    draggable: rect.draggable ?? true,
    resizable: rect.resizable ?? false,
    minWidth: constraints.minWidth,
    maxWidth: constraints.maxWidth,
    minHeight: constraints.minHeight,
    maxHeight: constraints.maxHeight,
  }
}

export function clampFloatingRectByHandle(
  rect: FloatingRectLike,
  handle: LayoutFloatingResizeHandle,
  constraints = resolveFloatingConstraints(rect),
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height
  const availableWidthFromLeft = right - bounds.left
  const availableHeightFromTop = bottom - bounds.top

  let width = rect.width
  let height = rect.height
  let x = rect.x
  let y = rect.y

  if (handle.includes('w')) {
    if (availableWidthFromLeft >= constraints.minWidth) {
      width = clamp(rect.width, constraints.minWidth, Math.min(constraints.maxWidth, availableWidthFromLeft))
      x = right - width
    } else {
      width = constraints.minWidth
      x = bounds.left
    }
  } else if (handle.includes('e')) {
    width = clamp(
      rect.width,
      constraints.minWidth,
      Math.min(constraints.maxWidth, Math.max(constraints.minWidth, bounds.right - rect.x)),
    )
    x = rect.x
  }

  if (handle.includes('n')) {
    if (availableHeightFromTop >= constraints.minHeight) {
      height = clamp(rect.height, constraints.minHeight, Math.min(constraints.maxHeight, availableHeightFromTop))
      y = bottom - height
    } else {
      height = constraints.minHeight
      y = bounds.top
    }
  } else if (handle.includes('s')) {
    height = clamp(
      rect.height,
      constraints.minHeight,
      Math.min(constraints.maxHeight, Math.max(constraints.minHeight, bounds.bottom - rect.y)),
    )
    y = rect.y
  }

  return clampFloatingRect(
    {
      ...rect,
      x,
      y,
      width,
      height,
    },
    constraints,
    bounds,
  )
}

export function resolveDefaultFloatingRect(
  config?: FloatingConfig,
  bounds = resolveViewportBounds(),
): LayoutFloatingRect {
  const constraints = resolveFloatingConstraints(config)
  const width = clamp(config?.width ?? DEFAULT_FLOATING_WIDTH, constraints.minWidth, constraints.maxWidth)
  const height = clamp(config?.height ?? DEFAULT_FLOATING_HEIGHT, constraints.minHeight, constraints.maxHeight)
  const placement = resolveFloatingPlacement(config)
  const offset = resolveFloatingOffset(config)
  const position = getPlacementPosition(placement, bounds, width, height, offset)

  return clampFloatingRect(
    {
      x: position.x,
      y: position.y,
      width,
      height,
      draggable: config?.draggable ?? true,
      resizable: config?.resizable ?? false,
      minWidth: config?.minWidth,
      maxWidth: config?.maxWidth,
      minHeight: config?.minHeight,
      maxHeight: config?.maxHeight,
    },
    constraints,
    bounds,
  )
}

export function normalizeFloatingRect(rectLike: LayoutFloatingRect | FloatingConfig | undefined): LayoutFloatingRect {
  if (!rectLike) {
    return resolveDefaultFloatingRect()
  }

  if (isFloatingRect(rectLike)) {
    return clampFloatingRect(
      {
        x: rectLike.x,
        y: rectLike.y,
        width: rectLike.width,
        height: rectLike.height,
        draggable: rectLike.draggable,
        resizable: rectLike.resizable,
        minWidth: rectLike.minWidth,
        maxWidth: rectLike.maxWidth,
        minHeight: rectLike.minHeight,
        maxHeight: rectLike.maxHeight,
      },
      resolveFloatingConstraints(rectLike),
    )
  }

  return resolveDefaultFloatingRect(rectLike)
}

export function resolveFloatingSnapshot(
  config: LayoutFloatingRect | FloatingConfig | undefined,
  source?: Pick<LayoutFloatingState, 'placement'>,
): FloatingSnapshot {
  const bounds = resolveViewportBounds()
  const rect = normalizeFloatingRect(config)
  const constraints = resolveFloatingConstraints(rect)
  const normalizedRect = clampFloatingRect(rect, constraints, bounds)

  return {
    placement: config && isFloatingRect(config) ? resolveFloatingPlacement(source) : resolveFloatingPlacement(config),
    rect: normalizedRect,
    bounds,
    constraints,
    xMax: Math.max(bounds.left, bounds.right - normalizedRect.width),
    yMax: Math.max(bounds.top, bounds.bottom - normalizedRect.height),
  }
}

export function toCommittedFloatingState(
  snapshot: FloatingSnapshot,
  source?: Partial<LayoutFloatingState>,
  options?: { normalizeCenter?: boolean },
): LayoutFloatingState {
  const sourcePlacement = source?.placement ?? snapshot.placement
  const placement =
    options?.normalizeCenter && sourcePlacement === 'center'
      ? resolveNearestCornerPlacement(snapshot.rect, snapshot.bounds)
      : sourcePlacement
  const offset = resolveFloatingOffsetFromRect(snapshot.rect, snapshot.bounds, placement)

  return {
    placement,
    ...(offset ? { offsetX: offset.x, offsetY: offset.y } : {}),
    width: snapshot.rect.width,
    height: snapshot.rect.height,
  }
}

export function areFloatingGeometryEqual(
  left: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
  right: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
