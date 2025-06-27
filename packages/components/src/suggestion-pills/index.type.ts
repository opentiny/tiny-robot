import { Component, VNode } from 'vue'
import { DropdownMenuEvents, DropdownMenuEventProps, DropdownMenuProps } from '../dropdown-menu/index.type'
import {
  SuggestionPopoverEventProps,
  SuggestionPopoverEvents,
  SuggestionPopoverProps,
  SuggestionPopoverSlots,
} from '../suggestion-popover/index.type'

export type SuggestionPillPopoverAction = {
  type: 'popover'
  props: SuggestionPopoverProps & SuggestionPopoverEventProps
  slots?: Omit<SuggestionPopoverSlots, 'default'>
  /**
   * @deprecated use onXXX in props instead
   */
  events?: SuggestionPopoverEvents
}

export type SuggestionPillMenuAction = {
  type: 'menu'
  props: DropdownMenuProps & DropdownMenuEventProps
  /**
   * @deprecated use onXXX in props instead
   */
  events?: DropdownMenuEvents
}

export type SuggestionPillAction = SuggestionPillPopoverAction | SuggestionPillMenuAction

export type SuggestionPillBaseItem<T> = {
  id: string
  action?: SuggestionPillAction
} & T

export type SuggestionPillItem<T = Record<string, unknown>> = SuggestionPillBaseItem<T> &
  ({ text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component })

export interface SuggestionPillsProps {
  items?: SuggestionPillItem[]
  /**
   * model:showAll
   */
  showAll?: boolean
  /**
   * 显示更多按钮的时机
   * - hover: 鼠标悬停时显示
   * - always: 总是显示
   * @default 'hover'
   */
  showAllButtonOn?: 'hover' | 'always'
  /**
   * 控制多余按钮如何展示
   * - expand: 点击更多按钮展开所有项
   * - scroll: 横向滚动显示多余项
   * @default 'expand'
   */
  overflowMode?: 'expand' | 'scroll'
  /**
   * 鼠标悬停时是否自动滚动到可见区域
   * @default false
   */
  autoScrollOnHover?: boolean
}

/**
 * @deprecated
 */
export interface SuggestionPillsSlots {
  default?: () => VNode | VNode[]
}

export interface SuggestionPillsEmits {
  (e: 'item-click', item: SuggestionPillItem): void
  (e: 'click-outside', event: MouseEvent): void
}

export interface SuggestionPillButtonProps {
  item?: SuggestionPillItem
}

export interface SuggestionPillButtonSlots {
  default?: () => unknown
  icon?: () => unknown
}
