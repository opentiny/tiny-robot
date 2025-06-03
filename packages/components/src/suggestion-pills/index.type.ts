import { Component, VNode } from 'vue'
import {
  SuggestionPopoverEvents,
  SuggestionPopoverProps,
  SuggestionPopoverSlots,
} from '../suggestion-popover/index.type'
import { DropdownMenuEvents, DropdownMenuProps } from '../dropdown-menu/index.type'

export type SuggestionPillAction =
  | {
      type: 'popover'
      props: SuggestionPopoverProps
      slots?: Omit<SuggestionPopoverSlots, 'default'>
      events?: SuggestionPopoverEvents
    }
  | { type: 'menu'; props: DropdownMenuProps; events?: DropdownMenuEvents }

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
}

/**
 * @deprecated
 */
export interface SuggestionPillsSlots {
  default?: () => VNode | VNode[]
}

export interface SuggestionPillsEmits {
  (e: 'item-click', item: SuggestionPillItem): void
}

export interface SuggestionPillButtonProps {
  item?: SuggestionPillItem
}

export interface SuggestionPillButtonSlots {
  default?: () => unknown
  icon?: () => unknown
}
