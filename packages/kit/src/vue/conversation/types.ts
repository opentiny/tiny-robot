import type { ComputedRef, Ref } from 'vue'
import { ConversationStorageStrategy } from '../../storage'
import { UseMessageOptions, UseMessageReturn } from '../message/types'

export interface ConversationInfo {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title?: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
}

export interface Conversation extends ConversationInfo {
  /**
   * Message engine instance created by useMessage.
   */
  engine: UseMessageReturn
}

export interface UseConversationOptions {
  /**
   * Base useMessage options for all conversations.
   * Per-conversation options passed to createConversation will be merged on top of this.
   */
  useMessageOptions: UseMessageOptions
  /**
   * Whether to automatically save messages when they are changed.
   * @default false
   */
  autoSaveMessages?: boolean
  /**
   * Throttle time in milliseconds for auto-save operations.
   * Ensures messages are saved at most once per this interval during streaming updates.
   * Only effective when autoSaveMessages is true.
   * @default 1000
   */
  autoSaveThrottle?: number
  /**
   * Optional storage strategy for conversations and messages.
   * When provided, conversation list and messages can be loaded and persisted.
   */
  storage?: ConversationStorageStrategy
}

export interface UseConversationReturn {
  conversations: Ref<ConversationInfo[]>
  activeConversationId: Ref<string | null>
  activeConversation: ComputedRef<Conversation | null>
  createConversation: (params?: {
    /** 会话ID，不提供则自动生成 */
    id?: string
    /** 会话标题 */
    title?: string
    /** 自定义元数据 */
    metadata?: Record<string, unknown>
    /** 覆盖默认的消息选项 */
    useMessageOptions?: Partial<UseMessageOptions>
  }) => Conversation
  switchConversation: (id: string) => Promise<Conversation | null>
  deleteConversation: (id: string) => Promise<void>
  clear: () => void
  updateConversationTitle: (id: string, title?: string) => void
  saveMessages: (id?: string) => void
  sendMessage: (content: string) => void
  abortActiveRequest: () => Promise<void>
}
