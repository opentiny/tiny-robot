import type { ComponentPublicInstance, ComputedRef, MaybeRefOrGetter } from 'vue'
import type {
  LayoutAsideCollapseEffect,
  LayoutAsideMode,
  LayoutAsidePanelsProps,
  LayoutFloatingOptions,
  LayoutFloatingState,
  LayoutMode,
  LayoutPlacement,
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

export interface LayoutRuntimeProps extends LayoutAsidePanelsProps {
  mode: LayoutMode
  floatingState?: LayoutFloatingState
  defaultFloatingState?: LayoutFloatingState
  floatingOptions?: LayoutFloatingOptions
}

export type LayoutMainScrollHostComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutMainScrollHost = HTMLElement | LayoutMainScrollHostComponent | null | undefined

export interface LayoutAsideToggleProps {
  placement: LayoutPlacement
}

export interface LayoutMainProps {
  scrollHost?: LayoutMainScrollHost
}

type ToMaybeRefFields<T> = {
  [K in keyof T]: MaybeRefOrGetter<T[K]>
}

interface LayoutPanelValue {
  placement: LayoutPlacement
  layoutMode: LayoutAsideMode
  isOpen: boolean
  width: number | undefined
  collapsedWidth: number | undefined
  collapseEffect: LayoutAsideCollapseEffect
  minWidth: number
  maxWidth: number
  resizable: boolean
}

interface LayoutPanelMutations {
  setOpen: (nextOpen: boolean) => void
  setWidth: (nextWidth: number) => void
}

interface LayoutPanelDerived {
  isDock: boolean
  isDrawer: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
}

export type LayoutPanelState = ToMaybeRefFields<LayoutPanelValue> & LayoutPanelMutations

export interface LayoutPanelApi extends LayoutPanelValue, LayoutPanelDerived, LayoutPanelMutations {
  isRegistered: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export interface LayoutContext {
  left: LayoutPanelApi
  right: LayoutPanelApi
  isDrawerVisible: boolean
  closeDrawers: () => void
}

export interface UseLayoutRootStateResult {
  resolvedMode: ComputedRef<LayoutMode>
  resolvedFloatingState: ComputedRef<LayoutFloatingState | undefined>
  resolvedFloating: ComputedRef<LayoutResolvedFloating | undefined>
  commitFloatingState: (nextFloating: LayoutFloatingState) => void
  initializeFloatingState: (nextFloating: LayoutFloatingState) => void
  leftAside: LayoutPanelState
  rightAside: LayoutPanelState
}
