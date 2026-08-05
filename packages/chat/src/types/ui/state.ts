import type { ChatConversationInfo, ChatMessageItem } from '../base'

export interface ChatViewState {
  conversation?: ChatConversationView
  messages?: readonly ChatMessageItem[]
  composer?: ChatComposerView
  model?: ChatModelView
  mcp?: ChatMcpView
}

export interface ChatConversationView {
  items?: readonly ChatConversationInfo[]
  activeId?: string | null
  title?: string
}

export interface ChatComposerView {
  loading?: boolean
  disabled?: boolean
  submitDisabled?: boolean
}

export interface ChatModelView {
  options?: readonly ChatModelOptionView[]
  selectedId?: string | null
  features?: Readonly<Record<string, boolean>>
  selecting?: boolean
  pendingFeatureIds?: readonly string[]
}

export interface ChatModelOptionView {
  id: string
  label: string
  capabilities?: Readonly<Record<string, boolean | undefined>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpView {
  servers?: readonly ChatMcpServerView[]
  tools?: ChatMcpToolMap
}

export interface ChatMcpServerView {
  id: string
  name: string
  description?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpToolView {
  id: string
  name: string
  description?: string
  enabled: boolean
  loading?: boolean
}

export type ChatMcpToolMap = Readonly<Partial<Record<string, readonly ChatMcpToolView[]>>>
