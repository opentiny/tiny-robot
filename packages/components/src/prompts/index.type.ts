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
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 提示徽章，显示在提示项的右上角
   */
  badge?: string | VNode
}

export interface PromptsProps {
  items: PromptProps[]
  itemStyle?: string | CSSProperties
  itemClass?: string
  vertical?: boolean
  wrap?: boolean
}

export interface PromptsEvents {
  (e: 'item-click', ev: MouseEvent, item: PromptProps): void
}
