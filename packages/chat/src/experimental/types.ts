import type {
  ChatHistoryData,
  ChatRightAsidePanelId,
  ChatRuntime,
  ChatUIData,
  ChatUIOptions,
  LayoutFloatingState,
} from '../types'

export interface TrChatHTMLElement extends HTMLElement {
  runtime?: ChatRuntime
  ui?: ChatUIOptions
  floatingState?: LayoutFloatingState
  rightAsideOpen?: boolean
  defaultRightAsideOpen?: boolean
  activeRightAsidePanelId?: ChatRightAsidePanelId
  defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
  historyData?: ChatHistoryData
}

export interface TrChatUIHTMLElement extends HTMLElement {
  inputValue?: string
  defaultInputValue?: string
  data?: Readonly<ChatUIData>
  ui?: Readonly<ChatUIOptions>
  floatingState?: LayoutFloatingState
  rightAsideOpen?: boolean
  defaultRightAsideOpen?: boolean
  activeRightAsidePanelId?: ChatRightAsidePanelId
  defaultActiveRightAsidePanelId?: ChatRightAsidePanelId
}

export type TrChatElementConstructor<TElement extends HTMLElement = HTMLElement> = CustomElementConstructor & {
  new (): TElement
}

export interface TrChatElementConstructors {
  chat?: TrChatElementConstructor<TrChatHTMLElement>
  chatUI?: TrChatElementConstructor<TrChatUIHTMLElement>
}
