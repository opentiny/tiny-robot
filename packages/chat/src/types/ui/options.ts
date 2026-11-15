import type {
  BubbleListProps,
  BubbleProviderProps,
  DefaultActions,
  HistoryProps,
  PromptProps,
  PromptsProps,
  SenderProps,
  WelcomeProps,
  LayoutFloatingOptions,
  LayoutFloatingState,
  ModelSelectorProps,
  ExtensionManagerTab,
} from '@opentiny/tiny-robot'
import type { ChatConversationInfo, ChatIcon, ChatMessageItem, ChatRequestState } from '../base'
import type { ChatTokenUsage } from '@opentiny/tiny-robot-kit'
import type { ChatUIData } from './data'

export type ChatCssSize = string | number

export interface ChatUIProps {
  isEmpty?: boolean
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

export interface ChatUIOptions {
  anchor?: false | Readonly<ChatAnchorOptions>
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
  extensions?: false | Readonly<ChatExtensionsOptions>
}

export interface ChatAnchorOptions {
  visible?: boolean
  /** Viewport width in pixels; intentionally independent of the Chat panel width. */
  minWidth?: number
  /** Pointer hover time before the directory expands, in milliseconds. Defaults to 300. */
  hoverExpandDelay?: number
}

export interface ChatLayoutOptions {
  /** Show the built-in scroll-to-bottom button in the main or footer region. */
  readonly showScrollToBottom?: boolean
  readonly mobileBreakpoint?: number
  readonly composer?: Readonly<ChatComposerLayoutOptions>
  readonly surface?: Readonly<ChatSurfaceOptions>
  readonly emptyState?: 'start' | 'center'
  readonly contentMaxWidth?: ChatCssSize
  readonly panelPadding?: ChatCssSize
  readonly panelGap?: ChatCssSize
  readonly leftAside?: false | Readonly<ChatAsideOptions>
  readonly rightAside?: false | Readonly<ChatRightAsideOptions>
}

export interface ChatSurfaceOptions {
  readonly mode?: 'normal' | 'floating'
  readonly floatingOptions?: Readonly<LayoutFloatingOptions>
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
  searchModel: string
  modelEmptyText: string
  mcp: string
  extensions: string
  mcpInstallServer: string
  mcpRemoveServer: string
  welcomeTitle: string
  welcomeDescription: string
  rightAsideTitle: string
  openRightAside: string
  closeRightAside: string
  scrollToBottom: string
}

export interface ChatAsideOptions {
  readonly mode?: 'dock' | 'drawer'
  readonly width?: number
  readonly collapsedWidth?: number
  readonly resizable?: boolean
  readonly minWidth?: number
  readonly maxWidth?: number
  readonly open?: boolean
  readonly defaultOpen?: boolean
}

export interface ChatRightAsideOptions extends Omit<ChatAsideOptions, 'open' | 'defaultOpen'> {
  readonly showClose?: boolean
  readonly panels?: readonly ChatRightAsidePanelOptions[]
}

export const CHAT_MCP_RIGHT_ASIDE_PANEL_ID = 'mcp' as const

export type ChatRightAsidePanelId = string

export interface ChatRightAsidePanelOptions {
  readonly id: ChatRightAsidePanelId
  readonly title?: string
}

export type ChatHistoryOptions = Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected' | 'onItemAction'>

export interface ChatBubbleOptions {
  readonly autoScroll?: boolean
  readonly bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  readonly bubbleList?: ChatBubbleListOptions
  readonly actions?: false | Readonly<ChatBubbleActionsOptions>
}

export type ChatBubbleActionId = 'copy' | 'edit' | 'regenerate' | 'usage'
export type ChatActionCondition = boolean | ((context: ChatBubbleActionContext) => boolean)
export type ChatActionDisplay = 'always' | 'hover'

export interface ChatBubbleActionContext {
  readonly conversationId?: string | null
  readonly messageId?: string
  readonly messageKey: string
  readonly message: ChatMessageItem
  readonly messages: readonly ChatMessageItem[]
  readonly isLatest: boolean
  readonly turnState: ChatRequestState | 'unknown'
  readonly capabilities: { readonly canEdit: boolean; readonly canRegenerate: boolean }
}

export interface ChatBubbleActionPresentation {
  readonly visible?: ChatActionCondition
  readonly disabled?: ChatActionCondition
}

export type ChatBubbleActionItem =
  | ChatBubbleActionId
  | (ChatBubbleActionPresentation & {
      readonly type: 'builtin'
      readonly id: ChatBubbleActionId
      readonly label?: string
      readonly icon?: ChatIcon
    })
  | (ChatBubbleActionPresentation & {
      readonly type: 'custom'
      readonly id: string
      readonly label: string
      readonly icon?: ChatIcon
      readonly active?: ChatActionCondition
      readonly onClick: (context: ChatBubbleActionContext) => void | Promise<void>
    })
  | (ChatBubbleActionPresentation & { readonly type: 'slot'; readonly id: string })

export type ChatBubbleRoleActions =
  | false
  | readonly ChatBubbleActionItem[]
  | ((
      defaults: readonly ChatBubbleActionItem[],
      context: ChatBubbleActionContext,
    ) => false | readonly ChatBubbleActionItem[])

export interface ChatBubbleActionsOptions {
  readonly visible?: ChatActionCondition
  readonly display?: ChatActionDisplay | ((context: ChatBubbleActionContext) => ChatActionDisplay)
  readonly user?: ChatBubbleRoleActions
  readonly assistant?: ChatBubbleRoleActions
  readonly copy?: { readonly getText?: (context: ChatBubbleActionContext) => string }
  readonly usage?: {
    readonly trigger?: 'click' | 'hover'
    readonly resolve?: (context: ChatBubbleActionContext) => ChatTokenUsage | undefined
  }
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

export type ChatSenderToolbarItem = Readonly<
  {
    visible?: boolean
    disabled?: boolean
  } & (
    | {
        type: 'builtin'
        id: 'model' | 'mcp'
      }
    | {
        type: 'custom'
        id: string
        label: string
        icon?: ChatIcon
        active?: boolean
        onClick: () => void
      }
  )
>

export interface ChatSenderOptions extends Omit<
  SenderProps,
  'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'
> {
  readonly defaultActions?: ChatSenderDefaultActions
  readonly toolbar?:
    | readonly ChatSenderToolbarItem[]
    | ((defaults: readonly ChatSenderToolbarItem[]) => readonly ChatSenderToolbarItem[])
}

export interface ChatModelOptions {
  readonly appendTo?: ModelSelectorProps['appendTo']
}
export type ChatMcpOptions = Record<string, never>

export interface ChatExtensionsOptions {
  readonly tabs: readonly ExtensionManagerTab[]
  readonly defaultActiveTab?: string
  readonly overlayOpen?: boolean
}
