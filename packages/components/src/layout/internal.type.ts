import type { ComputedRef, Ref } from 'vue'
import type { LayoutAsideCollapseEffect, LayoutFloatingOptions, LayoutFloatingState, LayoutSide } from './index.type'

export type LayoutResolvedFloating = LayoutFloatingState & LayoutFloatingOptions

export interface LayoutFloatingRect {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutFloatingDragPosition {
  x: number
  y: number
}

export interface LayoutAsidePanel {
  side: LayoutSide
  isOpen: ComputedRef<boolean>
  width: ComputedRef<number>
  collapsedWidth: ComputedRef<number>
  collapseEffect: ComputedRef<LayoutAsideCollapseEffect>
  minWidth: ComputedRef<number>
  maxWidth: ComputedRef<number>
  isDock: ComputedRef<boolean>
  isDrawer: ComputedRef<boolean>
  isRail: ComputedRef<boolean>
  isHidden: ComputedRef<boolean>
  canResize: ComputedRef<boolean>
  // 不建议把函数用作 props 传入
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutAsideToggleContext {
  isOpen: ComputedRef<boolean>
  toggle: () => void
}

export interface LayoutContext {
  rootEl: Ref<HTMLElement | null>
  left: LayoutAsideToggleContext
  right: LayoutAsideToggleContext
}
