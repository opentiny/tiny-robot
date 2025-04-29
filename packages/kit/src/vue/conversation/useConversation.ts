/**
 * useConversation composable
 * 提供会话管理和持久化功能
 */

import { reactive, watch } from 'vue'
import type { ChatMessage } from '../../types'
import { useMessage, type UseMessageReturn } from '../message/useMessage'
import type { AIClient } from '../../client'

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
 * 存储策略接口
 */
export interface ConversationStorageStrategy {
  /** 保存会话列表 */
  saveConversations: (conversations: Conversation[]) => Promise<void> | void
  /** 加载会话列表 */
  loadConversations: () => Promise<Conversation[]> | Conversation[]
}

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

/**
 * useConversation选项接口
 */
export interface UseConversationOptions {
  /** AI客户端实例 */
  client: AIClient
  /** 存储策略 */
  storage?: ConversationStorageStrategy
  /** 是否自动保存 */
  autoSave?: boolean
  /** 是否默认使用流式响应 */
  useStreamByDefault?: boolean
  /** 错误消息模板 */
  errorMessage?: string
}

/**
 * useConversation返回值接口
 */
export interface UseConversationReturn {
  /** 会话状态 */
  state: ConversationState
  /** 消息管理 */
  messageManager: UseMessageReturn
  /** 创建新会话 */
  createConversation: (title?: string, metadata?: Record<string, unknown>) => string
  /** 切换会话 */
  switchConversation: (id: string) => void
  /** 删除会话 */
  deleteConversation: (id: string) => void
  /** 更新会话标题 */
  updateTitle: (id: string, title: string) => void
  /** 更新会话元数据 */
  updateMetadata: (id: string, metadata: Record<string, unknown>) => void
  /** 保存会话 */
  saveConversations: () => Promise<void>
  /** 加载会话 */
  loadConversations: () => Promise<void>
  /** 生成会话标题 */
  generateTitle: (id: string) => Promise<string>
  /** 获取当前会话 */
  getCurrentConversation: () => Conversation | null
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * useConversation composable
 * 提供会话管理和持久化功能
 *
 * @param options useConversation选项
 * @returns UseConversationReturn
 */
export function useConversation(options: UseConversationOptions): UseConversationReturn {
  const {
    client,
    storage = new LocalStorageStrategy(),
    autoSave = true,
    useStreamByDefault = true,
    errorMessage = '请求失败，请稍后重试',
  } = options

  // 会话状态
  const state = reactive<ConversationState>({
    conversations: [],
    currentId: null,
    loading: false,
  })

  // 消息管理
  const messageManager = useMessage({
    client,
    useStreamByDefault,
    errorMessage,
    initialMessages: [],
  })

  // 监听消息变化，自动更新会话
  watch(
    () => messageManager.messages.value,
    (messages: ChatMessage[]) => {
      if (state.currentId && messages.length > 0) {
        const index = state.conversations.findIndex((row: Conversation) => row.id === state.currentId)
        if (index !== -1) {
          state.conversations[index].messages = [...messages]
          state.conversations[index].updatedAt = Date.now()
          if (autoSave) {
            saveConversations()
          }
        }
      }
    },
    { deep: true },
  )

  /**
   * 创建新会话
   */
  const createConversation = (title: string = '新会话', metadata: Record<string, unknown> = {}): string => {
    const id = generateId()
    const newConversation: Conversation = {
      id,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      metadata,
    }

    state.conversations.unshift(newConversation)
    switchConversation(id)

    if (autoSave) {
      saveConversations()
    }

    return id
  }

  /**
   * 切换会话
   */
  const switchConversation = (id: string): void => {
    const conversation = state.conversations.find((conv: Conversation) => conv.id === id)
    if (conversation) {
      state.currentId = id
      messageManager.clearMessages()
      if (conversation.messages.length > 0) {
        conversation.messages.forEach((msg: ChatMessage) => messageManager.addMessage(msg))
      }
    }
  }

  /**
   * 删除会话
   */
  const deleteConversation = (id: string): void => {
    const index = state.conversations.findIndex((conv: Conversation) => conv.id === id)
    if (index !== -1) {
      state.conversations.splice(index, 1)

      // 如果删除的是当前会话，切换到第一个会话或清空
      if (state.currentId === id) {
        if (state.conversations.length > 0) {
          switchConversation(state.conversations[0].id)
        } else {
          state.currentId = null
          messageManager.clearMessages()
        }
      }

      if (autoSave) {
        saveConversations()
      }
    }
  }

  /**
   * 更新会话标题
   */
  const updateTitle = (id: string, title: string): void => {
    const conversation = state.conversations.find((conv: Conversation) => conv.id === id)
    if (conversation) {
      conversation.title = title
      conversation.updatedAt = Date.now()

      if (autoSave) {
        saveConversations()
      }
    }
  }

  /**
   * 更新会话元数据
   */
  const updateMetadata = (id: string, metadata: Record<string, unknown>): void => {
    const conversation = state.conversations.find((conv: Conversation) => conv.id === id)
    if (conversation) {
      conversation.metadata = { ...conversation.metadata, ...metadata }
      conversation.updatedAt = Date.now()

      if (autoSave) {
        saveConversations()
      }
    }
  }

  /**
   * 保存会话
   */
  const saveConversations = async (): Promise<void> => {
    try {
      await storage.saveConversations(state.conversations)
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }

  /**
   * 加载会话
   */
  const loadConversations = async (): Promise<void> => {
    state.loading = true
    try {
      const conversations = await storage.loadConversations()
      state.conversations = conversations

      // 如果有会话，默认选中第一个
      if (conversations.length > 0 && !state.currentId) {
        switchConversation(conversations[0].id)
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    } finally {
      state.loading = false
    }
  }

  /**
   * 生成会话标题
   * 基于会话内容自动生成标题
   */
  const generateTitle = async (id: string): Promise<string> => {
    const conversation = state.conversations.find((conv: Conversation) => conv.id === id)
    if (!conversation || conversation.messages.length < 2) {
      return conversation?.title || '新会话'
    }

    try {
      // 构建生成标题的提示
      const prompt: ChatMessage = {
        role: 'system',
        content:
          '请根据以下对话内容，生成一个简短的标题（不超过20个字符）。只需要返回标题文本，不需要任何解释或额外内容。',
      }

      // 获取前几条消息用于生成标题
      const contextMessages = conversation.messages.slice(0, Math.min(4, conversation.messages.length))

      const response = await client.chat({
        messages: [prompt, ...contextMessages],
        options: {
          stream: false,
          max_tokens: 30,
        },
      })

      const title = response.choices[0].message.content.trim()
      updateTitle(id, title)
      return title
    } catch (error) {
      console.error('生成标题失败:', error)
      return conversation.title
    }
  }

  /**
   * 获取当前会话
   */
  const getCurrentConversation = (): Conversation | null => {
    if (!state.currentId) return null
    return state.conversations.find((conv: Conversation) => conv.id === state.currentId) || null
  }

  // 初始加载会话
  loadConversations()

  return {
    state,
    messageManager,
    createConversation,
    switchConversation,
    deleteConversation,
    updateTitle,
    updateMetadata,
    saveConversations,
    loadConversations,
    generateTitle,
    getCurrentConversation,
  }
}
