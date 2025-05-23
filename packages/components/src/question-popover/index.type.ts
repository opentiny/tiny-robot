import { Component, VNode } from 'vue'

export interface GroupItem {
  id: string
  text: string
}

export interface Group {
  id: string
  label: string
  icon?: VNode | Component
  items: GroupItem[]
}

// TODO rename
export interface QuestionPopoverProps {
  // TODO 统一字段 data，可为group或者普通的items
  groups: Group[]
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
   * style
   */
  popperWidth?: string
  listHeight?: string
}

export interface QuestionPopoverSlots {
  default: () => unknown
}
