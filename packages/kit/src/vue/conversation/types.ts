import type { ChatMessage } from '../../types'

/**
 * 会话接口
 */
export interface Conversation {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
  /** 会话消息 */
  messages: ChatMessage[]
}

/**
 * 会话状态接口
 */
export interface ConversationState {
  /** 会话列表 */
  conversations: Conversation[]
  /** 当前会话ID */
  currentId: string | null
  /** 是否正在加载 */
  loading: boolean
}
