import { VNode } from 'vue'
import { BubbleContentItem, BubbleContentRenderer } from './renderers'
export * from './renderers/index.type'

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
  /**
   * 气泡内容渲染器。
   * 如果 Bubble 中的 content 是长度大于 0 的数组，则 contentRenderer 无效。将会使用 BubbleProvider 中注册的渲染器
   */
  contentRenderer?: BubbleContentRenderer
  /**
   * 自定义气泡内容字段。比如 customContentField 设置为 'my-content'，则 Bubble 优先渲染 my-content 属性到气泡内容
   */
  customContentField?: string
  /**
   * 气泡中止文本
   */
  abortedText?: string
  /**
   * 气泡最大宽度
   */
  maxWidth?: string | number
}

export interface BubbleProps extends BubbleCommonProps {
  /**
   * 气泡内容
   */
  content?: string | BubbleContentItem[]
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
  hidden?: boolean
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
