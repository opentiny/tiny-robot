import { Component, VNode } from 'vue'

// TODO rename Question
export interface QuestionItem {
  id: string
  text: string
}

export interface QuestionGroup {
  group: string
  label: string
  icon?: VNode | Component
  items: QuestionItem[]
}

export type QuestionData = (QuestionItem | QuestionGroup)[]

export interface QuestionPopoverProps {
  data: QuestionData
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
  // TODO
  loading?: boolean
  /**
   * 默认值为 true，点击外部关闭
   */
  closeOnClickOutside?: boolean
  // 下面是样式相关的属性
  popperWidth?: string | number
  listHeight?: string | number
  topOffset?: string | number
}

export interface QuestionPopoverSlots {
  default: () => unknown
}

export interface QuestionPopoverEmits {
  (e: 'item-click', item: QuestionItem): void
}
