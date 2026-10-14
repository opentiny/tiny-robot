import type {
  ChatBubbleContentFooterSlotProps,
  ChatBubbleSlotProps,
  ChatEmptyStateSlotProps,
  ChatHeaderSlotProps,
  ChatHistoryData,
  ChatHistoryItemPrefixSlotProps,
  ChatLeftAsideContentSlotProps,
  ChatLeftAsideSlotProps,
  ChatMainSlotProps,
  ChatRightAsidePanelId,
  ChatRightAsidePanelSlotProps,
  ChatRightAsideTitleSlotProps,
  ChatRuntime,
  ChatSendPayload,
  ChatSenderSlotProps,
  ChatUIData,
  ChatUIOptions,
  LayoutFloatingState,
} from '../types'
import type { ExperimentalRenderer } from './renderers'
import type { CreateChatRuntimeOptions } from './runtime/types'

export interface TrChatRenderers {
  'layout-header'?: ExperimentalRenderer<ChatHeaderSlotProps>
  'layout-left-aside'?: ExperimentalRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-brand'?: ExperimentalRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-actions'?: ExperimentalRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-content'?: ExperimentalRenderer<ChatLeftAsideContentSlotProps>
  'layout-left-aside-footer'?: ExperimentalRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-rail'?: ExperimentalRenderer<ChatLeftAsideSlotProps>
  'layout-left-aside-history-item-prefix'?: ExperimentalRenderer<ChatHistoryItemPrefixSlotProps>
  'layout-right-aside'?: ExperimentalRenderer<ChatRightAsidePanelSlotProps>
  'layout-right-aside-title'?: ExperimentalRenderer<ChatRightAsideTitleSlotProps>
  'layout-right-aside-panel'?: ExperimentalRenderer<ChatRightAsidePanelSlotProps>
  'layout-main'?: ExperimentalRenderer<ChatMainSlotProps>
  'layout-empty-state'?: ExperimentalRenderer<Omit<ChatEmptyStateSlotProps, 'renderComposer'>>
  'layout-footer'?: ExperimentalRenderer<ChatSenderSlotProps>
  'composer-before'?: ExperimentalRenderer<ChatSenderSlotProps>
  'composer-after'?: ExperimentalRenderer<ChatSenderSlotProps>
  'bubble-prefix'?: ExperimentalRenderer<ChatBubbleSlotProps>
  'bubble-suffix'?: ExperimentalRenderer<ChatBubbleSlotProps>
  'bubble-after'?: ExperimentalRenderer<ChatBubbleSlotProps>
  'bubble-content-footer'?: ExperimentalRenderer<ChatBubbleContentFooterSlotProps>
}

export interface TrChatSharedElementProperties {
  ui?: Readonly<ChatUIOptions>
  renderers?: Readonly<TrChatRenderers>
  floatingState?: LayoutFloatingState
  rightAsideOpen?: boolean
  defaultRightAsideOpen?: boolean
  activeRightAsidePanelId?: ChatRightAsidePanelId
  defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
  openRightAside(panel?: ChatRightAsidePanelId): void
  closeRightAside(): void
  toggleRightAside(panel?: ChatRightAsidePanelId): void
  activateRightAsidePanel(panel: ChatRightAsidePanelId): boolean
}

export interface TrChatHTMLElement extends HTMLElement, TrChatSharedElementProperties {
  runtime?: ChatRuntime
  /** Owned Runtime configuration. May be assigned before or immediately after the element connects. */
  runtimeOptions?: CreateChatRuntimeOptions
  historyData?: ChatHistoryData
  send(payload: ChatSendPayload): Promise<boolean>
  getRuntime(): ChatRuntime | undefined
}

export interface TrChatUIHTMLElement extends HTMLElement, TrChatSharedElementProperties {
  inputValue?: string
  defaultInputValue?: string
  data?: Readonly<ChatUIData>
}

export type TrChatElementConstructor<TElement extends HTMLElement = HTMLElement> = CustomElementConstructor & {
  new (): TElement
}

export interface TrChatElementConstructors {
  chat?: TrChatElementConstructor<TrChatHTMLElement>
  chatUI?: TrChatElementConstructor<TrChatUIHTMLElement>
}
