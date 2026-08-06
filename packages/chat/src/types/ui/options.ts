import type {
  BubbleListProps,
  BubbleProviderProps,
  DefaultActions,
  HistoryProps,
  PromptProps,
  PromptsProps,
  SenderProps,
  WelcomeProps,
} from '@opentiny/tiny-robot'
import type { ChatConversationInfo } from '../base'
import type { ChatViewState } from './state'

export type ChatCssSize = string | number

export interface ChatUIProps {
  state?: ChatViewState
  ui?: ChatUIOptions
  composerValue?: string
  defaultComposerValue?: string
}

export interface ChatUIOptions {
  layout?: ChatLayoutOptions
  brand?: ChatBrandOptions
  labels?: Partial<ChatLabels>
  header?: false
  leftAside?: false | ChatAsideOptions
  rightAside?: false | ChatRightAsideOptions
  history?: false | ChatHistoryOptions
  messages?: ChatMessagesOptions
  welcome?: false | ChatWelcomeOptions
  prompts?: false | ChatPromptsOptions
  composer?: false | ChatComposerOptions
}

export interface ChatLayoutOptions {
  contentMaxWidth?: ChatCssSize
  panelPadding?: ChatCssSize
  panelGap?: ChatCssSize
}

export interface ChatBrandOptions {
  name?: string
  logo?: unknown
}

export interface ChatLabels {
  newConversationTitle: string
  createConversation: string
  renameConversation: string
  deleteConversation: string
  expandConversationList: string
  collapseConversationList: string
  composerPlaceholder: string
  composerLoadingPlaceholder: string
  selectModel: string
  mcp: string
  thinkingFeature: string
  searchFeature: string
  welcomeTitle: string
  welcomeDescription: string
}

export interface ChatAsideOptions {
  mode?: 'dock' | 'drawer'
  width?: number
  collapsedWidth?: number
  defaultOpen?: boolean
}

export interface ChatRightAsideOptions extends ChatAsideOptions {
  open?: boolean
  title?: string
  showClose?: boolean
}

export type ChatHistoryOptions = Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected'>

export interface ChatMessagesOptions {
  autoScroll?: boolean
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListOptions
}

export type ChatBubbleListOptions = Omit<BubbleListProps, 'messages' | 'autoScroll'>

export type ChatWelcomeOptions = Partial<WelcomeProps>

export interface ChatPromptsOptions extends Omit<PromptsProps, 'items'> {
  items?: PromptProps[]
}

type SubmitActionConfig = NonNullable<DefaultActions['submit']>

export type ChatSenderDefaultActions = Omit<DefaultActions, 'submit'> & {
  submit?: Omit<SubmitActionConfig, 'disabled'>
}

export interface ChatSenderOptions
  extends Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'> {
  defaultActions?: ChatSenderDefaultActions
}

export interface ChatComposerOptions {
  sender?: ChatSenderOptions
  clearOnSubmit?: boolean
}
