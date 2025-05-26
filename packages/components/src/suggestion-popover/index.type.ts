import { Component, VNode } from 'vue'

export interface SuggestionItem {
  id: string
  text: string
}

export interface SuggestionGroup {
  group: string
  label: string
  icon?: VNode | Component
  items: SuggestionItem[]
}

export type SuggestionData = (SuggestionItem | SuggestionGroup)[]

export interface SuggestionPopoverProps {
  data: SuggestionData
  title?: string
  icon?: VNode | Component
  /**
   * model:show
   */
  show?: boolean
  /**
   * model:selectedGroup
   */
  selectedGroup?: string
  loading?: boolean
  /**
   * 默认值为 true，点击外部关闭
   */
  closeOnClickOutside?: boolean
  // 下面是样式相关的属性
  popoverWidth?: string | number
  popoverHeight?: string | number
  topOffset?: string | number
}

export interface SuggestionPopoverSlots {
  default: () => unknown
  loading: () => unknown
  empty: () => unknown
}

export interface SuggestionPopoverEmits {
  (e: 'item-click', item: SuggestionItem): void
}
