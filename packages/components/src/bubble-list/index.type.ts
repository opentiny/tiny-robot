import { Options as MarkdownItOptions } from 'markdown-it'
import { TypedOptions } from 'typed.js'
import { CSSProperties, VNode } from 'vue'

export type BubbleRole = 'ai' | 'user'

export interface RoleConfig {
  avatar?: VNode
  align: 'left' | 'right'
}

export type TypedConfig = Omit<TypedOptions, 'strings' | 'stringsElement' | 'contentType'> & {
  enable?: boolean
}

type BaseBubbleItemProps = {
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
   * 是否显示正在加载
   */
  loading?: boolean
  /**
   * 是否显示已终止
   */
  aborted?: boolean
  /**
   * @deprecated
   */
  typedConfig?: TypedConfig
  /**
   * 角色配置项
   */
  roleConfig?: RoleConfig
  /**
   * type 为 'markdown' 时，markdown 的配置项
   */
  mdConfig?: MarkdownItOptions
  showActions?: boolean
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
}

export interface CustomAction {
  name: string
  show?: boolean | ((props: BubbleItemProps) => boolean)
  disabled?: boolean | ((props: BubbleItemProps) => boolean)
  onClick?: () => void
}

export type UserAction = 'edit' | 'copy' | CustomAction

export type AIAction = 'regenerate' | 'continue' | 'copy' | 'like' | 'dislike' | CustomAction

type AIBubbleItemProps = BaseBubbleItemProps & {
  role: 'ai'
  actions?: AIAction[]
}

type UserBubbleItemProps = BaseBubbleItemProps & {
  role: 'user'
  actions?: UserAction[]
}

export type BubbleItemProps = AIBubbleItemProps | UserBubbleItemProps

export interface BubbleListProps {
  items: BubbleItemProps[]
  loading?: boolean
  roleConfigs?: Record<BubbleRole, RoleConfig>
  mdConfig?: MarkdownItOptions
  userActions?: UserAction[]
  aiActions?: AIAction[]
  autoScroll?: boolean
}
