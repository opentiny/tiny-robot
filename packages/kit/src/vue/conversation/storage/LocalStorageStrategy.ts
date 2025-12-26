import type { Conversation } from '../types'
import type { ConversationStorageStrategy } from './types'

/**
 * 本地存储策略
 */
export class LocalStorageStrategy implements ConversationStorageStrategy {
  private storageKey: string

  constructor(storageKey: string = 'tiny-robot-ai-conversations') {
    this.storageKey = storageKey
  }

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }

  loadConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('加载会话失败:', error)
      return []
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('清空会话失败:', error)
    }
  }
}
