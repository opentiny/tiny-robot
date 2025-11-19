import { Component, VNode } from 'vue'
export * from './renderers/index.type'

/**
 * 工具调用接口（支持 OpenAI 格式）
 */
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

/**
 * 聊天消息接口（支持 OpenAI 格式）
 */
export interface ChatMessage {
  role: string
  content?: string | ChatMessageItem[]
  reasoning_content?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

/**
 * 多态内容项
 * 用于支持多种内容类型（文本、图片、音频等）
 */
export interface ChatMessageItem {
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
 * 气泡对齐位置
 */
export type BubblePlacement = 'start' | 'end'
/**
 * 气泡形状
 */
export type BubbleShape = 'rounded' | 'corner' | 'none'

/**
 * Bubble 组件 Props
 * 用于渲染单个气泡的外观和内容
 */
export type BubbleProps = Omit<ChatMessage, 'role'> & {
  role?: string
  /**
   * 多态内容渲染模式：
   * - 'split'：每个内容项各自渲染一个气泡
   * - 'merged'：所有内容项合并在同一个气泡中渲染
   */
  polymorphicContentMode?: 'split' | 'merged'
  /**
   * 气泡头像
   */
  avatar?: VNode | Component
  /**
   * 气泡对齐位置，默认 'start'
   */
  placement?: BubblePlacement
  /**
   * 气泡形状，默认 'corner'
   */
  shape?: BubbleShape
  /**
   * 气泡加载状态
   */
  loading?: boolean
  /**
   * 气泡中止状态
   */
  aborted?: boolean
  /**
   * 气泡中止文本
   */
  abortedText?: string
}

/**
 * 基础消息类型（移除了样式相关属性）
 */
export type BubbleBaseMessage = Omit<BubbleProps, 'content' | 'role' | 'avatar' | 'placement' | 'shape'> & {
  role: string
}

/**
 * 普通消息（字符串内容）
 */
export type BubblePlainMessage = BubbleBaseMessage & { content: string }
/**
 * 多态消息（数组内容）
 */
export type BubblePolymorphicMessage = BubbleBaseMessage & { content: ChatMessageItem[] }
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
   * 多态内容渲染模式配置
   */
  polymorphicContentMode?: BubbleProps['polymorphicContentMode']
}

/**
 * 角色配置
 * 用于配置不同角色的气泡样式
 */
export type BubbleRoleConfig = Pick<BubbleProps, 'avatar' | 'placement' | 'shape'>

/**
 * 普通消息分组（内容为字符串）
 */
export type BubblePlainMessageGroup = {
  role: string
  messages: BubblePlainMessage[]
  isPolymorphic: false
}

/**
 * 多态消息分组（内容为 ChatMessageItem 数组）
 */
export type BubblePolymorphicMessageGroup = {
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
export type BubbleGroupFunction = (messages: BubbleMessage[], dividerRole?: string) => BubbleMessageGroup[]
/**
 * 气泡容器属性
 */
export type BubbleBoxProps = Pick<BubbleProps, 'placement' | 'shape'>
/**
 * 渲染器消息（扁平化的单条内容）
 */
export type BubbleRendererMessage<T = string | ChatMessageItem | undefined> = Omit<BubbleProps, 'content'> & {
  content: T
}

/**
 * 渲染器组件 Props
 */
export type BubbleRendererProps = BubbleBoxProps & {
  messages: BubbleRendererMessage[]
}
