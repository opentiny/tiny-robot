export { default as TrChat } from './Chat.vue'

export { useKitChatRuntime } from './composables/useKitChatRuntime'
export { useLocalChatRuntime } from './composables/useLocalChatRuntime'

export type {
  ChatConversationItem,
  ChatFooterSlotProps,
  ChatHeaderSlotProps,
  ChatHistorySlotProps,
  ChatMainSlotProps,
  ChatMessageContent,
  ChatMessageItem,
  ChatMessagePart,
  ChatRuntime,
  ChatRuntimeActions,
  ChatRuntimeConversations,
  ChatRuntimeMessages,
  ChatRuntimeSender,
  ChatSenderDefaultActions,
  ChatSenderUi,
  ChatStructuredData,
  ChatStructuredDataItem,
  ChatSubmitPayload,
  ChatToolCall,
  ChatUi,
} from './types'
