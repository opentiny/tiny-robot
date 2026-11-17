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
} from '../types'

export interface ChatRendererLifecycle {
  readonly signal: AbortSignal
}
export type ChatRendererResult = Node | readonly Node[] | string | null
export type ChatRenderer<TContext> = (context: TContext, lifecycle: ChatRendererLifecycle) => ChatRendererResult

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

/** Accepted state for a host-owned replacement editor. */
export interface ChatSenderContentRendererState {
  readonly value: string
  readonly disabled: boolean
  readonly loading: boolean
}

/** Replaces the input view; native Sender remains responsible for accepted draft and submit. */
export interface ChatSenderContentRendererContext extends ChatSenderContentRendererState {
  setInputValue(value: string): void
  subscribe(listener: (state: ChatSenderContentRendererState) => void): () => void
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
  'sender-content'?: ChatRenderer<ChatSenderContentRendererContext>
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

export const SCOPED_RENDERER_NAMES = [
  'layout-header',
  'layout-left-aside',
  'layout-left-aside-brand',
  'layout-left-aside-actions',
  'layout-left-aside-content',
  'layout-left-aside-footer',
  'layout-left-aside-rail',
  'layout-left-aside-history-item-prefix',
  'layout-right-aside',
  'layout-right-aside-title',
  'layout-main',
  'layout-right-aside-panel',
  'layout-empty-state',
  'layout-footer',
  'composer-before',
  'composer-after',
  'sender-content',
  'sender-actions-inline',
  'sender-footer',
  'sender-footer-right',
  'bubble-prefix',
  'bubble-suffix',
  'bubble-after',
  'bubble-content-footer',
  'extension-header-actions',
  'extension-overlay',
] as const satisfies readonly (keyof ChatRenderers)[]

export interface ChatRendererError {
  readonly name: keyof ChatRenderers | 'bubble-content' | 'bubble-fallback-content'
  readonly error: unknown
}
