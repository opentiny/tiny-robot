import { MaybeComputedElementRef, unrefElement, watchThrottled } from '@vueuse/core'
import { onUnmounted, ref, watch } from 'vue'
import { useGlobalPointer } from '../../shared/utils'

type Point = { x: number; y: number }
type Polygon = Point[]

const isPointInRect = (point: Point, rect: DOMRect) => {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
}

/**
 * 判断点是否在多边形内
 * @param point 点
 * @param polygon 多边形
 * @param includeBoundary 是否包含边界
 * @returns 是否在多边形内
 */
const isPointInPolygon = (point: Point, polygon: Polygon, includeBoundary = false): boolean => {
  if (polygon.length < 3) return false

  const px = point.x
  const py = point.y
  let inside = false

  // 边界检查辅助函数
  const isOnEdge = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)
    if (Math.abs(cross) > 1e-10) return false // 容差判断是否共线

    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    // 判断点是否在线段的包围盒内
    return px >= minX && px <= maxX && py >= minY && py <= maxY
  }

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    // 首先检查点是否在多边形的任何一条边上
    if (includeBoundary && isOnEdge(px, py, xi, yi, xj, yj)) {
      return true
    }

    // 射线法核心逻辑
    const intersects = (yi > py && yj <= py) || (yj > py && yi <= py)
    if (intersects) {
      const intersectX = ((xj - xi) * (py - yi)) / (yj - yi) + xi
      if (px < intersectX) {
        inside = !inside
      }
    }
  }

  return inside
}

const calcHoverPolygon = (triggerRect: DOMRect, popperRect: DOMRect): Polygon => {
  // popper 在 trigger 的上方
  if (popperRect.bottom < triggerRect.top) {
    return [
      { x: triggerRect.left, y: triggerRect.top },
      { x: triggerRect.right, y: triggerRect.top },
      { x: popperRect.right, y: popperRect.bottom },
      { x: popperRect.left, y: popperRect.bottom },
    ]
  }

  // popper 在 trigger 的下方
  if (popperRect.top > triggerRect.bottom) {
    return [
      { x: triggerRect.left, y: triggerRect.bottom },
      { x: triggerRect.right, y: triggerRect.bottom },
      { x: popperRect.right, y: popperRect.top },
      { x: popperRect.left, y: popperRect.top },
    ]
  }

  return []
}

const { x: pointerX, y: pointerY } = useGlobalPointer()

export interface UsePopperHoverOptions {
  delayEnter?: number
  delayLeave?: number
}

export const usePopperHover = (
  triggerRef: MaybeComputedElementRef,
  popperRef: MaybeComputedElementRef,
  options?: UsePopperHoverOptions,
) => {
  const { delayEnter = 0, delayLeave = 0 } = options || {}

  const isHovering = ref(false)
  const hoveringArea = ref<'trigger' | 'popper' | 'polygon' | 'outside'>('outside')

  let timer: ReturnType<typeof setTimeout> | null = null

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(() => {
    clearTimer()
  })

  const toggle = (entering: boolean) => {
    const delay = entering ? delayEnter : delayLeave
    clearTimer()

    if (delay) {
      timer = setTimeout(() => (isHovering.value = entering), delay)
    } else {
      isHovering.value = entering
    }
  }

  watch(
    hoveringArea,
    (area) => {
      if (['trigger', 'popper', 'polygon'].includes(area)) {
        toggle(true)
      } else {
        toggle(false)
      }
    },
    { immediate: true },
  )

  watchThrottled(
    [pointerX, pointerY],
    ([x, y]) => {
      const trigger = unrefElement(triggerRef)
      const popper = unrefElement(popperRef)

      const triggerRect = trigger?.getBoundingClientRect()
      const popperRect = popper?.getBoundingClientRect()

      if (triggerRect && isPointInRect({ x, y }, triggerRect)) {
        hoveringArea.value = 'trigger'
        return
      }

      if (popperRect && isPointInRect({ x, y }, popperRect)) {
        hoveringArea.value = 'popper'
        return
      }

      if (
        !triggerRect ||
        !popperRect ||
        triggerRect.width === 0 ||
        triggerRect.height === 0 ||
        popperRect.width === 0 ||
        popperRect.height === 0
      ) {
        hoveringArea.value = 'outside'
        return
      }

      const inPolygon = isPointInPolygon({ x, y }, calcHoverPolygon(triggerRect, popperRect), true)
      if (inPolygon) {
        hoveringArea.value = 'polygon'
      } else {
        hoveringArea.value = 'outside'
      }
    },
    { throttle: 10 },
  )

  return isHovering
}
