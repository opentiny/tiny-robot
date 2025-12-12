import type { ComputedRef, Ref } from 'vue'
import { MaybePromise } from '../../types'
import { ChatMessage, UseMessageOptions, UseMessageReturn } from '../message/types'

export interface ConversationInfo {
  id: string
  title?: string
}

export interface Conversation extends ConversationInfo {
  /**
   * Message engine instance created by useMessage.
   */
  engine: UseMessageReturn
}

export interface ConversationStorageStrategy {
  /**
   * Load all conversations (id and title only).
   */
  loadConversations: () => MaybePromise<ConversationInfo[]>
  /**
   * Load all messages for a given conversation.
   */
  loadMessages: (conversationId: string) => MaybePromise<ChatMessage[]>
  /**
   * Persist conversation metadata (create or update).
   */
  saveConversation: (conversation: ConversationInfo) => MaybePromise<void>
  /**
   * Persist messages for a given conversation.
   */
  saveMessages: (conversationId: string, messages: ChatMessage[]) => MaybePromise<void>
  /**
   * Optional method to delete a conversation and its messages.
   */
  deleteConversation?: (conversationId: string) => MaybePromise<void>
}

export interface UseConversationOptions {
  /**
   * Base useMessage options for all conversations.
   * Per-conversation options passed to createConversation will be merged on top of this.
   */
  useMessageOptions: UseMessageOptions
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
  createConversation: (params?: { id?: string; title?: string; useMessageOptions?: UseMessageOptions }) => Conversation
  switchConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title?: string) => void
  saveConversationMessages: (id: string) => void
  sendMessage: (content: string) => void
  abortActiveRequest: () => void
}
