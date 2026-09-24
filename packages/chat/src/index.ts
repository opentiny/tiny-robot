export { default as TrChat } from './Chat.vue'
export { default as TrChatUI } from './ChatUI.vue'
export { useChatRuntimeFromConversation } from './runtime/useChatRuntimeFromConversation'
export { useChatRuntime } from './runtime/useChatRuntime'
export { ERROR_STATE_PLUGIN_NAME, errorStatePlugin } from './runtime/plugins/errorStatePlugin'
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

export type { UseChatRuntimeFromConversationOptions } from './runtime/useChatRuntimeFromConversation'
export type { UseChatRuntimeMcpAdapter, UseChatRuntimeOptions } from './runtime/useChatRuntime'
export type { ChatErrorPluginContext, ErrorStatePluginOptions } from './runtime/plugins/errorStatePlugin'
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
