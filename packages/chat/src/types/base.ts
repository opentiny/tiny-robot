/**
 * Read-only reactive value used by the ChatRuntime protocol.
 *
 * Keep this structural instead of exposing Vue's nominal Ref/ComputedRef
 * types. Consumers may use a different compatible Vue installation (for
 * example a workspace package with its own Vue peer), while the protocol only
 * needs the read-only `.value` contract.
 */
export interface ChatReadable<T> {
  readonly value: T
}

/** Writable counterpart used only where an adapter must mirror state out. */
export interface ChatWritable<T> {
  value: T
}

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
