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

export interface LayoutAsideState {
  side: LayoutSide
  isOpen: ComputedRef<boolean>
  expandedWidth: ComputedRef<number>
  collapsedWidth: ComputedRef<number>
  collapseEffect: ComputedRef<LayoutAsideCollapseEffect>
  minExpandedWidth: ComputedRef<number>
  maxExpandedWidth: ComputedRef<number>
  isDock: ComputedRef<boolean>
  isDrawer: ComputedRef<boolean>
  isRail: ComputedRef<boolean>
  isHidden: ComputedRef<boolean>
  canResize: ComputedRef<boolean>
  setOpen: (nextOpen: boolean) => void
  setExpandedWidth: (nextWidth: number) => void
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
