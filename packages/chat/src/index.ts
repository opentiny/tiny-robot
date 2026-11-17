export { default as TrChat } from './Chat.vue'
export { default as TrChatUI } from './ChatUI.vue'
export { useChatRenderContext } from './composables/useChatRenderContext'
export type { ChatRenderContext } from './composables/useChatRenderContext'
export { useChatRuntimeFromConversation } from './runtime/useChatRuntimeFromConversation'
export { useChatRuntime } from './runtime/useChatRuntime'
export { createCompositeMcpAdapter } from './runtime/mcp/compositeMcpAdapter'
export { createWebMcpAdapter } from './runtime/mcp/createWebMcpAdapter'
export { createWebMcpToolSource, normalizeWebMcpInputSchema, readWebMcpToolText } from './runtime/mcp/webmcpToolSource'
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

export type {
  KitRuntimeSendPayload,
  UseChatRuntimeFromConversationOptions,
} from './runtime/useChatRuntimeFromConversation'
export type {
  UseChatRuntimeMcp,
  UseChatRuntimeMcpAdapter,
  UseChatRuntimeMcpOptions,
  UseChatRuntimeOptions,
} from './runtime/useChatRuntime'
export type {
  ChatMcpAdapter,
  CompositeMcpAdapter,
  CreateCompositeMcpAdapterOptions,
} from './runtime/mcp/compositeMcpAdapter'
export type { ChatErrorPluginContext, ErrorStatePluginOptions } from './runtime/plugins/errorStatePlugin'
export type { UseChatRuntimeAdapterOptions } from './composables/useChatRuntimeAdapter'
export type {
  ChatHistoryDisplayData,
  ChatHistoryItem,
  UseChatHistoryDataOptions,
  UseChatHistoryItemsOptions,
} from './composables/useChatHistoryItems'
export type { ChatMcpServerConfig, ChatMcpServers, ChatMcpTransportType } from './runtime/mcp/types'
export type {
  CreateWebMcpAdapterOptions,
  CreateWebMcpToolSourceOptions,
  WebMcpContext,
  WebMcpServerOptions,
  WebMcpToolDescriptor,
  WebMcpToolSource,
} from './runtime/mcp/webmcpTypes'
export type {
  ChatProviderConfig,
  ChatProviderFeatureBody,
  ChatProviderModelConfig,
  ChatProviderType,
} from './runtime/provider'
