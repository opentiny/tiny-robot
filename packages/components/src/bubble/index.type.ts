import { VNode } from 'vue'
import { BubbleMessageProps } from './message'
export * from './message/index.type'

export interface BubbleCommonProps {
  /**
   * 气泡对齐位置
   */
  placement?: 'start' | 'end'
  /**
   * 气泡头像
   */
  avatar?: VNode
  /**
   * 气泡形状，默认 'corner'
   */
  shape?: 'rounded' | 'corner'
  hidden?: boolean
  maxWidth?: string | number
}

export interface BubbleProps extends BubbleCommonProps {
  /**
   * 气泡内容
   */
  content?: string
  messages?: BubbleMessageProps[]
  id?: string | number | symbol
  role?: string
  loading?: boolean
  aborted?: boolean
}

export interface BubbleSlots {
  default?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  footer?: (slotProps: { bubbleProps: BubbleProps }) => unknown
  loading?: (slotProps: { bubbleProps: BubbleProps }) => unknown
}

export type BubbleRoleConfig = BubbleCommonProps & {
  slots?: BubbleSlots
}

export interface BubbleListProps {
  items: (BubbleProps & { slots?: BubbleSlots })[]
  /**
   * 每个角色的默认配置项
   */
  roles?: Record<string, BubbleRoleConfig>
  /**
   * 列表是否加载中
   */
  loading?: boolean
  /**
   * 指定哪个角色可以有加载中状态
   */
  loadingRole?: string
  autoScroll?: boolean
}
