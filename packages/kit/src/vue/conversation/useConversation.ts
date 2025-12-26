/**
 * useConversation composable
 * 提供会话管理和持久化功能
 */

import { reactive, watch } from 'vue'
import type { ChatMessage } from '../../types'
import { useMessage, type UseMessageOptions, type UseMessageReturn } from '../message/useMessage'
import type { AIClient } from '../../client'
import type { Conversation, ConversationState } from './types'
import {
  createStorageStrategy,
  type ConversationStorageStrategy,
  type StorageConfig,
  type StorageType,
} from './storage'

export type { Conversation, ConversationState } from './types'
export type { StorageConfig, StorageType } from './storage'

export type UseConversationEvents = UseMessageOptions['events'] & {
  onLoaded?: (conversations: Conversation[]) => void
}

/**
 * useConversation选项接口
 */
export interface UseConversationOptions {
  /** AI客户端实例 */
  client: AIClient
  /** 存储类型 (default: 'localStorage') */
  storageType?: StorageType
  /** 自定义存储策略（优先级高于 storageType） */
  storage?: ConversationStorageStrategy
  /** 存储配置 */
  storageConfig?: StorageConfig
  /** 是否自动保存 */
  autoSave?: boolean
  /** 是否允许空会话 */
  allowEmpty?: boolean
  /** 是否默认使用流式响应 */
  useStreamByDefault?: boolean
  /** 错误消息模板 */
  errorMessage?: string
  /** 事件回调 */
  events?: UseConversationEvents
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
    storage,
    storageType,
    storageConfig,
    autoSave = true,
    allowEmpty = false,
    useStreamByDefault = true,
    errorMessage = '请求失败，请稍后重试',
    events,
  } = options

  // 使用自定义策略或创建默认策略
  const storageInstance = storage || createStorageStrategy(storageType, storageConfig)

  // 会话状态
  const state = reactive<ConversationState>({
    conversations: [],
    currentId: null,
    loading: false,
  })

  // 标记是否已经触发过 onLoaded 回调
  let hasTriggeredOnLoaded = false

  // 消息管理
  const messageManager = useMessage({
    client,
    useStreamByDefault,
    errorMessage,
    initialMessages: [],
    events: {
      onReceiveData: events?.onReceiveData,
      onFinish: events?.onFinish,
    },
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
    // 空会话则不再创建新会话
    if (!allowEmpty && messageManager.messages.value.length === 0 && state.currentId) {
      return state.currentId
    }

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
      // 将响应式对象转换为普通对象，避免 IndexedDB 的 DataCloneError
      const plainConversations = JSON.parse(JSON.stringify(state.conversations))
      await storageInstance.saveConversations(plainConversations)
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
      const conversations = await storageInstance.loadConversations()
      state.conversations = conversations

      // 如果有会话，默认选中第一个
      if (conversations.length > 0 && !state.currentId) {
        switchConversation(conversations[0].id)
      }

      // 仅在第一次加载完成后触发 onLoaded 回调
      if (!hasTriggeredOnLoaded && events?.onLoaded) {
        hasTriggeredOnLoaded = true
        events.onLoaded(conversations)
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
