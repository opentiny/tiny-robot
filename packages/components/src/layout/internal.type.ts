import type { ComponentPublicInstance, ComputedRef, ShallowRef } from 'vue'
import type {
  LayoutAsideCollapseEffect,
  LayoutAsideMode,
  LayoutFloatingOptions,
  LayoutFloatingState,
  LayoutMode,
  LayoutPlacement,
  LayoutProps,
} from './index.type'

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

export type LayoutRuntimeProps = LayoutProps

export type LayoutScrollTargetComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutScrollTarget = HTMLElement | LayoutScrollTargetComponent | null | undefined

export interface LayoutAsideToggleProps {
  placement: LayoutPlacement
}

export interface LayoutProxyScrollbarProps {
  scrollTarget?: LayoutScrollTarget
}

export interface LayoutPanelState {
  placement: LayoutPlacement
  layoutMode: ComputedRef<LayoutAsideMode>
  isOpen: ComputedRef<boolean>
  width: ComputedRef<number>
  collapsedWidth: ComputedRef<number>
  collapseEffect: ComputedRef<LayoutAsideCollapseEffect>
  minWidth: ComputedRef<number>
  maxWidth: ComputedRef<number>
  resizable: ComputedRef<boolean>
  isDock: ComputedRef<boolean>
  isDrawer: ComputedRef<boolean>
  isRail: ComputedRef<boolean>
  isHidden: ComputedRef<boolean>
  canResize: ComputedRef<boolean>
}

export interface LayoutPanelActions {
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

export interface LayoutPanelContext {
  el: ShallowRef<HTMLElement | null>
  state: LayoutPanelState
  actions: LayoutPanelActions
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

export interface LayoutContext {
  rootEl: ShallowRef<HTMLElement | null>
  dragHandleEl: ShallowRef<HTMLElement | null>
  left: LayoutPanelContext
  right: LayoutPanelContext
  floating: LayoutFloatingContext
  ui: {
    isDrawerVisible: ComputedRef<boolean>
  }
  actions: {
    closeDrawers: () => void
  }
}

export interface UseLayoutRootStateResult {
  leftPanel: LayoutPanelContext
  rightPanel: LayoutPanelContext
  floating: LayoutFloatingContext
}
