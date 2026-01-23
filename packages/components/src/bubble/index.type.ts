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
  startIndex: number
}

export type BubbleBoxRendererMatch = {
  /**
   * 匹配函数，用于判断是否应该使用此渲染器
   * @param messages - 消息数组
   * @param content - 要渲染的内容项。仅在 `split` 模式下（contentIndex 为数字）才会传入；为当前消息（messages[0]）经过 `contentResolver` 解析后的内容；`messages[0].content` 一定是一个数组，`content` 则为对应索引的内容项，即 `messages[0].content[contentIndex]`；当 contentIndex 为 undefined 时，content 也为 undefined
   * @param contentIndex - 内容索引，用于指定要渲染的内容项。仅在 split 模式下才会传入（为数字），此时 messages 数组长度为 1
   * @returns 如果匹配则返回 true，否则返回 false
   */
  find: (
    messages: BubbleMessage[],
    content: ChatMessageContentItem | undefined,
    contentIndex: number | undefined,
  ) => boolean
  renderer: Component<BubbleBoxRendererProps>
  priority?: number
  attributes?: Record<string, string>
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
  attributes?: Record<string, string>
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
   * - 'divider': 按分割角色分组（连续的分割角色在一组，其他消息在另一组）
   * - 自定义函数: (messages, dividerRole) => BubbleMessageGroup[]
   *
   * 特殊情况：
   * - 当 message 的 content 为数组时，该 message 会被单独作为一个独立分组
   * - 该独立分组会被"密封"，后续的消息（即使角色相同）也不会被添加到这个分组中
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
   * 是否自动滚动到底部。需要满足以下条件：
   * - BubbleList 是可滚动容器（需要 scrollHeight > clientHeight）
   * - 滚动容器接近底部
   *
   * @default false
   */
  autoScroll?: boolean
}

export interface BubbleProviderProps {
  boxRendererMatches?: BubbleBoxRendererMatch[]
  contentRendererMatches?: BubbleContentRendererMatch[]
  fallbackBoxRenderer?: Component<BubbleBoxRendererProps>
  fallbackContentRenderer?: Component<BubbleContentRendererProps>
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
