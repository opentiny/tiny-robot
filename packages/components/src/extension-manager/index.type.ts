import type { Component, VNode } from 'vue'

export type ExtensionCardOverflowMenuPlacement = 'bottom-end' | 'top-end'

export interface ExtensionCardActionBase {
  id: string
  label: string
  icon?: Component
  hidden?: boolean
  disabled?: boolean
  danger?: boolean
}

export interface ExtensionCardSwitchAction extends ExtensionCardActionBase {
  type: 'switch'
  checked: boolean
}

export interface ExtensionCardButtonAction extends ExtensionCardActionBase {
  type: 'button'
}

export interface ExtensionCardCustomAction extends ExtensionCardActionBase {
  type: 'custom'
  data?: unknown
}

export type ExtensionCardAction = ExtensionCardSwitchAction | ExtensionCardButtonAction | ExtensionCardCustomAction

/** Actions passed from Card to its internal renderers after visibility is resolved. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type ExtensionCardRenderableAction = DistributiveOmit<ExtensionCardAction, 'hidden'>

export interface ExtensionCardActionEvent {
  id: string
  type: ExtensionCardAction['type']
  checked?: boolean
  payload?: unknown
}

export interface ExtensionCardProps {
  name: string
  description?: string
  icon?: string | Component
  actions?: ExtensionCardAction[]
  primaryActionsLimit?: number
  progress?: number | 'indeterminate'
  nameClickable?: boolean
  overflowMenuLabel?: string
  overflowMenuPlacement?: ExtensionCardOverflowMenuPlacement
  overflowMenuShowIcons?: boolean
}

export interface ExtensionCardSlots {
  'primary-action'?: (props: {
    action: Extract<ExtensionCardRenderableAction, { type: 'custom' }>
    trigger: (payload?: unknown) => void
  }) => VNode[]
}

export interface ExtensionCardEmits {
  (e: 'name-click', event: MouseEvent | KeyboardEvent): void
  (e: 'action', payload: ExtensionCardActionEvent): void
}

export type ExtensionCardGridItem = ExtensionCardProps & {
  id: string
}

export interface ExtensionCardGridProps extends Pick<
  ExtensionCardProps,
  'primaryActionsLimit' | 'nameClickable' | 'overflowMenuLabel' | 'overflowMenuPlacement' | 'overflowMenuShowIcons'
> {
  items: ExtensionCardGridItem[]
  emptyText?: string
}

export interface ExtensionCardGridSlots {
  item?: (props: { item: ExtensionCardGridItem; index: number }) => VNode[]
  empty?: () => VNode[]
}

export interface ExtensionCardGridActionEvent {
  itemId: string
  action: ExtensionCardActionEvent
}

export interface ExtensionCardGridNameClickEvent {
  itemId: string
  event: MouseEvent | KeyboardEvent
}

export interface ExtensionCardGridEmits {
  (e: 'action', payload: ExtensionCardGridActionEvent): void
  (e: 'name-click', payload: ExtensionCardGridNameClickEvent): void
}

export type ExtensionManagerSectionKey = 'installed' | 'available'

export interface ExtensionManagerTagOption {
  value: string
  label: string
}

export type ExtensionManagerItem = ExtensionCardGridItem & {
  installed?: boolean
  tags?: string[]
}

export interface ExtensionManagerTab {
  id: string
  label: string
  items: ExtensionManagerItem[]
}

export interface ExtensionManagerProps {
  tabs: ExtensionManagerTab[]
  activeTab?: string
  defaultActiveTab?: string
  title?: string
  emptyText?: string
}

export interface ExtensionManagerSlots {
  'header-actions'?: () => VNode[]
  tab?: (props: { tab: ExtensionManagerTab; active: boolean; select: () => void }) => VNode[]
  item?: (props: {
    tab: ExtensionManagerTab
    sectionKey: ExtensionManagerSectionKey
    item: ExtensionCardGridItem
    index: number
  }) => VNode[]
  empty?: (props: { tab: ExtensionManagerTab; sectionKey: ExtensionManagerSectionKey; title: string }) => VNode[]
}

export interface ExtensionManagerTabChangeEvent {
  tabId: string
}

export interface ExtensionManagerSectionToggleEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  expanded: boolean
}

export interface ExtensionManagerActionEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  itemId: string
  action: ExtensionCardActionEvent
}

export interface ExtensionManagerNameClickEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  itemId: string
  event: MouseEvent | KeyboardEvent
}

export interface ExtensionManagerEmits {
  (e: 'update:active-tab', tabId: string | undefined): void
  (e: 'tab-change', event: ExtensionManagerTabChangeEvent): void
  (e: 'section-toggle', event: ExtensionManagerSectionToggleEvent): void
  (e: 'action', event: ExtensionManagerActionEvent): void
  (e: 'name-click', event: ExtensionManagerNameClickEvent): void
}
