import { ChatMessage } from '../types'
import type { ConversationInfo } from '../vue/conversation/types'
import type { ConversationStorageStrategy } from './types'
import { transformMessages } from './utils'

const getConversations = (storageKey: string) => {
  const conversationsStr = localStorage.getItem(storageKey)
  const conversations = conversationsStr ? JSON.parse(conversationsStr) : []
  return conversations as (ConversationInfo & { messages: ChatMessage[] })[]
}

/**
 * 本地存储策略
 */
export class LocalStorageStrategy implements ConversationStorageStrategy {
  private storageKey: string

  constructor(storageKey: string = 'tiny-robot-ai-conversations') {
    this.storageKey = storageKey
  }

  saveConversation(conversation: ConversationInfo) {
    try {
      const conversations = getConversations(this.storageKey)
      const index = conversations.findIndex((item) => item.id === conversation.id)
      if (index !== -1) {
        Object.assign(conversations[index], conversation)
      } else {
        conversations.unshift({ ...conversation, messages: [] })
      }
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }

  loadConversations(): ConversationInfo[] {
    try {
      const conversations = getConversations(this.storageKey)
      return conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        metadata: conversation.metadata,
      }))
    } catch (error) {
      console.error('加载会话失败:', error)
      return []
    }
  }

  saveMessages(conversationId: string, messages: ChatMessage[]) {
    try {
      const conversations = getConversations(this.storageKey)
      const index = conversations.findIndex((item) => item.id === conversationId)
      if (index !== -1) {
        conversations[index].messages = messages
      }
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('保存会话消息失败:', error)
    }
  }

  loadMessages(conversationId: string) {
    try {
      const conversations = getConversations(this.storageKey)
      const conversation = conversations.find((item) => item.id === conversationId)
      const messages = transformMessages(conversation?.messages || [])
      return messages
    } catch (error) {
      console.error('加载会话消息失败:', error)
      return []
    }
  }

  deleteConversation(conversationId: string) {
    const conversations = getConversations(this.storageKey)
    const index = conversations.findIndex((item) => item.id === conversationId)
    if (index !== -1) {
      conversations.splice(index, 1)
    }
    localStorage.setItem(this.storageKey, JSON.stringify(conversations))
  }
}
