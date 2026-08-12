import type { ChatConversationInfo, ChatMessageItem, ChatProcessingState, ChatRequestState } from '../base'

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
  readonly features?: Readonly<Record<string, boolean>>
  readonly selecting?: boolean
  readonly pendingFeatureIds?: readonly string[]
}

export interface ChatModelOptionView {
  readonly id: string
  readonly label: string
  readonly capabilities?: Readonly<Record<string, boolean | undefined>>
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
