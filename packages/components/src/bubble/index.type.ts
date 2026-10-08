import { Component, VNode } from 'vue'

/**
 * 工具调用接口（支持 OpenAI 格式）
 */
export interface ToolCall {
  id: string
  type: 'function' | string
  function: {
    name: string
    arguments: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChatMessageContentItem = { type: string; [key: string]: any }

export type ChatMessageContent = string | ChatMessageContentItem[]

export type AskUserStepType = 'single' | 'multiple' | 'text' | 'confirm'

export interface AskUserOption {
  label: string
  value: string
  description?: string
  disabled?: boolean
}

export interface AskUserChoiceAnswer {
  selected: string[]
  other?: {
    selected: boolean
    text: string
  }
}

export interface AskUserStep {
  id: string
  title: string
  summary?: string
  description?: string
  type: AskUserStepType
  options?: AskUserOption[]
  placeholder?: string
}

export interface AskUserContent {
  type: 'ask_user'
  id: string
  title?: string
  description?: string
  steps: AskUserStep[]
  submitLabel?: string
}

export type AskUserStatus = 'active' | 'submitting' | 'submitted' | 'error'

export interface AskUserState {
  status: AskUserStatus
  currentStep: number
  answers: Record<string, unknown>
  completedStepIds: string[]
  expanded?: boolean
  error?: string
  updatedAt?: number
}

/**
 * 聊天消息接口（支持 OpenAI 格式）
 */
interface ChatMessage<T extends ChatMessageContent = ChatMessageContent> {
  role: string
  content?: T
  reasoning_content?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

type ChatMessageWithOptionalRole<T extends ChatMessageContent = ChatMessageContent> = Omit<ChatMessage<T>, 'role'> & {
  role?: string
}

export type BubbleMessage<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> = ChatMessageWithOptionalRole<T> & {
  id?: string
  loading?: boolean
  state?: S
}

export interface BubbleErrorInfo {
  message: string
  name?: string
  code?: string | number
  details?: unknown
}

export interface BubbleErrorRendererProps {
  message: BubbleMessage
}

export type BubbleProps = BubbleMessage & {
  hidden?: boolean
  avatar?: VNode | Component
  placement?: 'start' | 'end'
  shape?: 'corner' | 'rounded' | 'none'
  contentRenderMode?: 'single' | 'split'
  contentResolver?: (message: BubbleMessage) => ChatMessageContent | undefined
  fallbackBoxRenderer?: Component<BubbleBoxRendererProps>
  fallbackContentRenderer?: Component<BubbleContentRendererProps>
}

export type BubbleMessageGroup = {
  role: string
  messages: BubbleMessage[]
  messageIndexes: number[]
  /**
   * @deprecated For custom groups with non-contiguous messages, deriving the global index from
   * startIndex plus a local index can be incorrect. Use messageIndexes for index mapping instead.
   */
  startIndex?: number
}

export type BubbleAttributes = Record<string, unknown>

export type BubbleBoxRendererContext = {
  contentRenderMode: 'single' | 'split'
  resolvedMessageContent: ChatMessageContent | undefined
}

export type BubbleBoxRendererAttributeMap = BubbleAttributes

export type BubbleBoxRendererAttributesResolver = (
  messages: BubbleMessage[],
  content: ChatMessageContentItem | undefined,
  contentIndex: number | undefined,
) => BubbleBoxRendererAttributeMap | undefined

export type BubbleBoxAttributesResolver = (
  messages: BubbleMessage[],
  content: ChatMessageContentItem | undefined,
  contentIndex: number | undefined,
) => BubbleAttributes | undefined

export type BubbleContentAttributesResolver = (
  message: BubbleMessage,
  content: ChatMessageContentItem,
  contentIndex: number,
) => BubbleAttributes | undefined

export type BubbleBoxAttributesConfig = BubbleAttributes | BubbleBoxAttributesResolver
export type BubbleContentAttributesConfig = BubbleAttributes | BubbleContentAttributesResolver

export type BubbleBoxRendererMatch = {
  /**
   * 匹配函数，用于判断是否应该使用此渲染器
   * @param messages - 消息数组
   * @param content - Box 仅包含一条消息时传入的内容项。single 模式为解析后内容的第一项，split 模式为 contentIndex 对应的内容项；Box 包含多条消息时为 undefined
   * @param contentIndex - Box 仅包含一条消息时传入的内容索引。single 模式为 0，split 模式为当前索引；Box 包含多条消息时为 undefined
   * @param context - Box 的渲染模式，以及单条消息经过 contentResolver 解析后的完整内容
   * @returns 如果匹配则返回 true，否则返回 false
   */
  find: (
    messages: BubbleMessage[],
    content: ChatMessageContentItem | undefined,
    contentIndex: number | undefined,
    context: BubbleBoxRendererContext,
  ) => boolean
  renderer: Component<BubbleBoxRendererProps>
  priority?: number
  attributes?: BubbleBoxRendererAttributeMap | BubbleBoxRendererAttributesResolver
}

export type BubbleContentRendererMatch = {
  /**
   * 匹配函数，用于判断是否应该使用此渲染器
   * @param message - 消息对象
   * @param content - 要渲染的内容项。为当前消息经过 contentResolver 解析并统一化后的内容项：若解析结果为数组，则取对应索引的内容项（由 contentIndex 指定）；若为字符串，则转为 { type: 'text', text: string }。统一化为 ChatMessageContentItem 对象格式
   * @param contentIndex - 内容索引。由 contentResolver 的解析结果为数组时使用。若 contentResolver 解析结果为字符串，content 会转换为对象，此时 contentIndex 为 0
   * @returns 如果匹配则返回 true，否则返回 false
   */
  find: (message: BubbleMessage, content: ChatMessageContentItem, contentIndex: number) => boolean
  renderer: Component<BubbleContentRendererProps>
  priority?: number
  attributes?: BubbleAttributes
}

export type BubbleBoxRendererProps = Pick<BubbleProps, 'placement' | 'shape'>

export type BubbleContentRendererProps<
  T extends ChatMessageContent = ChatMessageContent,
  S extends Record<string, unknown> = Record<string, unknown>,
> = {
  message: BubbleMessage<T, S>
  contentIndex: number
}

type BubbleSlotProps = { messages: BubbleMessage[]; role?: string }

export interface BubbleSlots {
  prefix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  after?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleSlotProps & { contentIndex?: number }) => VNode | VNode[]
}

/**
 * 角色配置
 * 用于配置不同角色的气泡样式
 */
export type BubbleRoleConfig = Pick<
  BubbleProps,
  'avatar' | 'placement' | 'shape' | 'hidden' | 'fallbackBoxRenderer' | 'fallbackContentRenderer'
>

/**
 * 自定义分组函数类型
 */
type BubbleGroupFunction = (messages: BubbleMessage[], dividerRole?: string) => BubbleMessageGroup[]

export interface BubbleListProps {
  messages: BubbleMessage[]
  /**
   * 分组策略：
   * - 'consecutive': 连续相同角色的消息合并为一组
   * - 'divider': 按分割角色分组（每条分割角色消息单独成组，其他消息在两个分割角色之间合并为一组）
   * - 自定义函数: (messages, dividerRole) => BubbleMessageGroup[]
   *
   * 特殊情况：
   * - hidden 的消息需要单独分组，连续的 hidden 可以同一组
   */
  groupStrategy?: 'consecutive' | 'divider' | BubbleGroupFunction
  /**
   * 'divider' 策略的分割角色
   * 具有此角色的消息将作为分割线
   * @default 'user'
   */
  dividerRole?: string
  /**
   * 当消息没有角色或角色为空时，使用此角色
   * @default 'assistant'
   */
  fallbackRole?: string
  /**
   * 角色配置（头像、位置、形状）
   */
  roleConfigs?: Record<string, BubbleRoleConfig>
  contentRenderMode?: BubbleProps['contentRenderMode']
  contentResolver?: BubbleProps['contentResolver']
  /**
   * 是否跟随渲染内容的尺寸变化自动滚动到底部。
   * 图片、Markdown 和自定义渲染器等异步增高时会继续跟随；用户向上滚动时暂停，回到底部后恢复。
   * 支持运行时响应式切换，不影响 scrollToBottom() 的手动调用。
   *
   * @default false
   */
  autoScroll?: boolean
}

export type BubbleEvent =
  | {
      name: 'state:update'
      payload: {
        key: string
        value: unknown
      }
    }
  | {
      name: string
      payload?: unknown
    }

export interface BubbleProviderProps {
  boxRendererMatches?: BubbleBoxRendererMatch[]
  contentRendererMatches?: BubbleContentRendererMatch[]
  boxAttributes?: BubbleBoxAttributesConfig
  contentAttributes?: BubbleContentAttributesConfig
  fallbackBoxRenderer?: Component<BubbleBoxRendererProps>
  fallbackContentRenderer?: Component<BubbleContentRendererProps>
  errorRenderer?: Component<BubbleErrorRendererProps> | null
  store?: Record<string, unknown>
}

type BubbleListSlotProps = BubbleSlotProps & {
  messageIndexes: number[]
}

export interface BubbleListSlots {
  prefix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  after?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleListSlotProps & { contentIndex?: number }) => VNode | VNode[]
}
