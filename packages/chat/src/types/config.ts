import type { ChatMessage, ConversationStorageStrategy } from '@opentiny/tiny-robot-kit'
import type {
  BrandConfig,
  ChatAppearanceConfig,
  ChatContentLayout,
  ChatMessageActionDefinition,
  ChatMessageActionsMode,
  ChatMessageTransforms,
} from './core'
import type { ModelOption } from './model'
import type {
  ChatAttachmentsListConfig,
  ChatAttachmentsUploadConfig,
  ChatBubbleRenderers,
  ChatMessagesOverrides,
  ChatSenderActionVoiceConfig,
  WelcomeConfig,
} from './component'
import type { ChatShellVariant, ChatWorkspaceRegionConfig } from './workspace'
import type { ChatBeforeSendHandler, ChatAfterReceiveHandler, ChatErrorHandler } from './message'
import type { ChatRuntimeInput } from './runtime'
import type { UseMcpManagerReturn } from '../components/mcp/useMcpManager'

export interface TrChatRootUiConfig {
  brand?: BrandConfig
  welcome?: WelcomeConfig
  appearance?: ChatAppearanceConfig
  contentLayout?: ChatContentLayout
  labels?: ChatMessagesOverrides
}

export interface TrChatRootProps {
  runtime: ChatRuntimeInput
  ui?: TrChatRootUiConfig
  mcpManager?: UseMcpManagerReturn
}

export interface TrChatRequestModel {
  id: string
  providerId: string
  label?: string
  icon?: ModelOption['icon']
  disabled?: boolean
}

export interface TrChatTransportConfig {
  type?: 'openai-compatible'
  endpoint?: string
  baseURL?: string
  apiPath?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

export interface TrChatRequestConfig {
  providers: Record<string, TrChatTransportConfig>
  models: TrChatRequestModel[]
  defaultModelId?: string | null
  systemPrompt?: string
}

export interface TrChatConversationConfig {
  initialMessages?: ChatMessage[]
  persistence?: ConversationStorageStrategy
}

export type TrChatUiConfig = TrChatRootUiConfig

export interface TrChatSenderConfig {
  placeholder?: string
  mode?: 'single' | 'multiple'
  maxLength?: number
  wordCount?: boolean
  voice?: ChatSenderActionVoiceConfig
}

export interface TrChatAttachmentsConfig {
  enabled?: boolean
  upload?: ChatAttachmentsUploadConfig
  list?: ChatAttachmentsListConfig
}

export interface TrChatHistoryConfig {
  enabled?: boolean
  defaultOpen?: boolean
}

export interface TrChatWorkspaceConfig {
  enabled?: boolean
  left?: ChatWorkspaceRegionConfig
  right?: ChatWorkspaceRegionConfig
  defaultView?: ChatShellVariant
}

export interface TrChatMessagesConfig {
  actions?: ChatMessageActionDefinition[]
  actionMode?: ChatMessageActionsMode
  renderers?: ChatBubbleRenderers
  feedback?: { enabled?: boolean }
  transforms?: ChatMessageTransforms
}

export interface TrChatLifecycleConfig {
  beforeSend?: ChatBeforeSendHandler
  afterReceive?: ChatAfterReceiveHandler
  error?: ChatErrorHandler
}

export interface TrChatConfig {
  request: TrChatRequestConfig
  conversation?: TrChatConversationConfig
  ui?: TrChatUiConfig
  workspace?: TrChatWorkspaceConfig
  sender?: TrChatSenderConfig
  attachments?: TrChatAttachmentsConfig
  history?: TrChatHistoryConfig
  messages?: TrChatMessagesConfig
  lifecycle?: TrChatLifecycleConfig
}

export type TrChatConfigEntryInput = TrChatConfig | string

export interface CreateRuntimeFromConfigResult {
  runtime: ChatRuntimeInput
  ui: TrChatRootUiConfig
  dispose: () => void
}
