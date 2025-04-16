import { CSSProperties, VNode } from 'vue'

export interface PromptProps {
  /**
   * 提示标签，显示提示的主要内容
   */
  label: string
  /**
   * 唯一标识用于区分每个提示项，用于 Prompts 列表。如果不传此参数，则使用 index 作为 key
   */
  id?: string
  /**
   * 提示描述，提供额外的信息
   */
  description?: string
  /**
   * 提示图标，显示在提示项的左侧
   */
  icon?: VNode
  /**
   * 是否禁用。默认 false
   */
  disabled?: boolean
  /**
   * 提示徽章，显示在提示项的右上角
   */
  badge?: string | VNode
}

export interface PromptsProps {
  /**
   * 包含多个提示项的列表
   */
  items: PromptProps[]
  /**
   * 自定义样式，用于各个提示项的不同部分
   */
  itemStyle?: string | CSSProperties
  /**
   *  自定义类名，用于各个提示项的不同部分
   */
  itemClass?: string | string[]
  /**
   * 提示列表是否垂直排列。默认 false
   */
  vertical?: boolean
  /**
   * 提示列表是否折行。默认 false
   */
  wrap?: boolean
}

export interface PromptsEvents {
  (e: 'item-click', ev: MouseEvent, item: PromptProps): void
}
