import type { VNode } from 'vue'

export type LayoutPlacement = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutFloatingState {
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
}

export interface LayoutFloatingOptions {
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export type LayoutFloatingResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface LayoutAsideResizeEventDetail {
  placement: LayoutPlacement
  width: number
}

export type LayoutFloatingDragEventDetail = LayoutFloatingState

export type LayoutFloatingResizeEventDetail = LayoutFloatingState & {
  handle: LayoutFloatingResizeHandle
}

export interface LayoutAsideProps {
  mode?: LayoutAsideMode
  open?: boolean
  defaultOpen?: boolean
  expandedWidth?: number
  defaultExpandedWidth?: number
  minExpandedWidth?: number
  maxExpandedWidth?: number
  collapsedWidth?: number
  collapseEffect?: LayoutAsideCollapseEffect
  resizable?: boolean
}

export interface LayoutAsidePanelsProps {
  leftAside?: LayoutAsideProps
  rightAside?: LayoutAsideProps
}

export interface LayoutNormalProps extends LayoutAsidePanelsProps {
  mode?: 'normal'
}

type LayoutFloatingStateControlProps =
  | {
      floatingState: LayoutFloatingState | undefined
      defaultFloatingState?: never
    }
  | {
      floatingState?: undefined
      defaultFloatingState?: LayoutFloatingState
    }

export type LayoutFloatingProps = LayoutAsidePanelsProps &
  LayoutFloatingStateControlProps & {
    mode: 'floating'
    floatingOptions?: LayoutFloatingOptions
  }

export type LayoutProps = LayoutNormalProps | LayoutFloatingProps

export interface LayoutAsideState {
  open: boolean
  expandedWidth: number | undefined
}
export interface LayoutEmits {
  'left-aside-state-change': [value: LayoutAsideState]
  'right-aside-state-change': [value: LayoutAsideState]
  'update:floatingState': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragEventDetail]
  'floating-drag': [detail: LayoutFloatingDragEventDetail]
  'floating-drag-end': [detail: LayoutFloatingDragEventDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize': [detail: LayoutFloatingResizeEventDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeEventDetail]
  'aside-resize-start': [detail: LayoutAsideResizeEventDetail]
  'aside-resize': [detail: LayoutAsideResizeEventDetail]
  'aside-resize-end': [detail: LayoutAsideResizeEventDetail]
}

export interface LayoutAsideSlotProps {
  placement: LayoutPlacement
  mode: LayoutAsideMode
  open: boolean
  expandedWidth: number | undefined
  collapsedWidth: number | undefined
  resizable: boolean
  isRail: boolean
  isHidden: boolean
  canResize: boolean
  toggle: () => void
  setOpen: (next: boolean) => void
  setExpandedWidth: (next: number) => void
}

export interface LayoutSlots {
  'left-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: (slotProps: LayoutAsideSlotProps) => VNode | VNode[]
}
