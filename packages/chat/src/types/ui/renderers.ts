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

/** Native Sender operations without editor/component instances. Valid for one Renderer invocation. */
export interface ChatSenderRendererContext {
  readonly disabled: boolean
  readonly loading: boolean
  readonly hasContent: boolean
  focus(): Promise<boolean>
  blur(): void
  insert(content: string): void
  append(content: string): void
  replace(content: string): void
}

/** DOM counterpart of the Vue empty-state slot. Call renderComposer synchronously and include its container in the result. */
export type ChatEmptyStateRendererContext = Omit<ChatEmptyStateSlotProps, 'renderComposer'> & {
  renderComposer(): HTMLElement | null
}

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
  'layout-empty-state'?: ChatRenderer<ChatEmptyStateRendererContext>
  'layout-footer'?: ChatRenderer<ChatSenderSlotProps>
  'composer-before'?: ChatRenderer<ChatSenderSlotProps>
  'composer-after'?: ChatRenderer<ChatSenderSlotProps>
  'sender-actions-inline'?: ChatRenderer<ChatSenderRendererContext>
  'sender-footer'?: ChatRenderer<ChatSenderRendererContext>
  'sender-footer-right'?: ChatRenderer<ChatSenderRendererContext>
  'bubble-prefix'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-suffix'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-after'?: ChatRenderer<ChatBubbleSlotProps>
  'bubble-content-footer'?: ChatRenderer<ChatBubbleContentFooterSlotProps>
  'extension-header-actions'?: ChatRenderer<ChatExtensionSlotProps>
  'extension-overlay'?: ChatRenderer<ChatExtensionSlotProps>
}
