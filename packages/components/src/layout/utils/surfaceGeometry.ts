import type {
  LayoutFloatingOptions,
  LayoutFloatingPlacement,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
} from '../index.type'
import type { LayoutFloatingRect } from '../internal.type'
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

export const DEFAULT_FLOATING_WIDTH = 420
export const DEFAULT_FLOATING_HEIGHT = 560
export const DEFAULT_FLOATING_GAP = 0
export const DEFAULT_FLOATING_TOP = DEFAULT_FLOATING_GAP
export const DEFAULT_FLOATING_OFFSET = 24
export const DEFAULT_MIN_FLOATING_WIDTH = 320
export const DEFAULT_MIN_FLOATING_HEIGHT = 240

type FloatingStateInput = LayoutFloatingState & Partial<LayoutFloatingOptions>

type FloatingRectInput = Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'>

type FloatingInput = LayoutFloatingRect | FloatingStateInput | undefined

interface FloatingOffset {
  x: number
  y: number
}

/**
 * 返回浮层 placement，未提供时默认 center。
 * @param source 浮层状态输入。
 * @returns 当前 placement。
 */
function resolveFloatingPlacement(source: Pick<LayoutFloatingState, 'placement'> | undefined): LayoutFloatingPlacement {
  return source?.placement ?? 'center'
}

/**
 * 判断输入是否已经是 rect 形态。
 * @param value 浮层输入。
 * @returns 是否为 rect。
 */
function isFloatingRect(value: FloatingInput): value is LayoutFloatingRect {
  return value !== undefined && 'x' in value && 'y' in value
}

/**
 * 根据 placement 和 offset 计算浮层左上角坐标。
 * @param placement 浮层锚点位置。
 * @param bounds 视口边界。
 * @param width 浮层宽度。
 * @param height 浮层高度。
 * @param offset 锚点偏移量。
 * @returns 浮层左上角坐标。
 */
function getPlacementPosition(
  placement: LayoutFloatingPlacement,
  bounds: FloatingBounds,
  width: number,
  height: number,
  offset: FloatingOffset,
): { x: number; y: number } {
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

/**
 * 从浮层状态读取 offset，未提供时回退默认值。
 * @param source 浮层状态输入。
 * @returns 锚点偏移量。
 */
function resolveFloatingOffset(source: Partial<LayoutFloatingState> | undefined): FloatingOffset {
  return {
    x: source?.offsetX ?? DEFAULT_FLOATING_OFFSET,
    y: source?.offsetY ?? DEFAULT_FLOATING_OFFSET,
  }
}

/**
 * 根据 rect 反推当前 placement 下的 offset。
 * @param rect 浮层 rect。
 * @param bounds 视口边界。
 * @param placement 浮层锚点位置。
 * @returns 锚点偏移量；center 无 offset 时返回 null。
 */
function resolveFloatingOffsetFromRect(
  rect: LayoutFloatingRect,
  bounds: FloatingBounds,
  placement: LayoutFloatingPlacement,
): FloatingOffset | null {
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

/**
 * 根据 rect 中心点推断最近的角落 placement。
 * @param rect 浮层 rect。
 * @param bounds 视口边界。
 * @returns 最近的角落 placement。
 */
function resolveNearestCornerPlacement(rect: LayoutFloatingRect, bounds: FloatingBounds): LayoutFloatingPlacement {
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const viewportCenterX = (bounds.left + bounds.right) / 2
  const viewportCenterY = (bounds.top + bounds.bottom) / 2
  const horizontal = centerX <= viewportCenterX ? 'left' : 'right'
  const vertical = centerY <= viewportCenterY ? 'top' : 'bottom'

  return `${vertical}-${horizontal}` as Exclude<LayoutFloatingPlacement, 'center'>
}

/**
 * 构造一个完整的浮层 rect。
 * @param x 浮层横坐标。
 * @param y 浮层纵坐标。
 * @param width 浮层宽度。
 * @param height 浮层高度。
 * @returns 完整的浮层 rect。
 */
function createFloatingRect(x: number, y: number, width: number, height: number): LayoutFloatingRect {
  return {
    x,
    y,
    width,
    height,
  }
}

/**
 * 根据视口尺寸返回可用边界。
 * @param viewportWidth 视口宽度。
 * @param viewportHeight 视口高度。
 * @param gap 视口左右边距。
 * @param topGap 视口顶部边距。
 * @returns 视口边界。
 */
export function resolveViewportBounds(
  viewportWidth = DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
  viewportHeight = DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
  gap = DEFAULT_FLOATING_GAP,
  topGap = DEFAULT_FLOATING_TOP,
): FloatingBounds {
  return {
    left: gap,
    top: topGap,
    right: Math.max(gap, viewportWidth - gap),
    bottom: Math.max(topGap, viewportHeight - gap),
  }
}

/**
 * @param bounds 视口边界。
 * @param source 浮层尺寸配置。
 * @returns 浮层尺寸约束。
 */
export function resolveFloatingConstraints(
  bounds: FloatingBounds,
  source?: Partial<LayoutFloatingOptions>,
): FloatingConstraints {
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

/**
 * 对 rect 做尺寸和位置裁剪，返回完整 rect。
 * @param rect 浮层 rect 输入。
 * @param bounds 视口边界。
 * @param constraints 浮层尺寸约束。
 * @returns 规范化后的浮层 rect。
 */
export function clampFloatingRect(
  rect: FloatingRectInput,
  bounds: FloatingBounds,
  constraints = resolveFloatingConstraints(bounds),
): LayoutFloatingRect {
  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth)
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight)
  const xMax = Math.max(bounds.left, bounds.right - width)
  const yMax = Math.max(bounds.top, bounds.bottom - height)
  const x = clamp(rect.x, bounds.left, xMax)
  const y = clamp(rect.y, bounds.top, yMax)

  return createFloatingRect(x, y, width, height)
}

/**
 * 根据拖拽的边或角裁剪 rect。
 * @param rect 浮层 rect 输入。
 * @param handle 当前 resize handle。
 * @param bounds 视口边界。
 * @param constraints 浮层尺寸约束。
 * @returns 裁剪后的浮层 rect。
 */
export function clampFloatingRectByHandle(
  rect: FloatingRectInput,
  handle: LayoutFloatingResizeHandle,
  bounds: FloatingBounds,
  constraints = resolveFloatingConstraints(bounds),
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
      const maxWidth = Math.min(constraints.maxWidth, availableWidthFromLeft)
      width = clamp(rect.width, constraints.minWidth, maxWidth)
      x = right - width
    } else {
      width = constraints.minWidth
      x = bounds.left
    }
  } else if (handle.includes('e')) {
    const maxWidth = Math.min(constraints.maxWidth, Math.max(constraints.minWidth, bounds.right - rect.x))
    width = clamp(rect.width, constraints.minWidth, maxWidth)
    x = rect.x
  }

  if (handle.includes('n')) {
    if (availableHeightFromTop >= constraints.minHeight) {
      const maxHeight = Math.min(constraints.maxHeight, availableHeightFromTop)
      height = clamp(rect.height, constraints.minHeight, maxHeight)
      y = bottom - height
    } else {
      height = constraints.minHeight
      y = bounds.top
    }
  } else if (handle.includes('s')) {
    const maxHeight = Math.min(constraints.maxHeight, Math.max(constraints.minHeight, bounds.bottom - rect.y))
    height = clamp(rect.height, constraints.minHeight, maxHeight)
    y = rect.y
  }

  const nextRect: FloatingRectInput = {
    ...rect,
    x,
    y,
    width,
    height,
  }

  return clampFloatingRect(nextRect, bounds, constraints)
}

