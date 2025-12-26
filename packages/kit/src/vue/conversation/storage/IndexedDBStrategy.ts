import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Conversation } from '../types'
import type { ConversationStorageStrategy } from './types'

/**
 * IndexedDB 数据库结构定义
 */
interface ConversationDB extends DBSchema {
  conversations: {
    key: string // conversation.id
    value: Conversation
    indexes: {
      'by-updated': number // 按更新时间索引
    }
  }
}

/**
 * IndexedDB 存储策略
 */
export class IndexedDBStrategy implements ConversationStorageStrategy {
  private dbName: string
  private dbVersion: number
  private db: IDBPDatabase<ConversationDB> | null = null

  constructor(dbName: string = 'tiny-robot-ai-db', dbVersion: number = 1) {
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
          // 创建对象存储和索引
          if (!db.objectStoreNames.contains('conversations')) {
            const store = db.createObjectStore('conversations', { keyPath: 'id' })
            store.createIndex('by-updated', 'updatedAt')
          }
        },
      })
    }
    return this.db
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('conversations', 'readwrite')

      // 清空现有数据
      await tx.store.clear()

      // 批量插入
      await Promise.all(conversations.map((conv) => tx.store.put(conv)))

      await tx.done
    } catch (error) {
      console.error('保存会话失败:', error)
      throw error
    }
  }

  async loadConversations(): Promise<Conversation[]> {
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

  async clear(): Promise<void> {
    try {
      const db = await this.getDB()
      await db.clear('conversations')
    } catch (error) {
      console.error('清空会话失败:', error)
      throw error
    }
  }
}
