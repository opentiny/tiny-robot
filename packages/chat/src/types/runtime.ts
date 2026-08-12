import type { ChatConversationInfo, ChatMessageItem, ChatProcessingState, ChatReadable, ChatRequestState } from './base'
import type { ChatSendPayload } from './commands'

export interface ChatConversation extends ChatConversationInfo {
  messages: readonly ChatMessageItem[]
  requestState: ChatRequestState
  processingState?: ChatProcessingState
  lastError?: unknown | null
}

export type ChatReasoningEffort = 'low' | 'medium' | 'high' | 'max'
export const CHAT_BUILT_IN_MODEL_FEATURES = ['thinking', 'search'] as const
export type ChatBuiltInModelFeature = (typeof CHAT_BUILT_IN_MODEL_FEATURES)[number]

export interface ChatRunConfigReasoning {
  enabled: boolean
  effort?: ChatReasoningEffort
}

export interface ChatRunConfig {
  modelId?: string
  features?: Readonly<Partial<Record<ChatBuiltInModelFeature, boolean>>>
  reasoning?: ChatRunConfigReasoning
  mcp?: ChatMcpRunConfig
}

export interface ChatMcpRunConfig {
  serverIds: readonly string[]
  toolIds: Readonly<Record<string, readonly string[]>>
}

export interface ChatModelOption {
  id: string
  label: string
  capabilities?: Readonly<Partial<Record<ChatBuiltInModelFeature, boolean>>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatModelRuntime {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  features: ChatReadable<Readonly<Partial<Record<ChatBuiltInModelFeature, boolean>>>>
  reasoning?: ChatReadable<ChatRunConfigReasoning>
  select: (id: string | null) => Promise<void> | void
  setFeature: (id: ChatBuiltInModelFeature, enabled: boolean) => Promise<void> | void
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

export interface ChatMcpToolInfo {
  id: string
  name: string
  description?: string
  enabled: boolean
}

export type ChatMcpToolState = Readonly<Partial<Record<string, readonly ChatMcpToolInfo[]>>>

export interface ChatMcpRuntime {
  servers: ChatReadable<readonly ChatMcpServerInfo[]>
  tools: ChatReadable<ChatMcpToolState>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
  setToolEnabled: (serverId: string, toolId: string, enabled: boolean) => Promise<void> | void
}

export interface ChatComposerRuntime {
  disabled?: ChatReadable<boolean>
  submitDisabled?: ChatReadable<boolean>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatRuntimeActions {
  send: (payload: ChatSendPayload) => Promise<boolean>
  abort?: () => Promise<void> | void
  createConversation: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation: (id: string) => Promise<void> | void
  renameConversation: (id: string, title: string) => Promise<void> | void
  deleteConversation: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}
