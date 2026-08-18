import type { ComponentPublicInstance, VNode } from 'vue'

export type LayoutSide = 'left' | 'right'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutAsideCollapseEffect = 'overlay' | 'slide'
export type LayoutMode = 'normal' | 'floating'
export type LayoutFit = 'viewport' | 'parent'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutFloatingState {
  placement: LayoutFloatingPlacement
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export interface LayoutFloatingOptions {
  draggable?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}

export type LayoutFloatingResizeHandle = 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export interface LayoutAsideOpenDetail {
  side: LayoutSide
  open: boolean
}

export interface LayoutAsideOpenValue {
  open: boolean
}

export interface LayoutAsideResizeDetail {
  side: LayoutSide
  expandedWidth: number
}

export interface LayoutAsideResizeValue {
  expandedWidth: number
}

export type LayoutFloatingDragDetail = LayoutFloatingState

export type LayoutFloatingResizeDetail = LayoutFloatingState & {
  handle: LayoutFloatingResizeHandle
}

export interface LayoutAsideOptions {
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
  leftAside?: LayoutAsideOptions
  rightAside?: LayoutAsideOptions
}

export interface LayoutNormalProps extends LayoutAsidePanelsProps {
  mode: 'normal'
  fit?: LayoutFit
  floatingState?: never
  defaultFloatingState?: never
  floatingOptions?: never
}

type LayoutFloatingStateControlProps =
  | {
      floatingState?: LayoutFloatingState
      defaultFloatingState?: never
    }
  | {
      floatingState?: never
      defaultFloatingState?: LayoutFloatingState
    }

export type LayoutFloatingProps = LayoutAsidePanelsProps &
  LayoutFloatingStateControlProps & {
    mode: 'floating'
    fit?: LayoutFit
    floatingOptions?: LayoutFloatingOptions
  }

export type LayoutProps = LayoutNormalProps | LayoutFloatingProps

export type LayoutScrollTargetComponent = Pick<ComponentPublicInstance, '$el'>

export type LayoutScrollTarget = HTMLElement | LayoutScrollTargetComponent | null | undefined

export interface LayoutProxyScrollbarProps {
  scrollTarget?: LayoutScrollTarget
}

export interface LayoutAsideToggleProps {
  side: LayoutSide
}

export interface LayoutEmits {
  'update:floatingState': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragDetail]
  'floating-drag': [detail: LayoutFloatingDragDetail]
  'floating-drag-end': [detail: LayoutFloatingDragDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeDetail]
  'floating-resize': [detail: LayoutFloatingResizeDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeDetail]

  'aside-open-change': [detail: LayoutAsideOpenDetail]
  'aside-resize-start': [detail: LayoutAsideResizeDetail]
  'aside-resize': [detail: LayoutAsideResizeDetail]
  'aside-resize-end': [detail: LayoutAsideResizeDetail]
  'left-aside-open-change': [detail: LayoutAsideOpenValue]
  'left-aside-resize-start': [detail: LayoutAsideResizeValue]
  'left-aside-resize': [detail: LayoutAsideResizeValue]
  'left-aside-resize-end': [detail: LayoutAsideResizeValue]
  'right-aside-open-change': [detail: LayoutAsideOpenValue]
  'right-aside-resize-start': [detail: LayoutAsideResizeValue]
  'right-aside-resize': [detail: LayoutAsideResizeValue]
  'right-aside-resize-end': [detail: LayoutAsideResizeValue]
}

export interface LayoutSlots {
  'left-aside'?: () => VNode | VNode[]
  header?: () => VNode | VNode[]
  main?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
  'right-aside'?: () => VNode | VNode[]
}
