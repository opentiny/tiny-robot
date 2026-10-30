import type {
  Attachment,
  ChatHistoryData,
  ChatBubbleRenderers,
  ChatRenderers,
  ChatRightAsidePanelId,
  ChatRuntime,
  ChatSendPayload,
  ChatUIData,
  ChatUIOptions,
  LayoutFloatingState,
} from '../types'
import type { CreateChatRuntimeOptions } from './runtime/types'
import type { TrChatRuntimeSnapshot } from './runtime/runtimeSnapshot'
import type { TrChatElementEventMap, TrChatUIElementEventMap } from './elementEvents'

export type TrChatRenderers = ChatRenderers

export interface TrChatSharedElementProperties {
  ui?: Readonly<ChatUIOptions>
  renderers?: Readonly<TrChatRenderers>
  bubbleRenderers?: Readonly<ChatBubbleRenderers>
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
  attachments?: readonly Attachment[]
  send(payload: ChatSendPayload): Promise<boolean>
  getRuntime(): ChatRuntime | undefined
  getRuntimeSnapshot(): TrChatRuntimeSnapshot | undefined
  addEventListener<K extends keyof TrChatElementEventMap>(
    type: K,
    listener: (this: TrChatHTMLElement, event: TrChatElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof TrChatElementEventMap>(
    type: K,
    listener: (this: TrChatHTMLElement, event: TrChatElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
}

export interface TrChatUIHTMLElement extends HTMLElement, TrChatSharedElementProperties {
  inputValue?: string
  defaultInputValue?: string
  data?: Readonly<ChatUIData>
  addEventListener<K extends keyof TrChatUIElementEventMap>(
    type: K,
    listener: (this: TrChatUIHTMLElement, event: TrChatUIElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof TrChatUIElementEventMap>(
    type: K,
    listener: (this: TrChatUIHTMLElement, event: TrChatUIElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
}

export type TrChatElementConstructor<TElement extends HTMLElement = HTMLElement> = CustomElementConstructor & {
  new (): TElement
}

export interface TrChatElementConstructors {
  chat?: TrChatElementConstructor<TrChatHTMLElement>
  chatUI?: TrChatElementConstructor<TrChatUIHTMLElement>
}
