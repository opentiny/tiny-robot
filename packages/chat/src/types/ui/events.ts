import type { HistoryMenuItem, PromptProps } from '@opentiny/tiny-robot'
import type { ChatConversationInfo, ChatStructuredData } from '../base'

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
}
export interface ChatHistoryActionEvent {
  action: HistoryMenuItem
  conversation: ChatConversationInfo
}

export interface ChatPromptClickEvent {
  event: MouseEvent
  item: PromptProps
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
  'update:composerValue': [value: string]
  submit: [payload: ChatSubmitPayload]
  cancel: []
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  createConversation: []
  switchConversation: [payload: { id: string }]
  renameConversation: [payload: { id: string; title: string }]
  deleteConversation: [payload: { id: string }]
  historyAction: [payload: ChatHistoryActionEvent]
  promptClick: [payload: ChatPromptClickEvent]
  bubbleStateChange: [payload: ChatBubbleStateChangePayload]
  bubbleEvent: [payload: ChatBubbleEventPayload]
  selectModel: [payload: { id: string | null }]
  updateModelFeature: [payload: { id: string; enabled: boolean }]
  addMcpServer: [payload: { id: string }]
  removeMcpServer: [payload: { id: string }]
  loadMcpTools: [payload: { serverId: string }]
  updateMcpServerEnabled: [payload: { id: string; enabled: boolean }]
  updateMcpToolEnabled: [payload: { serverId: string; toolId: string; enabled: boolean }]
}
