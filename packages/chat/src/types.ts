import type { ComputedRef, Ref } from 'vue'
import type {
  BubbleListProps,
  BubbleProviderProps,
  DefaultActions,
  HistoryProps,
  LayoutFloatingProps,
  LayoutNormalProps,
  PromptProps,
  PromptsProps,
  SenderProps,
  WelcomeProps,
} from '@opentiny/tiny-robot'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'

export type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export interface ChatConversationItem {
  id: string
  title: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface ChatMessagePart {
  type: string
  [key: string]: unknown
}

export type ChatMessageContent = string | ChatMessagePart[]

export interface ChatToolCall {
  id: string
  type: 'function' | string
  function: {
    name: string
    arguments: string
  }
}

export interface ChatMessageItem<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> {
  role?: string
  content?: T
  parts?: ChatMessagePart[]
  reasoning_content?: string
  tool_calls?: ChatToolCall[]
  tool_call_id?: string
  name?: string
  id?: string
  loading?: boolean
  state?: S
  metadata?: Record<string, unknown>
}

export interface ChatStructuredDataItem {
  type: string
  [key: string]: unknown
}

export type ChatStructuredData = ChatStructuredDataItem[]

export type ChatLayoutUi = (Omit<LayoutNormalProps, 'mode'> & { mode?: 'normal' }) | LayoutFloatingProps

export interface ChatRuntimeConversations {
  items: ChatReadable<readonly ChatConversationItem[]>
  currentId: ChatReadable<string | null>
  loading?: ChatReadable<boolean>
}

export interface ChatRuntimeMessages {
  items: ChatReadable<readonly ChatMessageItem[]>
  requestState: ChatReadable<RequestState>
  processingState: ChatReadable<RequestProcessingState | undefined>
  lastError?: ChatReadable<unknown | null>
}

export interface ChatRuntimeSender {
  disabled: ChatReadable<boolean>
  loading: ChatReadable<boolean>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
}

export interface ChatRuntimeActions {
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  createConversation?: (payload?: { title?: string; metadata?: Record<string, unknown> }) => Promise<void> | void
  switchConversation?: (id: string) => Promise<void> | void
  renameConversation?: (id: string, title: string) => Promise<void> | void
  deleteConversation?: (id: string) => Promise<void> | void
}

export interface ChatRuntime {
  conversations?: ChatRuntimeConversations
  messages: ChatRuntimeMessages
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}

export interface ChatComposer {
  inputValue: ChatReadable<string>
  submitDisabled: ChatReadable<boolean>
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
}

type SubmitActionConfig = NonNullable<DefaultActions['submit']>

export type ChatSenderDefaultActions = Omit<DefaultActions, 'submit'> & {
  submit?: Omit<SubmitActionConfig, 'disabled'>
}

export type ChatSenderUi = Omit<
  SenderProps,
  'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'
> & {
  defaultActions?: ChatSenderDefaultActions
}

export interface ChatUi {
  layout?: ChatLayoutUi
  history?: Omit<HistoryProps, 'data' | 'selected'>
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: Omit<BubbleListProps, 'messages'>
  welcome?: WelcomeProps
  prompts?: Omit<PromptsProps, 'items'> & {
    items?: PromptProps[]
  }
  sender?: ChatSenderUi
}

export interface ChatHeaderSlotProps {
  title: string
  requestState: RequestState
  processingState: RequestProcessingState | undefined
  lastError: unknown | null
  createConversation?: ChatRuntimeActions['createConversation']
}

export interface ChatHistorySlotProps {
  items: readonly ChatConversationItem[]
  currentId: string | null
  switchConversation?: ChatRuntimeActions['switchConversation']
  renameConversation?: ChatRuntimeActions['renameConversation']
  deleteConversation?: ChatRuntimeActions['deleteConversation']
  createConversation?: ChatRuntimeActions['createConversation']
}

export interface ChatMainSlotProps {
  messages: readonly ChatMessageItem[]
  requestState: RequestState
  processingState: RequestProcessingState | undefined
  lastError: unknown | null
}

export interface ChatFooterSlotProps {
  inputValue: string
  setInputValue: (value: string) => void
  send: (payload: ChatSubmitPayload) => Promise<void> | void
  abort?: () => Promise<void> | void
  disabled: boolean
  loading: boolean
  submitDisabled: boolean
}

export interface ChatContext {
  runtime: ChatRuntime
  composer: ChatComposer
  ui: ChatUi
}
