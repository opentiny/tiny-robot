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
import type { ChatUIData } from './data'

export type ChatCssSize = string | number

export interface ChatUIProps {
  data?: Readonly<ChatUIData>
  ui?: Readonly<ChatUIOptions>
  inputValue?: string
  defaultInputValue?: string
}

export interface ChatUIOptions {
  layout?: Readonly<ChatLayoutOptions>
  brand?: Readonly<ChatBrandOptions>
  labels?: Readonly<Partial<ChatLabels>>
  header?: false
  history?: false | Readonly<ChatHistoryOptions>
  welcome?: false | Readonly<ChatWelcomeOptions>
  prompts?: false | Readonly<ChatPromptsOptions>
  bubble?: Readonly<ChatBubbleOptions>
  sender?: false | Readonly<ChatSenderOptions>
  model?: false | Readonly<ChatModelOptions>
  mcp?: false | Readonly<ChatMcpOptions>
}

export interface ChatLayoutOptions {
  readonly composer?: Readonly<ChatComposerLayoutOptions>
  readonly contentMaxWidth?: ChatCssSize
  readonly panelPadding?: ChatCssSize
  readonly panelGap?: ChatCssSize
  readonly leftAside?: false | Readonly<ChatAsideOptions>
  readonly rightAside?: false | Readonly<ChatRightAsideOptions>
}

export type ChatWelcomeComposerPlacement = 'footer' | 'center'

export interface ChatComposerLayoutOptions {
  readonly welcome?: ChatWelcomeComposerPlacement
}

export interface ChatBrandOptions {
  readonly name?: string
  readonly logo?: unknown
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
  rightAsideTitle: string
  openRightAside: string
  closeRightAside: string
}

export interface ChatAsideOptions {
  readonly mode?: 'dock' | 'drawer'
  readonly width?: number
  readonly collapsedWidth?: number
  readonly open?: boolean
  readonly defaultOpen?: boolean
}

export interface ChatRightAsideOptions extends ChatAsideOptions {
  readonly showClose?: boolean
}

export type ChatHistoryOptions = Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected' | 'onItemAction'>

export interface ChatBubbleOptions {
  readonly autoScroll?: boolean
  readonly bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  readonly bubbleList?: ChatBubbleListOptions
}

export type ChatBubbleListOptions = Omit<BubbleListProps, 'messages' | 'autoScroll'>

export type ChatWelcomeOptions = Partial<WelcomeProps>

export interface ChatPromptsOptions extends Omit<PromptsProps, 'items'> {
  readonly items?: PromptProps[]
}

type SubmitActionConfig = NonNullable<DefaultActions['submit']>

export type ChatSenderDefaultActions = Omit<DefaultActions, 'submit'> & {
  readonly submit?: Omit<SubmitActionConfig, 'disabled'>
}

export interface ChatSenderOptions
  extends Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'> {
  readonly defaultActions?: ChatSenderDefaultActions
}

export type ChatModelOptions = Record<string, never>
export type ChatMcpOptions = Record<string, never>
