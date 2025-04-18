import { Options as MarkdownItOptions } from 'markdown-it'
import { Component, CSSProperties, VNode } from 'vue'

export interface BubbleActionOptions {
  name: 'copy' | 'refresh' | string
  vnode?: VNode | Component
  show?: boolean | ((props: BubbleProps) => boolean)
}

export type BubbleAction = 'copy' | 'refresh' | BubbleActionOptions

export type BubblePalcement = 'start' | 'end'

export interface BubbleProps {
  /**
   * 气泡内容
   */
  content?: string
  id?: string
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

  actions?: BubbleAction[]
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
}

export interface BubbleSlots {
  default: () => unknown
  footer: () => unknown
  loading: () => unknown
}

export interface BubbleEvents {
  (e: 'copy', result: boolean): void
  (e: 'refresh'): void
  (e: 'action', name: string, ...args: unknown[]): void
}

export type BubbleRoleConfig = Pick<BubbleProps, 'placement' | 'avatar' | 'type' | 'mdConfig' | 'actions' | 'maxWidth'>

export interface BubbleListProps {
  items: BubbleProps[]
  /**
   * 每个角色的默认配置项
   */
  roles?: Record<string, BubbleRoleConfig>
  autoScroll?: boolean
}
