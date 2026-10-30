import type { ChatConversationInfo, ChatMessageItem } from '../base'
import type { ChatSendPayload } from '../commands'
import type { ChatRightAsidePanelId, ChatRightAsidePanelOptions } from './options'
import type { ChatConversationView, ChatHistoryData, ChatRequestView } from './data'
import type { BubbleMessage, SenderSlotScope } from '@opentiny/tiny-robot'
import type { VNode } from 'vue'

export interface ChatHeaderSlotProps {
  readonly title: string
  readonly isEmpty: boolean
  readonly conversation: ChatConversationView
  readonly isMobileViewport: boolean
  readonly createConversation: () => void
  readonly isLeftAsideOpen: boolean
  readonly openLeftAside: () => void
  readonly closeLeftAside: () => void
  readonly toggleLeftAside: () => void
  readonly openRightAside: (panel?: ChatRightAsidePanelId) => void
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

export interface ChatRightAsidePanelContext {
  readonly panelId: ChatRightAsidePanelId | undefined
  readonly panel?: ChatRightAsidePanelOptions
}

export type ChatRightAsideTitleSlotProps = ChatRightAsidePanelContext

export interface ChatRightAsidePanelSlotProps extends ChatRightAsidePanelContext {
  readonly panels: readonly ChatRightAsidePanelOptions[]
  readonly openRightAside: (panelId?: ChatRightAsidePanelId) => void
  readonly closeRightAside: () => void
  readonly toggleRightAside: (panelId?: ChatRightAsidePanelId) => void
  readonly activateRightAsidePanel: (panelId: ChatRightAsidePanelId) => void
  readonly isRightAsideOpen: boolean
}

export interface ChatSenderSlotProps {
  readonly value: string
  readonly loading: boolean
  readonly disabled: boolean
  readonly submitDisabled: boolean
  readonly setInputValue: (value: string) => void
  readonly submit: (payload: ChatSendPayload) => void
  readonly cancel: () => void
  readonly clear: () => void
}

export interface ChatExtensionSlotProps {
  readonly activeTabId: string | undefined
}

export interface ChatMainSlotProps {
  readonly messages: readonly ChatMessageItem[]
  readonly request?: ChatRequestView
  readonly conversation: ChatConversationView
}

export interface ChatEmptyStateSlotProps {
  readonly messages: readonly ChatMessageItem[]
  readonly request?: ChatRequestView
  readonly conversation: ChatConversationView
  readonly isEmpty: true
  readonly renderComposer: () => VNode | null
}

export interface ChatBubbleSlotProps {
  readonly messages: readonly BubbleMessage[]
  readonly role?: string
  readonly messageIndexes: readonly number[]
}

export interface ChatBubbleContentFooterSlotProps extends ChatBubbleSlotProps {
  readonly contentIndex?: number
}

export interface ChatUISlots {
  'header-notice'?: () => unknown
  'layout-header'?: (props: ChatHeaderSlotProps) => unknown
  'layout-left-aside'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-brand'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-actions'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-content'?: (props: ChatLeftAsideContentSlotProps) => unknown
  'layout-left-aside-footer'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-rail'?: (props: ChatLeftAsideSlotProps) => unknown
  'layout-left-aside-history-item-prefix'?: (props: ChatHistoryItemPrefixSlotProps) => unknown
  'layout-right-aside'?: (props: ChatRightAsidePanelSlotProps) => unknown
  'layout-right-aside-title'?: (props: ChatRightAsideTitleSlotProps) => unknown
  'layout-right-aside-panel'?: (props: ChatRightAsidePanelSlotProps) => unknown
  'layout-main'?: (props: ChatMainSlotProps) => unknown
  'layout-empty-state'?: (props: ChatEmptyStateSlotProps) => unknown
  'layout-footer'?: (props: ChatSenderSlotProps) => unknown
  'composer-before'?: (props: ChatSenderSlotProps) => unknown
  'composer-after'?: (props: ChatSenderSlotProps) => unknown
  'welcome-footer'?: () => unknown
  'prompts-footer'?: () => unknown
  'bubble-prefix'?: (props: ChatBubbleSlotProps) => unknown
  'bubble-suffix'?: (props: ChatBubbleSlotProps) => unknown
  'bubble-after'?: (props: ChatBubbleSlotProps) => unknown
  'bubble-content-footer'?: (props: ChatBubbleContentFooterSlotProps) => unknown
  'sender-header'?: () => unknown
  'sender-content'?: (props: { editor: unknown }) => unknown
  'sender-actions-inline'?: (scope: SenderSlotScope) => unknown
  'sender-footer'?: (scope: SenderSlotScope) => unknown
  'sender-footer-right'?: (scope: SenderSlotScope) => unknown
  'extension-header-actions'?: (props: ChatExtensionSlotProps) => unknown
  'extension-overlay'?: (props: ChatExtensionSlotProps) => unknown
}
