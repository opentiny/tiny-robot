import type {
  BubbleListProps,
  BubbleProviderProps,
  DefaultActions,
  HistoryMenuItem,
  HistoryProps,
  LayoutAsideOpenDetail,
  LayoutAsideOpenValue,
  LayoutAsideResizeDetail,
  LayoutAsideResizeValue,
  LayoutFloatingDragDetail,
  LayoutFloatingProps,
  LayoutFloatingResizeDetail,
  LayoutFloatingState,
  LayoutNormalProps,
  PromptProps,
  PromptsProps,
  SenderProps,
  WelcomeProps,
} from '@opentiny/tiny-robot'
import type { ChatConversationInfo, ChatMessageItem, ChatReadable } from './base'
import type { ChatSubmitPayload } from './runtime'

// 梳理 UI 组件相关的事件
interface ChatLayoutUiListeners {
  'onUpdate:floatingState'?: (value: LayoutFloatingState) => void
  onFloatingDragStart?: (detail: LayoutFloatingDragDetail) => void
  onFloatingDrag?: (detail: LayoutFloatingDragDetail) => void
  onFloatingDragEnd?: (detail: LayoutFloatingDragDetail) => void
  onFloatingResizeStart?: (detail: LayoutFloatingResizeDetail) => void
  onFloatingResize?: (detail: LayoutFloatingResizeDetail) => void
  onFloatingResizeEnd?: (detail: LayoutFloatingResizeDetail) => void
  onAsideOpenChange?: (detail: LayoutAsideOpenDetail) => void
  onAsideResizeStart?: (detail: LayoutAsideResizeDetail) => void
  onAsideResize?: (detail: LayoutAsideResizeDetail) => void
  onAsideResizeEnd?: (detail: LayoutAsideResizeDetail) => void
  onLeftAsideOpenChange?: (detail: LayoutAsideOpenValue) => void
  onLeftAsideResizeStart?: (detail: LayoutAsideResizeValue) => void
  onLeftAsideResize?: (detail: LayoutAsideResizeValue) => void
  onLeftAsideResizeEnd?: (detail: LayoutAsideResizeValue) => void
  onRightAsideOpenChange?: (detail: LayoutAsideOpenValue) => void
  onRightAsideResizeStart?: (detail: LayoutAsideResizeValue) => void
  onRightAsideResize?: (detail: LayoutAsideResizeValue) => void
  onRightAsideResizeEnd?: (detail: LayoutAsideResizeValue) => void
}

export type ChatLayoutUi =
  | ((Omit<LayoutNormalProps, 'mode'> & { mode?: 'normal' }) & ChatLayoutUiListeners)
  | (LayoutFloatingProps & ChatLayoutUiListeners)

export interface ChatHistoryUi extends Omit<HistoryProps<ChatConversationInfo>, 'data' | 'selected'> {
  onItemClick?: (item: ChatConversationInfo) => void
  onItemTitleChange?: (title: string, item: ChatConversationInfo) => void
  onItemAction?: (action: HistoryMenuItem, item: ChatConversationInfo) => void
}

export interface ChatPromptsUi extends Omit<PromptsProps, 'items'> {
  items?: PromptProps[]
  onItemClick?: (event: MouseEvent, item: PromptProps) => void
}

type SubmitActionConfig = NonNullable<DefaultActions['submit']>

export type ChatSenderDefaultActions = Omit<DefaultActions, 'submit'> & {
  submit?: Omit<SubmitActionConfig, 'disabled'>
}

export interface ChatSenderUi
  extends Omit<SenderProps, 'modelValue' | 'defaultValue' | 'loading' | 'disabled' | 'defaultActions'> {
  defaultActions?: ChatSenderDefaultActions
  onInput?: (value: string) => void
  onSubmit?: (payload: ChatSubmitPayload) => void
  onCancel?: () => void
  onClear?: () => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export type ChatBubbleStateChangePayload = {
  key: string
  value: unknown
  messageIndex: number
  contentIndex: number
}

export type ChatBubbleEventPayload = {
  name: string
  payload?: unknown
  messageIndex: number
  contentIndex: number
}

export type ChatBubbleListUi = Omit<BubbleListProps, 'messages'> & {
  onStateChange?: (payload: ChatBubbleStateChangePayload) => void
  onBubbleEvent?: (payload: ChatBubbleEventPayload) => void
}

export type ChatUISize = string | number

export interface ChatUIAsideLayout {
  visible?: boolean
  mode?: 'dock' | 'drawer'
  width?: ChatUISize
  collapsedWidth?: ChatUISize
  defaultOpen?: boolean
}

export interface ChatUILayout {
  contentMaxWidth?: ChatUISize
  panelPadding?: ChatUISize
  panelGap?: ChatUISize
  leftAside?: ChatUIAsideLayout
  rightAside?: ChatUIAsideLayout
}

export interface ChatUIModelOption {
  id: string
  label: string
  capabilities?: Readonly<Record<string, boolean | undefined>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatUIModelControls {
  options: ChatReadable<readonly ChatUIModelOption[]>
  selectedId: ChatReadable<string | null>
  features: ChatReadable<Readonly<Record<string, boolean>>>
  select: (id: string | null) => Promise<void> | void
  setFeature: (id: string, enabled: boolean) => Promise<void> | void
}

export interface ChatUIMcpServerInfo {
  id: string
  name: string
  description?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatUIMcpToolInfo {
  id: string
  name: string
  description?: string
  enabled: boolean
}

export type ChatUIMcpToolState = Readonly<Partial<Record<string, readonly ChatUIMcpToolInfo[]>>>

export interface ChatUIMcpControls {
  servers: ChatReadable<readonly ChatUIMcpServerInfo[]>
  tools: ChatReadable<ChatUIMcpToolState>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
  loadTools: (serverId: string) => Promise<void>
  setToolEnabled: (serverId: string, toolId: string, enabled: boolean) => Promise<void> | void
}

export interface ChatUIComposerControls {
  model?: ChatUIModelControls
  mcp?: ChatUIMcpControls
}

export interface ChatUIConfig {
  layout?: ChatUILayout
  history?: ChatHistoryUi
  bubbleProvider?: Omit<BubbleProviderProps, 'store'>
  bubbleList?: ChatBubbleListUi
  welcome?: WelcomeProps
  prompts?: ChatPromptsUi
  sender?: ChatSenderUi
  composer?: ChatUIComposerControls
}

export interface ChatUIConversationState {
  items: readonly ChatConversationInfo[]
  activeId: string | null
  title: string
}

export interface ChatUIComposerState {
  value?: string
  loading: boolean
  disabled: boolean
  submitDisabled?: boolean
}

export interface ChatUIState {
  conversation: ChatUIConversationState
  messages: readonly ChatMessageItem[]
  composer: ChatUIComposerState
}

export type ChatUi = ChatUIConfig
