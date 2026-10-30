import type { ChatRenderer } from '../../renderers/domRenderer'
import type {
  ChatBubbleContentFooterSlotProps,
  ChatBubbleSlotProps,
  ChatEmptyStateSlotProps,
  ChatExtensionSlotProps,
  ChatHeaderSlotProps,
  ChatHistoryItemPrefixSlotProps,
  ChatLeftAsideContentSlotProps,
  ChatLeftAsideSlotProps,
  ChatMainSlotProps,
  ChatRightAsidePanelSlotProps,
  ChatRightAsideTitleSlotProps,
  ChatSenderSlotProps,
} from './slots'

export type {
  ChatRenderer,
  ChatRendererHost,
  ChatRendererHostOptions,
  ChatRendererLifecycle,
  ChatRendererResult,
} from '../../renderers/domRenderer'

export interface ChatRenderers {
  'layout-header'?: ChatRenderer<ChatHeaderSlotProps>
  'layout-left-aside'?: ChatRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-brand'?: ChatRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-actions'?: ChatRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-content'?: ChatRenderer<ChatLeftAsideContentSlotProps>
  'layout-left-aside-footer'?: ChatRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-rail'?: ChatRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-history-item-prefix'?: ChatRenderer<ChatHistoryItemPrefixSlotProps>
  'layout-right-aside'?: ChatRenderer<ChatRightAsidePanelSlotProps>
  'layout-right-aside-title'?: ChatRenderer<ChatRightAsideTitleSlotProps>
  'layout-main'?: ChatRenderer<ChatMainSlotProps>
  'layout-right-aside-panel'?: ChatRenderer<ChatRightAsidePanelSlotProps>
  'layout-empty-state'?: ChatRenderer<Omit<ChatEmptyStateSlotProps, 'renderComposer'>>
  'layout-footer'?: ChatRenderer<ChatSenderSlotProps>
  'composer-before'?: ChatRenderer<ChatSenderSlotProps>
  'composer-after'?: ChatRenderer<ChatSenderSlotProps>
  'bubble-prefix'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-suffix'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-after'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-content-footer'?: ChatRenderer<ChatBubbleContentFooterSlotProps>
  'extension-header-actions'?: ChatRenderer<ChatExtensionSlotProps>
  'extension-overlay'?: ChatRenderer<ChatExtensionSlotProps>
}
