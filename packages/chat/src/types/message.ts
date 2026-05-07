import type { Ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import type { ChatErrorInfo } from './core'

export type ReadonlyRef<T> = Readonly<Ref<T>>

export type ChatUIMessageRole = 'system' | 'user' | 'assistant' | 'tool' | ''

export type ChatUIMessagePart =
  | { type: 'text'; text: string }
  | { type: 'attachment'; attachment: Attachment }
  | { type: 'unknown'; value: unknown }

export interface ChatUIMessageMeta {
  conversationId?: string
  parentMessageId?: string
  turnId?: string
  model?: string
}

export interface ChatUIMessage {
  id: string
  role: ChatUIMessageRole
  createdAt?: number
  parts: ChatUIMessagePart[]
  meta?: ChatUIMessageMeta
  raw?: unknown
}

export interface ChatMessageViewState {
  status?: 'pending' | 'streaming' | 'done' | 'error'
  error?: ChatErrorInfo
  editing?: boolean
  optimistic?: boolean
  capabilities?: {
    editable?: boolean
    retryable?: boolean
    regeneratable?: boolean
    feedbackable?: boolean
  }
}

export interface ChatSendInput {
  text: string
  attachments?: Attachment[]
  modelId?: string | null
}

export interface ChatBeforeSendInput {
  text: string
  attachments?: Attachment[]
}

export type ChatBeforeSendHandler = (
  input: ChatBeforeSendInput,
) =>
  | ChatBeforeSendInput
  | Partial<ChatBeforeSendInput>
  | false
  | void
  | Promise<ChatBeforeSendInput | Partial<ChatBeforeSendInput> | false | void>

export type ChatErrorHandler = (error: ChatErrorInfo | Error) => void

export type ChatAfterReceiveHandler = (message: ChatMessage) => void

export interface ChatConversationSummary {
  id: string
  title?: string
}

export interface ChatConversationCreateInput {
  title?: string
}
