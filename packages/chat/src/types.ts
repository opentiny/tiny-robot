import type { ComputedRef, Ref } from 'vue'
import type {
  BubbleListProps,
  BubbleMessage,
  BubbleProviderProps,
  DefaultActions,
  HistoryItem,
  HistoryProps,
  LayoutFloatingProps,
  LayoutNormalProps,
  PromptProps,
  PromptsProps,
  SenderProps,
  StructuredData,
  WelcomeProps,
} from '@opentiny/tiny-robot'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'

export type ChatReadable<T> = Readonly<Ref<T>> | ComputedRef<T>

export type ChatConversationItem = HistoryItem & {
  id: string
  createdAt?: number
  updatedAt?: number
  metadata?: Record<string, unknown>
}

export type ChatMessageItem = BubbleMessage

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
  inputValue: ChatReadable<string>
  disabled: ChatReadable<boolean>
  loading: ChatReadable<boolean>
  submitDisabled: ChatReadable<boolean>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: StructuredData
}

export interface ChatRuntimeActions {
  setInputValue: (value: string) => void
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
  history?: Omit<HistoryProps<ChatConversationItem>, 'data' | 'selected'>
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: Omit<BubbleListProps, 'messages'>
  welcome?: WelcomeProps
  prompts?: Omit<PromptsProps, 'items'> & {
    items?: PromptProps[]
  }
  sender?: ChatSenderUi
}

export interface ChatContext {
  runtime: ChatRuntime
  ui: ChatUi
}