/**
 * 根据 floatingState 和 floatingOptions 生成初始 rect。
 * @param bounds 视口边界。
 * @param source 浮层状态和配置输入。
 * @returns 初始浮层 rect。
 */
export function createFloatingRectFromState(bounds: FloatingBounds, source?: FloatingStateInput): LayoutFloatingRect {
  const constraints = resolveFloatingConstraints(bounds, source)
  const width = clamp(source?.width ?? DEFAULT_FLOATING_WIDTH, constraints.minWidth, constraints.maxWidth)
  const height = clamp(source?.height ?? DEFAULT_FLOATING_HEIGHT, constraints.minHeight, constraints.maxHeight)
  const placement = resolveFloatingPlacement(source)
  const offset = resolveFloatingOffset(source)
  const position = getPlacementPosition(placement, bounds, width, height, offset)

  return createFloatingRect(position.x, position.y, width, height)
}

/**
 * 把输入态的 floatingState 或 rect 统一整理成几何计算使用的 rect。
 * @param input 浮层输入。
 * @param bounds 视口边界。
 * @returns 规范化后的浮层 rect。
 */
export function resolveFloatingRect(input: FloatingInput, bounds: FloatingBounds): LayoutFloatingRect {
  if (!input) {
    return createFloatingRectFromState(bounds)
  }

  if (isFloatingRect(input)) {
    return clampFloatingRect(input, bounds)
  }

  return createFloatingRectFromState(bounds, input)
}

/**
 * 根据 rect 反推出对外的 floatingState。
 * @param rect 浮层 rect。
 * @param bounds 视口边界。
 * @param source 浮层状态来源。
 * @param normalizeCenter 是否把 center 转为最近角落。
 * @returns 对外 floatingState。
 */
export function resolveFloatingStateFromRect(
  rect: LayoutFloatingRect,
  bounds: FloatingBounds,
  source?: Partial<FloatingStateInput>,
  normalizeCenter = true,
): LayoutFloatingState {
  const constraints = resolveFloatingConstraints(bounds, source)
  const normalizedRect = clampFloatingRect(rect, bounds, constraints)
  const sourcePlacement = source?.placement ?? 'center'
  const shouldNormalizeCenter = normalizeCenter && sourcePlacement === 'center'
  const placement = shouldNormalizeCenter ? resolveNearestCornerPlacement(normalizedRect, bounds) : sourcePlacement
  const offset = resolveFloatingOffsetFromRect(normalizedRect, bounds, placement)
  const fallbackOffset = resolveFloatingOffset(source)

  return {
    placement,
    offsetX: offset?.x ?? fallbackOffset.x,
    offsetY: offset?.y ?? fallbackOffset.y,
    width: normalizedRect.width,
    height: normalizedRect.height,
  }
}

/**
 * 比较两个 rect 的几何信息是否一致。
 * @param left 左侧 rect。
 * @param right 右侧 rect。
 * @returns 两者几何信息是否一致。
 */
export function areFloatingGeometryEqual(
  left: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
  right: Pick<LayoutFloatingRect, 'x' | 'y' | 'width' | 'height'> | undefined,
): boolean {
  return left?.x === right?.x && left?.y === right?.y && left?.width === right?.width && left?.height === right?.height
}
