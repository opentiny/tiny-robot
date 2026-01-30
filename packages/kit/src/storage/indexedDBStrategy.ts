import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ChatMessage } from '../types'
import type { ConversationInfo } from '../vue/conversation/types'
import type { ConversationStorageStrategy } from './types'
import { transformMessages, unwrapProxy } from './utils'

/**
 * 存储的消息结构（一个会话的所有消息）
 */
interface StoredMessages {
  conversationId: string // 会话 ID（作为主键）
  messages: ChatMessage[] // 该会话的所有消息数组
}

/**
 * IndexedDB 数据库结构定义
 */
interface ConversationDB extends DBSchema {
  conversations: {
    key: string // conversation.id
    value: ConversationInfo
    indexes: {
      'by-updated': number // 按更新时间索引
    }
  }
  messages: {
    key: string // conversationId
    value: StoredMessages
  }
}

/**
 * IndexedDB 存储策略
 */
export class IndexedDBStrategy implements ConversationStorageStrategy {
  private dbName: string
  private dbVersion: number
  private db: IDBPDatabase<ConversationDB> | null = null

  constructor(dbName: string = 'tiny-robot-ai-db', dbVersion: number = 3) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  /**
   * 获取或初始化数据库连接
   */
  private async getDB(): Promise<IDBPDatabase<ConversationDB>> {
    if (!this.db) {
      this.db = await openDB<ConversationDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // 创建会话对象存储和索引
          if (!db.objectStoreNames.contains('conversations')) {
            const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' })
            conversationStore.createIndex('by-updated', 'updatedAt')
          }

          // 创建消息对象存储（使用 conversationId 作为主键）
          if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', {
              keyPath: 'conversationId',
            })
          }
        },
      })
    }
    return this.db
  }

  /**
   * 加载所有会话（只包含元数据）
   */
  async loadConversations(): Promise<ConversationInfo[]> {
    try {
      const db = await this.getDB()

      // 按更新时间倒序获取所有会话
      const conversations = await db.getAllFromIndex('conversations', 'by-updated')

      // 最新的在前
      return conversations.reverse()
    } catch (error) {
      console.error('加载会话失败:', error)
      return []
    }
  }

  /**
   * 加载指定会话的所有消息
   */
  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const db = await this.getDB()

      // 通过 conversationId 直接获取该会话的消息记录
      const storedMessages = await db.get('messages', conversationId)

      if (!storedMessages) {
        return []
      }

      // 转换消息格式
      return transformMessages(storedMessages.messages)
    } catch (error) {
      console.error('加载会话消息失败:', error)
      return []
    }
  }

  /**
   * 保存或更新会话元数据
   */
  async saveConversation(conversation: ConversationInfo): Promise<void> {
    try {
      const db = await this.getDB()
      // 解包 Proxy 对象，确保数据可序列化
      const serializableConversation = unwrapProxy(conversation)
      await db.put('conversations', serializableConversation)
    } catch (error) {
      console.error('保存会话失败:', error)
      throw error
    }
  }

  /**
   * 保存指定会话的消息
   */
  async saveMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const db = await this.getDB()

      // 递归解包 Proxy 对象，确保消息数据可序列化
      const serializableMessages = unwrapProxy(messages)

      // 直接保存或更新该会话的消息记录（使用 put 方法，如果存在则更新，不存在则创建）
      await db.put('messages', {
        conversationId,
        messages: serializableMessages,
      })
    } catch (error) {
      console.error('保存会话消息失败:', error)
      throw error
    }
  }

  /**
   * 删除会话及其所有消息
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const db = await this.getDB()

      // 删除会话
      await db.delete('conversations', conversationId)

      // 删除该会话的消息记录（通过 conversationId 直接删除）
      await db.delete('messages', conversationId)
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error
    }
  }
}
