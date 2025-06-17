import { Component, VNode } from 'vue'

export interface SuggestionBaseItem {
  id: string
  text: string
}

export type SuggestionItem<T = Record<string, unknown>> = SuggestionBaseItem & T

export interface SuggestionGroup<T = Record<string, unknown>> {
  group: string
  label: string
  icon?: VNode | Component
  items: SuggestionItem<T>[]
}

export type SuggestionData<T = Record<string, unknown>> = (SuggestionItem<T> | SuggestionGroup<T>)[]

export interface SuggestionPopoverProps<T = Record<string, unknown>> {
  data: SuggestionData<T>
  title?: string
  icon?: VNode | Component
  /**
   * 是否显示弹窗，仅在 trigger 为 'manual' 时有效
   */
  show?: boolean
  /**
   * 触发方式。默认值为 'click'
   */
  trigger?: 'click' | 'manual'
  /**
   * model:selectedGroup
   */
  selectedGroup?: string
  groupShowMoreTrigger?: 'click' | 'hover'
  loading?: boolean
  // 下面是样式相关的属性
  popoverWidth?: string | number
  popoverHeight?: string | number
  topOffset?: string | number
}

export interface SuggestionPopoverSlots {
  default?: () => unknown
  loading?: () => unknown
  empty?: () => unknown
}

export interface SuggestionPopoverEmits {
  (e: 'item-click', item: SuggestionItem): void
  (e: 'group-click', group: SuggestionGroup): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'click-outside', event: MouseEvent): void
}

export interface SuggestionPopoverEventProps {
  onItemClick?: (item: SuggestionItem) => void
  onGroupClick?: (group: SuggestionGroup) => void
  onOpen?: () => void
  onClose?: () => void
  onClickOutside?: (event: MouseEvent) => void
}

export interface SuggestionPopoverEvents {
  /**
   * @deprecated use onItemClick in props instead
   */
  itemClick?: (item: SuggestionItem) => void
  /**
   * @deprecated use onGroupClick in props instead
   */
  groupClick?: (group: SuggestionGroup) => void
  /**
   * @deprecated use onOpen in props instead
   */
  open?: () => void
  /**
   * @deprecated use onClose in props instead
   */
  close?: () => void
  /**
   * @deprecated use onClickOutside in props instead
   */
  clickOutside?: (event: MouseEvent) => void
}
