import type { Component, ComputedRef, VNode } from 'vue'
import type {
  BasePluginContext,
  ChatCompletion,
  ChatMessage,
  CompletionChoice,
  ConversationStorageStrategy,
  MessageRequestBody,
  RequestProcessingState,
  RequestState,
  UseConversationReturn,
  UseMessageReturn,
  UseMessageOptions,
  UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'
import type { FeedbackProps } from '@opentiny/tiny-robot'
import type { ChatRuntime } from './runtime'

export type ResponseProvider = (
  requestBody: MessageRequestBody,
  abortSignal: AbortSignal,
) => Promise<ChatCompletion> | AsyncGenerator<ChatCompletion> | Promise<AsyncGenerator<ChatCompletion>>

export type ChatTransportAdapter = ResponseProvider

export type UseMessageResponseProvider = UseMessageOptions['responseProvider']

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type ChatErrorType = 'network' | 'auth' | 'rate_limit' | 'timeout' | 'server' | 'provider' | 'unknown'

export interface ChatErrorInfo {
  type: ChatErrorType
  message: string
  retryable: boolean
  httpStatus?: number
  statusCode?: number
  code?: string
  providerId?: string
  originalError?: unknown
}

export interface ChatMessageActionPayload {
  action: string
  placement?: ChatMessageActionPlacement
  role?: string
  messages: ChatMessage[]
  messageIds: string[]
  messageIndexes: number[]
  message?: ChatMessage
  messageIndex?: number
  messageId?: string
  conversationId?: string
}

export type ChatMessageActionRole = 'assistant' | 'user' | 'tool' | 'system'
export type ChatMessageActionPlacement = 'actions' | 'operations'
export type ChatMessageActionsMode = 'append' | 'replace'

export interface ChatMessageActionContext {
  role?: string
  messages: ChatMessage[]
  messageIds: string[]
  messageIndexes: number[]
  message?: ChatMessage
  messageIndex?: number
  messageId?: string
  runtime?: ChatRuntime | null
  conversationId?: string
}

export interface ChatMessageActionDefinition {
  id: string
  label: string
  icon?: NonNullable<FeedbackProps['actions']>[number]['icon']
  placement?: ChatMessageActionPlacement
  roles?: ChatMessageActionRole[]
  order?: number
  when?: (context: ChatMessageActionContext) => boolean
  onClick?: (context: ChatMessageActionContext) => void | Promise<void>
}

export type ChatMessageActionsInput =
  | ChatMessageActionDefinition[]
  | ((context: ChatMessageActionContext) => ChatMessageActionDefinition[])

export interface ChatMessageTransformChunkContext extends BasePluginContext {
  currentMessage: ChatMessage
  choice?: CompletionChoice
  chunk: ChatCompletion
}

export interface ChatMessageTransformFinishContext extends BasePluginContext {
  message: ChatMessage
}

export interface ChatMessageTransforms {
  onChunk?: (context: ChatMessageTransformChunkContext) => void
  onFinish?: (context: ChatMessageTransformFinishContext) => Partial<ChatMessage> | void
}

export type ChatListVariant = 'bubble' | 'docs' | 'workspace'
export type ChatContentLayout = 'centered' | 'wide'

export type ChatAppearanceMode = 'light' | 'dark' | 'system'

export interface ChatAppearanceConfig {
  mode?: ChatAppearanceMode
}

export interface TrChatProviderRuntimeOptionsBase {
  plugins?: UseMessagePlugin[]
  storage?: ConversationStorageStrategy
  initialMessages?: ChatMessage[]
  messageTransforms?: ChatMessageTransforms
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
}

type TrChatProviderTransportSource =
  | {
      responseProvider: ResponseProvider
      transportAdapter?: never
    }
  | {
      transportAdapter: ChatTransportAdapter
      responseProvider?: never
    }

export type TrChatProviderRuntimeOptions = TrChatProviderTransportSource & TrChatProviderRuntimeOptionsBase

export interface UseChatKitOptions extends TrChatProviderRuntimeOptionsBase {
  responseProvider: ResponseProvider
  onAfterReceive?: (message: ChatMessage) => void
}

export interface UseChatKitRuntimeBridge {
  activeEngine: ComputedRef<UseMessageReturn | null>
  requestState: ComputedRef<RequestState>
  processingState: ComputedRef<RequestProcessingState | undefined>
  isProcessing: ComputedRef<boolean>
  clear: UseConversationReturn['clear']
  saveMessages: UseConversationReturn['saveMessages']
}

export interface UseChatKitReturn extends Pick<
  UseConversationReturn,
  | 'activeConversationId'
  | 'activeConversation'
  | 'createConversation'
  | 'switchConversation'
  | 'deleteConversation'
  | 'updateConversationTitle'
  | 'abortActiveRequest'
> {
  conversations: UseConversationReturn['conversations']
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>
  lastError: ComputedRef<ChatErrorInfo | null>
  sendMessage: (content: string, options?: { attachments?: unknown[] }) => void
  startEditMessage: (messageIndex: number) => void
  cancelEditMessage: (messageIndex: number) => void
  isMessageEditing: (messageIndex: number) => boolean
  editMessage: (messageIndex: number, newContent: string) => void
  updateResponseProvider: (provider: ResponseProvider) => void
  abort: () => Promise<void>
  retry: () => Promise<boolean>
  regenerate: (messageIndex?: number) => Promise<boolean>
  runtime: UseChatKitRuntimeBridge
}

export interface BrandConfig {
  title?: string
  logo?: VNode | Component
}
