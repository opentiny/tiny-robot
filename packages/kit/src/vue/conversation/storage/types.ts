import type { Conversation } from '../types'

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

/**
 * 存储策略类型
 */
export type StorageType = 'localStorage' | 'indexedDB'

/**
 * 存储配置接口
 */
export interface StorageConfig {
  /** LocalStorage 的存储键名 */
  key?: string
  /** IndexedDB 的数据库名称 */
  dbName?: string
  /** IndexedDB 的数据库版本 */
  dbVersion?: number
}
