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
  [x: string]: unknown
}

/**
 * 聊天消息接口（支持 OpenAI 格式）
 */
export interface BubbleChatMessage {
  role: string
  content?: string | BubbleChatMessageItem[]
  reasoning_content?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

/**
 * 多态内容项
 * 用于支持多种内容类型（文本、图片、音频等）
 */
export interface BubbleChatMessageItem {
  /**
   * 内容类型标识符（例如：'text'、'image_url' 等）
   */
  type?: string
  /**
   * 内容类型特定的附加属性
   */
  [key: string]: unknown
}

/**
 * Bubble 组件 Props
 * 用于渲染单个气泡的外观和内容
 */
export type BubbleProps = Omit<BubbleChatMessage, 'role'> & {
  role?: string
  /**
   * 气泡头像
   */
  avatar?: VNode | Component
  /**
   * 气泡对齐位置，默认 'start'
   */
  placement?: 'start' | 'end'
  /**
   * 气泡形状，默认 'corner'
   */
  shape?: 'rounded' | 'corner' | 'none'
  /**
   * 气泡加载状态
   */
  loading?: boolean
  /**
   * 是否隐藏气泡
   */
  hidden?: boolean
  /**
   * 是否拆分多态内容（每个内容项各自渲染一个气泡）
   * - true：每个内容项各自渲染一个气泡
   * - false：所有内容项合并在同一个气泡中渲染（默认）
   */
  splitPolymorphic?: boolean
  /**
   * 额外配置
   */
  extras?: Record<string, unknown>
}

type BubbleSlotProps =
  | {
      rendererMessages: BubbleRendererMessage[]
      role?: string
      isPolymorphic?: undefined
      isFirstPolymorphic?: undefined
      polymorphicIndex?: undefined
    }
  | {
      rendererMessages: BubbleRendererMessage[]
      role?: string
      isPolymorphic: boolean
      isFirstPolymorphic: boolean
      polymorphicIndex: number
    }

export interface BubbleSlots {
  prefix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleSlotProps) => VNode | VNode[]
  after?: (slotProps: BubbleSlotProps) => VNode | VNode[]
}

/**
 * 基础消息类型（移除了样式相关属性）
 */
type BubbleBaseMessage = Omit<
  BubbleProps,
  'content' | 'role' | 'avatar' | 'placement' | 'shape' | 'splitPolymorphic'
> & {
  role: string
}

/**
 * 普通消息（字符串内容）
 */
export type BubblePlainMessage = BubbleBaseMessage & { content: string }
/**
 * 多态消息（数组内容）
 */
export type BubblePolymorphicMessage = BubbleBaseMessage & { content: BubbleChatMessageItem[] }
/**
 * 统一消息类型
 */
export type BubbleMessage = BubblePlainMessage | BubblePolymorphicMessage

/**
 * BubbleList 组件 Props
 * 用于管理消息流和分组策略
 */
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
  /**
   * 是否拆分多态内容配置
   */
  splitPolymorphic?: BubbleProps['splitPolymorphic']
}

type BubbleItemSlotProps = BubbleSlotProps & {
  messages: BubbleMessage[]
}

export interface BubbleItemSlot {
  prefix?: (slotProps: BubbleItemSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleItemSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleItemSlotProps) => VNode | VNode[]
  after?: (slotProps: BubbleItemSlotProps) => VNode | VNode[]
}

type BubbleListSlotProps = BubbleItemSlotProps & {
  index: number
}

export interface BubbleListSlots {
  prefix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  suffix?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  'content-footer'?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
  after?: (slotProps: BubbleListSlotProps) => VNode | VNode[]
}

/**
 * 角色配置
 * 用于配置不同角色的气泡样式
 */
export type BubbleRoleConfig = Pick<BubbleProps, 'avatar' | 'placement' | 'shape' | 'hidden'>

/**
 * 普通消息分组（内容为字符串）
 */
type BubblePlainMessageGroup = {
  role: string
  messages: BubblePlainMessage[]
  isPolymorphic: false
}

/**
 * 多态消息分组（内容为 BubbleChatMessageItem 数组）
 */
type BubblePolymorphicMessageGroup = {
  role: string
  messages: BubblePolymorphicMessage[]
  isPolymorphic: true
}

/**
 * 统一分组类型
 */
export type BubbleMessageGroup = BubblePlainMessageGroup | BubblePolymorphicMessageGroup
/**
 * 自定义分组函数类型
 */
type BubbleGroupFunction = (messages: BubbleMessage[], dividerRole?: string) => BubbleMessageGroup[]
/**
 * 气泡容器属性
 */
export type BubbleBoxProps = Pick<BubbleProps, 'placement' | 'shape'>
/**
 * 渲染器消息（扁平化的单条内容）
 */
export type BubbleRendererMessage<
  T = string | BubbleChatMessageItem | undefined,
  E extends Record<string, unknown> = Record<string, unknown>,
> = Omit<BubbleBaseMessage, 'role'> & {
  role?: string
  content: T
  extras?: E
}

/**
 * ContentBox 组件 Props
 */
export type BubbleContentBoxProps = BubbleBoxProps & {
  messages: BubbleRendererMessage[]
}

export interface BubbleProviderProps {
  boxRendererMatches?: BubbleBoxRendererMatch[]
  contentRendererMatches?: BubbleContentRendererMatch[]
  fallbackBoxRenderer?: Component
  fallbackContentRenderer?: Component
}

export type BubbleBoxRendererMatch = {
  find: (props: BubbleContentBoxProps) => boolean
  renderer: Component
  priority?: number
}

export type BubbleContentRendererMatch = {
  find: (message: BubbleRendererMessage) => boolean
  renderer: Component
  priority?: number
}
