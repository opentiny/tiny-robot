import type { ChatConversationInfo, ChatIcon, ChatMessageItem, ChatProcessingState, ChatRequestState } from '../base'
import type { ModelSelectorField, ModelSelectorFeatureValues, ModelSelectorProps } from '@opentiny/tiny-robot'

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
}

export interface ChatModelView {
  readonly featureValues?: ModelSelectorFeatureValues
  readonly renderTriggerText?: ModelSelectorProps['renderTriggerText']
  readonly pendingFeatureKeys?: readonly string[]
  readonly featureValuesDisabled?: boolean
  readonly options?: readonly ChatModelOptionView[]
  readonly selectedId?: string | null
  readonly selecting?: boolean
}

export interface ChatModelOptionView {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly icon?: ChatIcon
  readonly disabled?: boolean
  readonly group?: string
  readonly features?: readonly ModelSelectorField[]
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
  readonly icon?: string
  readonly category?: string
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
