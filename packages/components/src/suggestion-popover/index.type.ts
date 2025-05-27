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
}

export interface SuggestionPopoverEvents {
  itemClick?: (item: SuggestionItem) => void
  groupClick?: (group: SuggestionGroup) => void
  close?: () => void
}
