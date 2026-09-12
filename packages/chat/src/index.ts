export { default as TrChat } from './Chat.vue'
export { default as TrChatUI } from './ChatUI.vue'
export { useKitChatRuntime } from './runtime/useKitChatRuntime'
export { useLocalChatRuntime } from './runtime/useLocalChatRuntime'
export { useChatRuntimeAdapter } from './composables/useChatRuntimeAdapter'
export { useChatHistoryData, useChatHistoryItems } from './composables/useChatHistoryItems'
export { CHAT_MCP_RIGHT_ASIDE_PANEL_ID } from './types'

export type * from './types'

export type {
  LayoutFloatingDragDetail,
  LayoutFloatingOptions,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
} from '@opentiny/tiny-robot'

export type { UseKitChatRuntimeOptions } from './runtime/useKitChatRuntime'
export type { UseLocalChatRuntimeMcpAdapter, UseLocalChatRuntimeOptions } from './runtime/useLocalChatRuntime'
export type { UseChatRuntimeAdapterOptions } from './composables/useChatRuntimeAdapter'
export type {
  ChatHistoryDisplayData,
  ChatHistoryItem,
  UseChatHistoryDataOptions,
  UseChatHistoryItemsOptions,
} from './composables/useChatHistoryItems'
export type { ChatMcpServerConfig, ChatMcpServers } from './runtime/mcp/types'
export type {
  ChatProviderConfig,
  ChatProviderFeatureBody,
  ChatProviderModelConfig,
  ChatProviderType,
} from './runtime/provider'
