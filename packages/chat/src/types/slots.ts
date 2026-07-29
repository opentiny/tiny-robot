import type { ChatConversationInfo, ChatMessageItem, ChatProcessingState, ChatRequestState } from './base'
import type { ChatRuntimeActions, ChatSubmitPayload } from './runtime'

export interface ChatHeaderSlotProps {
  title: string
  requestState: ChatRequestState
  processingState: ChatProcessingState | undefined
  lastError: unknown | null
  createConversation: ChatRuntimeActions['createConversation']
}

export interface ChatHistorySlotProps {
  items: readonly ChatConversationInfo[]
  activeId: string | null
  switchConversation: ChatRuntimeActions['switchConversation']
  renameConversation: ChatRuntimeActions['renameConversation']
  deleteConversation: ChatRuntimeActions['deleteConversation']
  createConversation: ChatRuntimeActions['createConversation']
}

export interface ChatMainSlotProps {
  messages: readonly ChatMessageItem[]
  requestState: ChatRequestState
  processingState: ChatProcessingState | undefined
  lastError: unknown | null
}

export interface ChatFooterSlotProps {
  inputValue: string
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  disabled: boolean
  loading: boolean
  submitDisabled: boolean
}
