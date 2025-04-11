import { Options as MarkdownItOptions } from 'markdown-it'
import { Component, CSSProperties, VNode } from 'vue'

export type BubbleRole = 'ai' | 'user'

export interface BubbleRoleConfig {
  avatar?: VNode
  align: 'left' | 'right'
}

export type BubbleStatus = 'loading' | 'generating' | 'aborted' | 'complete' | 'error'

export interface BubbleActionOptions {
  name: string
  vnode: VNode | Component
  show?: boolean | ((props: BubbleItemProps) => boolean)
}

export type BubbleAction = 'copy' | 'regenerate' | 'like' | 'dislike' | 'continue' | 'edit' | BubbleActionOptions

export interface BubbleItemProps {
  /**
   * 角色，`ai` 或 `user`
   */
  role: BubbleRole
  /**
   * 内容
   */
  content?: string
  /**
   * 内容类型
   */
  type?: 'text' | 'markdown'
  /**
   * 气泡状态
   */
  status?: BubbleStatus
  /**
   * 角色配置项
   */
  roleConfig?: BubbleRoleConfig
  /**
   * type 为 'markdown' 时，markdown 的配置项
   */
  mdConfig?: MarkdownItOptions
  showActions?: boolean
  actions?: BubbleAction[]
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
}

export interface BubbleActionConfig {
  show?: boolean
  actions?: BubbleAction[]
}

export interface BubbleListProps {
  items: BubbleItemProps[]
  roleConfigs?: Partial<Record<BubbleRole, BubbleRoleConfig>>
  mdConfig?: MarkdownItOptions
  actionConfigs?: Partial<Record<BubbleRole, BubbleActionConfig>>
  autoScroll?: boolean
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
}
