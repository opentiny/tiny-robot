import { Component, VNode } from 'vue'

export type SuggestionPillItem = { text: string; icon?: VNode | Component } | { text?: string; icon: VNode | Component }

export interface SuggestionPillsProps {
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
   */
  autoScrollOn?: 'mouseenter' | 'click'
}

export interface SuggestionPillsSlots {
  default?: () => VNode[]
}

export interface SuggestionPillsEmits {
  (e: 'click-outside', event: MouseEvent): void
}

export interface SuggestionPillButtonProps {
  item?: SuggestionPillItem
}

export interface SuggestionPillButtonSlots {
  default?: () => unknown
  icon?: () => unknown
}
