export { default as TrChat } from './Chat.vue'
export { default as TrChatUI } from './ChatUI.vue'
export { useChatRuntimeAdapter } from './composables/useChatRuntimeAdapter'
export { useChatHistoryData, useChatHistoryItems } from './composables/useChatHistoryItems'

export type * from './types'

export type {
  LayoutFloatingDragDetail,
  LayoutFloatingOptions,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
} from '@opentiny/tiny-robot'

export type { UseChatRuntimeAdapterOptions } from './composables/useChatRuntimeAdapter'
export type {
  ChatHistoryDisplayData,
  ChatHistoryItem,
  UseChatHistoryDataOptions,
  UseChatHistoryItemsOptions,
} from './composables/useChatHistoryItems'
