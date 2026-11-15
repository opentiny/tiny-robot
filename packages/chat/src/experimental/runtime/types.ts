import type {
  ChatMessage,
  ConversationInfo,
  ConversationStorageStrategy,
  ResponseProvider,
  UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'
import type { ChatBeforeSend, ChatRuntime, ChatTransformSendPayload } from '../../types'
import type { UseChatRuntimeMcpAdapter } from '../../runtime/useChatRuntime'
import type { ChatMcpServers } from '../../runtime/mcp/types'
import type { ChatProviderConfig } from '../../runtime/provider'

export interface CreateChatRuntimeComposerOptions {
  disabled?: boolean
  submitDisabled?: boolean
}

export interface CreateChatRuntimeOptions {
  responseProvider?: ResponseProvider
  initialMessages?: readonly ChatMessage[]
  storage?: ConversationStorageStrategy
  storageKey?: string
  autoSaveMessages?: boolean
  autoSaveThrottle?: number
  onLoad?: (conversations: readonly ConversationInfo[]) => void
  titleGenerator?: (text: string) => string
  beforeSend?: ChatBeforeSend
  transformSendPayload?: ChatTransformSendPayload
  plugins?: readonly UseMessagePlugin[]
  composer?: CreateChatRuntimeComposerOptions
  modelProviders?: readonly ChatProviderConfig[]
  mcp?: UseChatRuntimeMcpAdapter
  mcpServers?: ChatMcpServers
}

export interface CreateChatRuntimeResult {
  readonly runtime: ChatRuntime
  dispose(): Promise<void>
}
