import './styles/index.css'

import {
  ChatLayout as TrChatLayout,
  ChatHeader as TrChatHeader,
  ChatWelcome as TrChatWelcome,
  ChatMessageList as TrChatMessageList,
  ChatFooter as TrChatFooter,
  ChatSender as TrChatSender,
} from './components'
import { TrChat, TrChatRoot, TrChatPage, TrChatProvider } from './entry'
import {
  ChatWorkspaceLayout as TrChatWorkspaceLayout,
  WorkspaceShell as TrChatWorkspaceShell,
  ChatWorkspaceRightSheet as TrChatWorkspaceRightSheet,
} from './components/workspace'
import { ChatAttachments as TrChatAttachments } from './components/attachments'
import { ChatFeedback as TrChatFeedback } from './components/feedback'
import { ChatHistory as TrChatHistory } from './components/history'
import { McpTrigger as TrMcpTrigger } from './components/mcp'
import { ModelSelector as TrModelSelector } from './components/model-selector'

type TrChatWithSubComponents = typeof TrChat & {
  Root: typeof TrChatRoot
  Page: typeof TrChatPage
  Provider: typeof TrChatProvider
  Layout: typeof TrChatLayout
  WorkspaceLayout: typeof TrChatWorkspaceLayout
  Header: typeof TrChatHeader
  Welcome: typeof TrChatWelcome
  MessageList: typeof TrChatMessageList
  Footer: typeof TrChatFooter
  Attachments: typeof TrChatAttachments
  Sender: typeof TrChatSender
  Feedback: typeof TrChatFeedback
  History: typeof TrChatHistory
  ModelSelector: typeof TrModelSelector
  McpTrigger: typeof TrMcpTrigger
  WorkspaceShell: typeof TrChatWorkspaceShell
  WorkspaceRightSheet: typeof TrChatWorkspaceRightSheet
}

const TrChatFull = TrChat as TrChatWithSubComponents
TrChatFull.Root = TrChatRoot
TrChatFull.Page = TrChatPage
TrChatFull.Provider = TrChatProvider
TrChatFull.Layout = TrChatLayout
TrChatFull.WorkspaceLayout = TrChatWorkspaceLayout
TrChatFull.Header = TrChatHeader
TrChatFull.Welcome = TrChatWelcome
TrChatFull.MessageList = TrChatMessageList
TrChatFull.Footer = TrChatFooter
TrChatFull.Attachments = TrChatAttachments
TrChatFull.Sender = TrChatSender
TrChatFull.Feedback = TrChatFeedback
TrChatFull.History = TrChatHistory
TrChatFull.ModelSelector = TrModelSelector
TrChatFull.McpTrigger = TrMcpTrigger
TrChatFull.WorkspaceShell = TrChatWorkspaceShell
TrChatFull.WorkspaceRightSheet = TrChatWorkspaceRightSheet

export { TrChatFull as TrChat }

export { useMcpManager } from './components/mcp/useMcpManager'

export { TrMcpTrigger, TrChatFeedback }

export { createRuntimeFromConfig } from './runtime/config'

export type {
  ChatBeforeSendInput,
  ChatBeforeSendHandler,
  ChatRuntimeInput,
  ChatSendInput,
  ChatUIMessage,
  ChatContentLayout,
  ChatTransportAdapter,
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ResponseProvider,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatMessageActionPayload,
  ChatMessageTransformChunkContext,
  ChatMessageTransformFinishContext,
  ChatMessageTransforms,
  ChatListVariant,
  TrChatProviderRuntimeOptions,
  TrChatProps,
  TrChatProviderProps,
  TrChatHeaderProps,
  TrChatHeaderEmits,
  TrChatHeaderSlots,
  TrChatHistoryProps,
  TrChatWelcomeProps,
  TrChatWelcomeEmits,
  TrChatMessageListProps,
  TrChatPageEmits,
  TrChatPageMessageListSlotProps,
  TrChatPageProps,
  TrChatPageSenderSlotProps,
  TrChatPageSlots,
  TrChatSenderProps,
  TrChatSenderSlots,
  ModelOption,
  CreateRuntimeFromConfigResult,
  TrChatConfig,
  TrChatConfigEntryInput,
  TrChatTransportConfig,
  TrChatRootProps,
  TrChatRootUiConfig,
  TrChatWorkspaceShellProps,
} from './types'
