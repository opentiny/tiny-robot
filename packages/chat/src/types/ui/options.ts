import type {
  BubbleListProps,
  BubbleProviderProps,
  DefaultActions,
  HistoryProps,
  HistoryMenuItem,
  PromptProps,
  PromptsProps,
  SenderProps,
  WelcomeProps,
} from '@opentiny/tiny-robot'
import type { ChatConversationInfo } from '../base'
import type { ChatBubbleEventPayload, ChatBubbleStateChangePayload } from './events'
import type { ChatUIData } from './data'

export type ChatCssSize = string | number

export interface ChatUIProps {
  data?: ChatUIData
  ui?: ChatUIOptions
}

export interface ChatUIOptions {
  layout?: ChatLayoutOptions
  brand?: ChatBrandOptions
  labels?: Partial<ChatLabels>
  header?: false
  history?: false | ChatHistoryOptions
  welcome?: false | ChatWelcomeOptions
  prompts?: false | ChatPromptsOptions
  bubble?: ChatBubbleOptions
  sender?: false | ChatSenderOptions
  model?: false | ChatModelOptions
  mcp?: false | ChatMcpOptions
}

export interface ChatLayoutOptions {
  contentMaxWidth?: ChatCssSize
  panelPadding?: ChatCssSize
  panelGap?: ChatCssSize
  leftAside?: false | ChatAsideOptions
  rightAside?: false | ChatRightAsideOptions
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
  rightAsideTitle: string
}

export interface ChatAsideOptions {
  mode?: 'dock' | 'drawer'
  width?: number
  collapsedWidth?: number
  defaultOpen?: boolean
}

export interface ChatRightAsideOptions extends ChatAsideOptions {
  open?: boolean
  showClose?: boolean
  onOpenChange?: (payload: { open: boolean }) => void
}

export type ChatHistoryOptions = Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected'> & {
  onItemAction?: (action: HistoryMenuItem, conversation: ChatConversationInfo) => void
}

export interface ChatBubbleOptions {
  autoScroll?: boolean
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListOptions
}

export type ChatBubbleListOptions = Omit<BubbleListProps, 'messages' | 'autoScroll'> & {
  onStateChange?: (payload: ChatBubbleStateChangePayload) => void
  onBubbleEvent?: (payload: ChatBubbleEventPayload) => void
}

export type ChatWelcomeOptions = Partial<WelcomeProps>

export interface ChatPromptsOptions extends Omit<PromptsProps, 'items'> {
  items?: PromptProps[]
  onItemClick?: (event: MouseEvent, item: PromptProps) => void
}

type SubmitActionConfig = NonNullable<DefaultActions['submit']>

export type ChatSenderDefaultActions = Omit<DefaultActions, 'submit'> & {
  submit?: Omit<SubmitActionConfig, 'disabled'>
}

export interface ChatSenderOptions
  extends Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'> {
  defaultActions?: ChatSenderDefaultActions
  clearOnSubmit?: boolean
  onInput?: (value: string) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export interface ChatModelOptions {
  onSelect?: (payload: { id: string | null }) => void
  onFeatureChange?: (payload: { id: string; enabled: boolean }) => void
}

export interface ChatMcpOptions {
  onAddServer?: (payload: { id: string }) => void
  onRemoveServer?: (payload: { id: string }) => void
  onServerEnabledChange?: (payload: { id: string; enabled: boolean }) => void
  onToolEnabledChange?: (payload: { serverId: string; toolId: string; enabled: boolean }) => void
}
