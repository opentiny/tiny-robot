import type { ComputedRef, Ref } from 'vue'

export type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export type ChatRequestState = 'idle' | 'processing' | 'completed' | 'aborted' | 'error'

export type ChatProcessingState = 'requesting' | 'completing' | string

export interface ChatConversationInfo {
  id: string
  title: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface ChatMessagePart {
  type: string
  [key: string]: unknown
}

export type ChatMessageContent = string | ChatMessagePart[]

export interface ChatToolCall {
  id: string
  type: 'function' | string
  function: {
    name: string
    arguments: string
  }
}

export interface ChatMessageItem<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  role?: string
  content?: T
  reasoning_content?: string
  tool_calls?: ChatToolCall[]
  tool_call_id?: string
  name?: string
  id?: string
  loading?: boolean
  state?: S
  metadata?: Record<string, unknown>
}

export interface ChatStructuredDataItem {
  type: string
  [key: string]: unknown
}

export type ChatStructuredData = ChatStructuredDataItem[]
