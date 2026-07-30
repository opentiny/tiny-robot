import type {
  ChatConversationInfo,
  ChatMessageItem,
  ChatProcessingState,
  ChatReadable,
  ChatRequestState,
  ChatStructuredData,
} from './base'

export interface ChatConversation extends ChatConversationInfo {
  messages: readonly ChatMessageItem[]
  requestState: ChatRequestState
  processingState?: ChatProcessingState
  lastError?: unknown | null
}

export type ChatReasoningEffort = 'low' | 'medium' | 'high' | 'max'

export interface ChatRunConfigReasoning {
  enabled: boolean
  effort?: ChatReasoningEffort
}

export interface ChatRunConfig {
  modelId?: string
  mcpServerIds?: readonly string[]
  features?: Readonly<Record<string, boolean>>
  reasoning?: ChatRunConfigReasoning
}

export interface ChatModelOption {
  id: string
  label: string
  capabilities?: Readonly<Record<string, boolean | undefined>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatModelRuntime {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  select: (id: string | null) => Promise<void> | void
  features: ChatReadable<Readonly<Record<string, boolean>>>
  setFeature: (id: string, enabled: boolean) => Promise<void> | void
}

export interface ChatMcpServerInfo {
  id: string
  name: string
  description?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpRuntime {
  servers: ChatReadable<readonly ChatMcpServerInfo[]>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
}

export interface ChatRuntimeSender {
  disabled: ChatReadable<boolean>
  runConfig?: ChatReadable<Readonly<ChatRunConfig>>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
  runConfig?: ChatRunConfig
}

export interface ChatRuntimeActions {
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  createConversation: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation: (id: string) => Promise<void> | void
  renameConversation: (id: string, title: string) => Promise<void> | void
  deleteConversation: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}
