import { Options as MarkdownItOptions } from 'markdown-it'
import { TypedOptions } from 'typed.js'
import { VNode } from 'vue'

export type BubbleRole = 'ai' | 'user'

export interface RoleConfig {
  avatar: VNode
  placement: 'start' | 'end'
  style: Record<string, string>
}

export type TypedConfig = Omit<TypedOptions, 'strings' | 'stringsElement' | 'contentType'> & {
  enable?: boolean
}

export interface BubbleItem {
  role: BubbleRole
  content?: string
  loading?: boolean
  type?: 'text' | 'markdown'
  aborted?: boolean
  /**
   * @deprecated
   */
  typedConfig?: TypedConfig
  mdConfig?: MarkdownItOptions
  roleConfig?: RoleConfig
}

export interface BubbleList {
  items: BubbleItem[]
  roleConfigs?: Record<BubbleRole, RoleConfig>
  loading?: boolean
  mdConfig?: MarkdownItOptions
  autoScroll?: boolean
}
