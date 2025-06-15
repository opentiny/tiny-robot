import { Options as MarkdownItOptions } from 'markdown-it'
import { VNode } from 'vue'
import { BubbleMessageProps } from './types'
export * from './types'

export type BubblePalcement = 'start' | 'end'

export interface BubbleProps {
  /**
   * 气泡内容
   */
  content?: string
  // TODO 测试：超长文本和超长单词的显示
  messages?: BubbleMessageProps[]
  id?: string | number | symbol
  /**
   * 气泡位置
   */
  placement?: BubblePalcement
  avatar?: VNode
  role?: string
  /**
   * 气泡形状，默认 'corner'
   */
  shape?: 'rounded' | 'corner'
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
  hidden?: boolean
  // 样式相关
  maxWidth?: string | number
}

export interface BubbleSlots {
  default?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  footer?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  loading?: (slotProps: { bubbleProps: BubbleProps }) => unknown
}

export type BubbleRoleConfig = Pick<
  BubbleProps,
  'placement' | 'avatar' | 'shape' | 'type' | 'mdConfig' | 'hidden' | 'maxWidth'
> & {
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
