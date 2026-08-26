import type { ChatConversationInfo, ChatMessageItem, ChatProcessingState, ChatRequestState } from '../base'
import type { ChatBuiltInModelFeature } from '../runtime'
import type { Component } from 'vue'

export interface ChatUIData {
  readonly conversation?: ChatConversationView
  readonly bubble?: ChatBubbleView
  readonly sender?: ChatSenderView
  readonly model?: ChatModelView
  readonly mcp?: ChatMcpView
  readonly request?: ChatRequestView
}

export interface ChatConversationView {
  readonly items?: readonly ChatConversationInfo[]
  readonly activeId?: string | null
  readonly title?: string
  /** Optional business-owned ordering and grouping for the default history view. */
  readonly history?: ChatHistoryData
}

export type ChatHistoryData = readonly ChatConversationInfo[] | readonly ChatHistoryGroup[]

export interface ChatHistoryGroup {
  readonly group: string | symbol
  readonly items: readonly ChatConversationInfo[]
}

export interface ChatBubbleView {
  readonly messages?: readonly ChatMessageItem[]
}

export interface ChatSenderView {
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly submitDisabled?: boolean
}

export interface ChatRequestView {
  readonly state: ChatRequestState
  readonly processingState?: ChatProcessingState
  readonly error?: unknown
}

export interface ChatModelView {
  readonly options?: readonly ChatModelOptionView[]
  readonly selectedId?: string | null
  readonly features?: Readonly<Partial<Record<ChatBuiltInModelFeature, boolean>>>
  readonly selecting?: boolean
  readonly pendingFeatureIds?: readonly ChatBuiltInModelFeature[]
}

export interface ChatModelOptionView {
  readonly id: string
  readonly label: string
  readonly icon?: Component
  readonly capabilities?: Readonly<Partial<Record<ChatBuiltInModelFeature, boolean>>>
  readonly metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpView {
  readonly servers?: readonly ChatMcpServerView[]
  readonly tools?: ChatMcpToolMap
}

export interface ChatMcpServerView {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly installed: boolean
  readonly enabled: boolean
  readonly loading?: boolean
  readonly error?: unknown
  readonly metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpToolView {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly enabled: boolean
  readonly loading?: boolean
}

export type ChatMcpToolMap = Readonly<Partial<Record<string, readonly ChatMcpToolView[]>>>
