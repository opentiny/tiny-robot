import type { ChatStructuredData } from '../base'

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
}

export type ChatBubbleStateChangePayload = {
  key: string
  value: unknown
  messageIndex: number
  contentIndex: number
}

export type ChatBubbleEventPayload = {
  name: string
  payload?: unknown
  messageIndex: number
  contentIndex: number
}

export interface ChatUIEmits {
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  createConversation: []
  switchConversation: [payload: { id: string }]
  renameConversation: [payload: { id: string; title: string }]
  deleteConversation: [payload: { id: string }]
}
