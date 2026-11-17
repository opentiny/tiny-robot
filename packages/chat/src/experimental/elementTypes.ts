import type {
  ChatUIProps,
  ChatRuntime,
  ChatUIOptions,
  ChatHistoryData,
  ChatUIEmits,
  ChatEmits,
  LayoutFloatingState,
  ChatSendPayload,
  ChatRightAsidePanelId,
} from '../types'
import type { ElementEventMap } from './events'
import type { ChatRenderers, ChatRendererError } from './elementRenderers'

type RendererEvents = { 'renderer-error': CustomEvent<[ChatRendererError]> }

export type TrChatUIElementEventMap = ElementEventMap<ChatUIEmits> & RendererEvents & { ready: CustomEvent<[]> }
export type TrChatElementEventMap = ElementEventMap<ChatEmits> & RendererEvents & { ready: CustomEvent<[]> }

/** Public methods of the inner TrChatUI, available while the element is ready. */
export interface TrChatUIElementMethods {
  setInputValue(text: string): void
  clearInput(): void
  focusInput(): Promise<boolean>
  openRightAside(panel?: ChatRightAsidePanelId): void
  closeRightAside(): void
  toggleRightAside(panel?: ChatRightAsidePanelId): void
  activateRightAsidePanel(panel: ChatRightAsidePanelId): boolean
}
export interface TrChatElementMethods extends TrChatUIElementMethods {
  send(payload: ChatSendPayload): Promise<boolean>
}

export interface TrChatUIHTMLElement extends HTMLElement, ChatUIProps, TrChatUIElementMethods {
  renderers?: Readonly<ChatRenderers>
  addEventListener<K extends keyof TrChatUIElementEventMap>(
    type: K,
    listener: (this: TrChatUIHTMLElement, event: TrChatUIElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof TrChatUIElementEventMap>(
    type: K,
    listener: (this: TrChatUIHTMLElement, event: TrChatUIElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void
}
export interface TrChatHTMLElement extends HTMLElement, TrChatElementMethods {
  renderers?: Readonly<ChatRenderers>
  runtime?: ChatRuntime
  ui?: Readonly<ChatUIOptions>
  floatingState?: LayoutFloatingState
  historyData?: ChatHistoryData
  isEmpty?: boolean
  rightAsideOpen?: boolean
  defaultRightAsideOpen?: boolean
  activeRightAsidePanelId?: string
  defaultActiveRightAsidePanelId?: string
  addEventListener<K extends keyof TrChatElementEventMap>(
    type: K,
    listener: (this: TrChatHTMLElement, event: TrChatElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void
  removeEventListener<K extends keyof TrChatElementEventMap>(
    type: K,
    listener: (this: TrChatHTMLElement, event: TrChatElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void
}
export type TrChatElementConstructor<T extends HTMLElement = HTMLElement> = CustomElementConstructor & { new (): T }
export interface TrChatElementConstructors {
  chat?: TrChatElementConstructor<TrChatHTMLElement>
  chatUI?: TrChatElementConstructor<TrChatUIHTMLElement>
}
