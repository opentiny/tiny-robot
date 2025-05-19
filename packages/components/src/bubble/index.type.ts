import { Config as DompurifyConfig } from 'dompurify'
import { Options as MarkdownItOptions } from 'markdown-it-async'
import { CSSProperties, VNode } from 'vue'

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
  /**
   * 自定义内容转换函数，支持异步
   */
  transformContent?: (content?: string) => Promise<string> | string
  loading?: boolean
  aborted?: boolean
  /**
   * type 为 'markdown' 时，markdown 的配置项
   */
  mdConfig?: MarkdownItOptions
  /**
   * dompurify 配置项，用于 XSS 防护。type 为 'markdown' 时会使用此配置项
   */
  domPurifyConfig?: DompurifyConfig
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
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
