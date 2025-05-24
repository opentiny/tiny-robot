import { Component, VNode } from 'vue'

// TODO rename Question
export interface QuestionDataItem {
  id: string
  text: string
}

export interface QuestionGroup {
  group: string
  label: string
  icon?: VNode | Component
  items: QuestionDataItem[]
}

export type QuestionData = (QuestionDataItem | QuestionGroup)[]

export interface QuestionPopoverProps {
  // TODO 统一字段 data，可为group或者普通的items
  groups: QuestionGroup[]
  // TODO
  data?: QuestionData
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
  // 下面是样式相关的属性
  popperWidth?: string
  listHeight?: string
  topOffset?: string
}

export interface QuestionPopoverSlots {
  default: () => unknown
}
