import type { Conversation } from '../vue/conversation/types'

/**
 * 存储策略接口
 */
export interface ConversationStorageStrategy {
  /** 保存会话列表 */
  saveConversations: (conversations: Conversation[]) => Promise<void> | void
  /** 加载会话列表 */
  loadConversations: () => Promise<Conversation[]> | Conversation[]
  /** 清空所有会话（可选） */
  clear?: () => Promise<void> | void
}
