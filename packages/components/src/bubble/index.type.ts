import { Component, VNode } from 'vue'

/**
 * 工具调用接口（支持 OpenAI 格式）
 */
interface ToolCall {
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
export type ChatMessageContent = string | { type: string; [key: string]: any }[]

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
  hidden?: boolean
  state?: S
}

export type BubbleProps = BubbleMessage & {
  avatar?: VNode | Component
  placement?: 'start' | 'end'
  shape?: 'corner' | 'rounded' | 'none'
  contentRenderMode?: 'single' | 'split'
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
  find: (messages: BubbleMessage[], contentIndex?: number) => boolean
  renderer: Component<BubbleBoxRendererProps>
  priority?: number
  attributes?: Record<string, string>
}

export type BubbleContentRendererMatch = {
  find: (message: BubbleMessage, contentIndex?: number) => boolean
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
  contentIndex?: number
}

type BubbleSlotProps = { messages: BubbleMessage[]; role?: string }

export interface BubbleSlots {
  prefix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleSlotProps & { contentIndex?: number }) => VNode | VNode[]
  after?: (slotProps: BubbleSlotProps) => VNode | VNode[]
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
   * 角色配置（头像、位置、形状）
   */
  roleConfigs?: Record<string, BubbleRoleConfig>
  contentRenderMode?: BubbleProps['contentRenderMode']
}

export interface BubbleProviderProps {
  boxRendererMatches?: BubbleBoxRendererMatch[]
  contentRendererMatches?: BubbleContentRendererMatch[]
  fallbackBoxRenderer?: Component<BubbleBoxRendererProps>
  fallbackContentRenderer?: Component<BubbleContentRendererProps>
  initialStore?: Record<string, unknown>
}

type BubbleListSlotProps = BubbleSlotProps & {
  messageIndexes: number[]
}

export interface BubbleListSlots {
  prefix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleListSlotProps & { contentIndex?: number }) => VNode | VNode[]
  after?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
}
