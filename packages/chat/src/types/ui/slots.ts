import type { ChatConversationInfo, ChatMessageItem, ChatStructuredData } from '../base'
import type { ChatConversationView, ChatHistoryData, ChatRequestView } from './data'

export interface ChatHeaderSlotProps {
  readonly title: string
  readonly isEmpty: boolean
  readonly conversation: ChatConversationView
  readonly createConversation: () => void
  readonly isLeftAsideOpen: boolean
  readonly openLeftAside: () => void
  readonly closeLeftAside: () => void
  readonly toggleLeftAside: () => void
  readonly openRightAside: (panel?: string) => void
  readonly closeRightAside: () => void
}

export interface ChatLeftAsideSlotProps {
  readonly conversation: ChatConversationView
  readonly isOpen: boolean
  readonly isDock: boolean
  readonly createConversation: () => void
  readonly switchConversation: (id: string) => void
  readonly renameConversation: (id: string, title: string) => void
  readonly deleteConversation: (id: string) => void
  readonly openLeftAside: () => void
  readonly closeLeftAside: () => void
  readonly toggleLeftAside: () => void
}

export interface ChatLeftAsideContentSlotProps extends ChatLeftAsideSlotProps {
  readonly history?: ChatHistoryData
}

export interface ChatHistoryItemPrefixSlotProps {
  readonly item: ChatConversationInfo
}

export interface ChatRightAsideSlotProps {
  readonly panel: string | undefined
  readonly openRightAside: (panel?: string) => void
  readonly closeRightAside: () => void
  readonly isRightAsideOpen: boolean
}

export interface ChatSenderSlotProps {
  readonly value: string
  readonly loading: boolean
  readonly disabled: boolean
  readonly submitDisabled: boolean
  readonly setInputValue: (value: string) => void
  readonly submit: (payload: { text: string; structuredData?: ChatStructuredData }) => void
  readonly cancel: () => void
  readonly clear: () => void
}

export interface ChatMainSlotProps {
  readonly messages: readonly ChatMessageItem[]
  readonly request?: ChatRequestView
  readonly conversation: ChatConversationView
}

export interface ChatUISlots {
  'layout-header'?: (props: ChatHeaderSlotProps) => unknown
  'layout-left-aside'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-brand'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-actions'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-content'?: (props: ChatLeftAsideContentSlotProps) => unknown
  'layout-left-aside-footer'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-rail'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-history-item-prefix'?: (props: ChatHistoryItemPrefixSlotProps) => unknown
  'layout-right-aside'?: (props: ChatRightAsideSlotProps) => unknown
  'layout-right-aside-content'?: () => unknown
  'layout-right-aside-title'?: () => unknown
  'layout-main'?: (props: ChatMainSlotProps) => unknown
  'layout-footer'?: (props: ChatSenderSlotProps) => unknown
  'composer-before'?: (props: ChatSenderSlotProps) => unknown
  'header-notice'?: () => unknown
  'request-error'?: (props: { error: unknown }) => unknown
  'welcome-footer'?: () => unknown
  'prompts-footer'?: () => unknown
  'bubble-prefix'?: () => unknown
  'bubble-suffix'?: () => unknown
  'bubble-after'?: () => unknown
  'bubble-content-footer'?: () => unknown
  'sender-footer'?: () => unknown
  'sender-footer-right'?: () => unknown
}
