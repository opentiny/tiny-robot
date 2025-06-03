import { Options as MarkdownItOptions } from 'markdown-it'
import { VNode } from 'vue'

export type BubblePalcement = 'start' | 'end'

export interface BubbleProps {
  /**
   * 气泡内容
   */
  content?: string
  id?: string | number | symbol
  /**
   * 气泡位置
   */
  placement?: BubblePalcement
  avatar?: VNode
  role?: string
  /**
   * 内容类型
   */
  type?: 'text' | 'markdown'
  loading?: boolean
  aborted?: boolean
  /**
   * type 为 'markdown' 时，markdown 的配置项
   */
  mdConfig?: MarkdownItOptions
  // 样式相关
  maxWidth?: string | number
}

export interface BubbleSlots {
  default?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  footer?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  loading?: (slotProps: { bubbleProps: BubbleProps }) => unknown
}

export type BubbleRoleConfig = Pick<BubbleProps, 'placement' | 'avatar' | 'type' | 'mdConfig' | 'maxWidth'> & {
  slots?: BubbleSlots
}

export interface BubbleListProps {
  items: (BubbleProps & { slots?: BubbleSlots })[]
  /**
   * 每个角色的默认配置项
   */
  roles?: Record<string, BubbleRoleConfig>
  autoScroll?: boolean
}
