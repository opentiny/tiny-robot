import type { ChatConversationInfo, ChatMessageItem } from '../base'
import type { ChatConversationView, ChatModelView, ChatMcpView } from './state'
import type { ChatSubmitPayload } from './events'

export interface ChatHeaderSlotProps {
  title: string
  isEmpty: boolean
  conversation: Required<ChatConversationView>
  isLeftAsideOpen: boolean
  openLeftAside: () => void
  closeLeftAside: () => void
  toggleLeftAside: () => void
  createConversation: () => void
}

export interface ChatLeftAsideSlotProps {
  conversation: Required<ChatConversationView>
  isOpen: boolean
  createConversation: () => void
  openLeftAside: () => void
  closeLeftAside: () => void
  toggleLeftAside: () => void
}

export interface ChatMainSlotProps {
  messages: readonly ChatMessageItem[]
  isEmpty: boolean
}

export interface ChatFooterSlotProps {
  inputValue: string
  loading: boolean
  disabled: boolean
  submitDisabled: boolean
  model?: ChatModelView
  mcp?: ChatMcpView
  setInputValue: (value: string) => void
  submit: (payload: ChatSubmitPayload) => void
  cancel: () => void
  clear: () => void
}

export interface ChatUISlots {
  header?: (props: ChatHeaderSlotProps) => unknown
  'left-aside'?: (props: ChatLeftAsideSlotProps) => unknown
  main?: (props: ChatMainSlotProps) => unknown
  footer?: (props: ChatFooterSlotProps) => unknown
  'right-aside'?: () => unknown
  notice?: () => unknown
  'welcome-footer'?: () => unknown
  'prompts-footer'?: () => unknown
  prefix?: (props: Record<string, unknown>) => unknown
  suffix?: (props: Record<string, unknown>) => unknown
  after?: (props: Record<string, unknown>) => unknown
  'content-footer'?: (props: Record<string, unknown>) => unknown
  'sender-footer'?: (props: Record<string, unknown>) => unknown
  'sender-footer-right'?: (props: Record<string, unknown>) => unknown
}

export type ChatHistorySlotProps = ChatLeftAsideSlotProps & {
  items: readonly ChatConversationInfo[]
  activeId: string | null
  switchConversation: (payload: { id: string }) => void
  renameConversation: (payload: { id: string; title: string }) => void
  deleteConversation: (payload: { id: string }) => void
}
