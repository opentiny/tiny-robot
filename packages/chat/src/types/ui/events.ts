import type { ChatConversationInfo, ChatStructuredData } from '../base'

export interface ChatAsideOpenChangePayload {
  readonly open: boolean
  readonly source: 'user' | 'viewport'
}

export interface ChatSubmitPayload {
  readonly text: string
  readonly structuredData?: ChatStructuredData
}

export interface ChatHistoryActionPayload {
  readonly action: import('@opentiny/tiny-robot').HistoryMenuItem
  readonly conversation: ChatConversationInfo
}

export interface ChatPromptClickPayload {
  readonly event: MouseEvent
  readonly item: import('@opentiny/tiny-robot').PromptProps
}

export interface ChatModelSelectPayload {
  readonly id: string | null
}

export interface ChatModelFeatureChangePayload {
  readonly id: string
  readonly enabled: boolean
}

export interface ChatMcpAddServerPayload {
  readonly id: string
}

export interface ChatMcpRemoveServerPayload {
  readonly id: string
}

export interface ChatMcpServerEnabledChangePayload {
  readonly id: string
  readonly enabled: boolean
}

export interface ChatMcpToolEnabledChangePayload {
  readonly serverId: string
  readonly toolId: string
  readonly enabled: boolean
}

export type ChatBubbleStateChangePayload = {
  readonly key: string
  readonly value: unknown
  readonly messageIndex: number
  readonly contentIndex: number
}

export type ChatBubbleEventPayload = {
  readonly name: string
  readonly payload?: unknown
  readonly messageIndex: number
  readonly contentIndex: number
}

export interface ChatUIEmits {
  'update:inputValue': [value: string]
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  'create-conversation': []
  'switch-conversation': [payload: { readonly id: string }]
  'rename-conversation': [payload: { readonly id: string; readonly title: string }]
  'delete-conversation': [payload: { readonly id: string }]
  'history-action': [payload: ChatHistoryActionPayload]
  'prompt-click': [payload: ChatPromptClickPayload]
  'bubble-state-change': [payload: ChatBubbleStateChangePayload]
  'bubble-event': [payload: ChatBubbleEventPayload]
  'model-select': [payload: ChatModelSelectPayload]
  'model-feature-change': [payload: ChatModelFeatureChangePayload]
  'mcp-add-server': [payload: ChatMcpAddServerPayload]
  'mcp-remove-server': [payload: ChatMcpRemoveServerPayload]
  'mcp-server-enabled-change': [payload: ChatMcpServerEnabledChangePayload]
  'mcp-tool-enabled-change': [payload: ChatMcpToolEnabledChangePayload]
  'left-aside-open-change': [payload: ChatAsideOpenChangePayload]
  'right-aside-open-change': [payload: ChatAsideOpenChangePayload]
}
