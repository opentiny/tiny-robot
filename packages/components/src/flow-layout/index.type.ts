import { Component, VNode } from 'vue'

export type FlowLayoutItem =
  | { id: string; icon: VNode | Component; label?: string }
  | { id: string; label: string; icon?: VNode | Component }

export interface FlowLayoutProps {
  /**
   * 组件要渲染的元素数组
   */
  items: FlowLayoutItem[]
  /**
   * 当前选中的元素。是一个 model
   */
  selected?: FlowLayoutItem['id']
  /**
   * 显示的最大行数限制。默认不限制
   */
  linesLimit?: number
  /**
   * 自定义“更多”按钮的图标
   */
  moreIcon?: VNode | Component
  /**
   * 触发“更多”按钮显示的方式，可选值为 'click' 或 'hover'。默认值为 'click'
   */
  showMoreTrigger?: 'click' | 'hover'
}

export interface FlowLayoutEmits {
  (e: 'item-click', id: string): void
}
