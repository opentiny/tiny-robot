import type { ComputedRef } from 'vue'
import type { LayoutAsideCollapseEffect, LayoutFloatingOptions, LayoutFloatingState, LayoutMode } from './index.type'

export type LayoutResolvedFloating = LayoutFloatingState & LayoutFloatingOptions

export type LayoutFloatingRect = Omit<
  LayoutResolvedFloating,
  'placement' | 'offsetX' | 'offsetY' | 'width' | 'height'
> & {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutFloatingDragPosition {
  x: number
  y: number
}

export interface LayoutPanel {
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
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutFloatingStateContext {
  mode: ComputedRef<LayoutMode>
  value: ComputedRef<LayoutFloatingState | undefined>
  resolved: ComputedRef<LayoutResolvedFloating | undefined>
}

export interface LayoutFloatingActions {
  initialize: (nextFloating: LayoutFloatingState) => void
  commit: (nextFloating: LayoutFloatingState) => void
}

export interface LayoutFloatingContext {
  state: LayoutFloatingStateContext
  actions: LayoutFloatingActions
}

export interface LayoutAsideToggleContext {
  isOpen: ComputedRef<boolean>
  toggle: () => void
}

export interface LayoutContext {
  left: LayoutAsideToggleContext
  right: LayoutAsideToggleContext
}

export interface LayoutState {
  leftPanel: LayoutPanel
  rightPanel: LayoutPanel
  floating: LayoutFloatingContext
}
