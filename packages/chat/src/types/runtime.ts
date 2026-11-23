import type {
  ChatConversationInfo,
  ChatIcon,
  ChatMessageItem,
  ChatProcessingState,
  ChatReadable,
  ChatRequestState,
} from './base'
import type { ChatSendPayload } from './commands'
import type {
  McpRuntime,
  McpServerInfo,
  McpToolInfo,
  McpToolState,
  ModelSelectorField,
  ModelSelectorFeatureValue,
  ModelSelectorFeatureValues,
  ModelSelectorProps,
} from '@opentiny/tiny-robot'

export interface ChatConversation extends ChatConversationInfo {
  messages: readonly ChatMessageItem[]
  requestState: ChatRequestState
  processingState?: ChatProcessingState
}

export interface ChatRunConfig {
  modelId?: string
  featureValues?: ModelSelectorFeatureValues
  mcp?: ChatMcpRunConfig
}

export type ChatBeforeSendResult = 'continue' | 'handled' | 'reject'

export interface ChatBeforeSendContext {
  readonly payload: ChatSendPayload
  readonly runConfig?: Readonly<ChatRunConfig>
  readonly model?: Readonly<ChatModelOption>
  readonly mcp?: Readonly<{
    servers: readonly ChatMcpServerInfo[]
    tools: ChatMcpToolState
  }>
}

export type ChatBeforeSend = (context: ChatBeforeSendContext) => ChatBeforeSendResult | Promise<ChatBeforeSendResult>

export interface ChatMcpRunConfig {
  serverIds: readonly string[]
  toolIds: Readonly<Record<string, readonly string[]>>
}

export interface ChatModelOption {
  id: string
  label: string
  description?: string
  icon?: ChatIcon
  disabled?: boolean
  group?: string
  features?: readonly ModelSelectorField[]
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatModelRuntime {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  featureValues?: ChatReadable<ModelSelectorFeatureValues>
  renderTriggerText?: ModelSelectorProps['renderTriggerText']
  setFeatureValue?: (change: ChatModelFeatureValueUpdate) => Promise<void> | void
  select: (id: string | null) => Promise<void> | void
}

export interface ChatModelFeatureValueUpdate {
  modelId: string
  key: string
  value: ModelSelectorFeatureValue
}

export type ChatMcpServerInfo = McpServerInfo
export type ChatMcpToolInfo = McpToolInfo
export type ChatMcpToolState = McpToolState
export type ChatMcpRuntime = McpRuntime

export interface ChatComposerRuntime {
  disabled?: ChatReadable<boolean>
  submitDisabled?: ChatReadable<boolean>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatRuntimeActions {
  send: (payload: ChatSendPayload) => Promise<boolean>
  abort?: () => Promise<void> | void
  clearActiveConversation: () => Promise<void> | void
  createConversation: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation: (id: string) => Promise<void> | void
  renameConversation: (id: string, title: string) => Promise<void> | void
  deleteConversation: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  conversationNavigationRevision?: ChatReadable<number>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}
