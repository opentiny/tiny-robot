/**
 * Chat-Input 组件类型定义
 *
 * 本文件包含 Chat-Input 组件的所有类型定义
 * 遵循"组合优于配置"的设计哲学
 */

import type { Extension } from '@tiptap/core'
import type { InputMode, SubmitTrigger, ButtonGroupConfig, AutoSize, StructuredData } from './types/base'

// 导出所有子模块类型
export * from './types/base'
export * from './types/composables'
export * from './types/components'
export * from './types/context'

// 导出扩展类型（供用户使用）
export type { SuggestionItem } from './extensions/suggestion/types'
export type { MentionItem } from './extensions/mention'

// 导出配置类型
export interface DefaultConfig {
  placeholder: string
  mode: InputMode
  submitType: SubmitTrigger
  autoSize: { minRows: number; maxRows: number }
}

// ============================================
// 主组件 Props
// ============================================

/**
 * Chat-Input 组件 Props
 */
export interface ChatInputProps {
  // ===== 核心数据 =====

  /**
   * 输入内容（双向绑定）
   *
   * 支持 v-model
   */
  modelValue?: string

  /**
   * 默认值
   *
   * 仅在初始化时使用
   */
  defaultValue?: string

  // ===== 基础配置 =====

  /**
   * 占位符文本
   *
   * @default '请输入内容...'
   */
  placeholder?: string

  /**
   * 是否禁用
   *
   * @default false
   */
  disabled?: boolean

  /**
   * 是否加载中
   *
   * 加载状态下显示停止按钮
   *
   * @default false
   */
  loading?: boolean

  /**
   * 是否自动聚焦
   *
   * @default false
   */
  autofocus?: boolean

  // ===== 模式控制 =====

  /**
   * 输入模式
   *
   * - single: 单行模式
   * - multiple: 多行模式
   *
   * @default 'single'
   */
  mode?: InputMode

  /**
   * 自动调整高度
   *
   * - false: 不自动调整
   * - true: 自动调整（默认 1-3 行）
   * - { minRows, maxRows }: 自定义行数范围
   *
   * 仅在 mode === 'multiple' 时有效
   *
   * @default { minRows: 1, maxRows: 3 }
   */
  autoSize?: AutoSize

  // ===== 内容控制 =====

  /**
   * 最大字符数
   *
   * @default Infinity
   */
  maxLength?: number

  /**
   * 是否显示字数限制
   *
   * 仅在 maxLength 有值时有效
   *
   * @default false
   */
  showWordLimit?: boolean

  /**
   * 是否显示清空按钮
   *
   * @default false
   */
  clearable?: boolean

  // ===== 扩展配置 =====

  /**
   * Tiptap 扩展配置
   *
   * 用于添加增强输入能力，如 TemplateBlock、Mention、Suggestion 等
   *
   * @example 基础使用
   * ```typescript
   * import { TemplateBlock } from '@tiny-robot/components/chat-input/extensions'
   *
   * <ChatInput :extensions="[TemplateBlock]" />
   * ```
   *
   * @example 带配置的扩展（响应式推荐）
   * ```typescript
   * import { Mention, Suggestion } from '@tiny-robot/components/chat-input/extensions'
   *
   * const mentions = ref([...])
   * const suggestions = ref([...])
   *
   * const extensions = [
   *   Mention.configure({ items: mentions }),
   *   Suggestion.configure({ items: suggestions })
   * ]
   *
   * <ChatInput :extensions="extensions" />
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extensions?: Extension[] | any[]

  // ===== 样式定制 =====

  /**
   * 停止按钮文字
   *
   * @default '停止响应'
   */
  stopText?: string

  // ===== 按钮组 =====

  /**
   * 按钮组配置
   *
   * 用于细粒度控制各个按钮的行为
   * 注意：当前主要使用 submit 配置
   *
   * @default undefined
   */
  buttonGroup?: ButtonGroupConfig

  // ===== 提交配置 =====

  /**
   * 提交触发方式
   *
   * @default 'enter'
   */
  submitType?: SubmitTrigger
}

// ============================================
// 主组件 Emits
// ============================================

/**
 * Chat-Input 组件 Emits
 */
export interface ChatInputEmits {
  /**
   * 更新输入内容
   *
   * @param e - 事件名
   * @param value - 新内容
   */
  (e: 'update:modelValue', value: string): void

  /**
   * 提交内容（增强版）
   *
   * @param e - 事件名
   * @param textContent - 提交的内容（纯文本，如 "帮我分析 @张三 的周报"）
   * @param structuredData - 结构化数据（可选）
   *
   * @example
   * ```typescript
   * function handleSubmit(text: string, data?: StructuredData) {
   *   console.log('纯文本:', text)
   *
   *   if (data?.template) {
   *     // TemplateBlock 场景
   *     console.log('模板数据:', data.template)
   *   }
   *
   *   if (data?.mentions) {
   *     // Mention 场景
   *     console.log('提及的人:', data.mentions)
   *   }
   * }
   * ```
   */
  (e: 'submit', textContent: string, structuredData?: StructuredData): void

  /**
   * 聚焦事件
   *
   * @param e - 事件名
   * @param event - 原生事件
   */
  (e: 'focus', event: FocusEvent): void

  /**
   * 失焦事件
   *
   * @param e - 事件名
   * @param event - 原生事件
   */
  (e: 'blur', event: FocusEvent): void

  /**
   * 清空事件
   *
   * @param e - 事件名
   */
  (e: 'clear'): void

  /**
   * 输入事件
   *
   * @param e - 事件名
   * @param value - 当前内容
   */
  (e: 'input', value: string): void
}

// ============================================
// 主组件 Slots
// ============================================

/**
 * Chat-Input 组件 Slots
 */
export interface ChatInputSlots {
  /**
   * 头部插槽
   */
  header?: () => unknown

  /**
   * 前缀插槽
   */
  prefix?: () => unknown

  /**
   * 内容插槽
   *
   * @param props - 插槽属性
   * @param props.editor - 编辑器实例
   */
  content?: (props: { editor: unknown }) => unknown

  /**
   * 单行模式内联操作按钮插槽
   */
  'actions-inline'?: () => unknown

  /**
   * 底部插槽（多行模式）
   */
  footer?: () => unknown

  /**
   * 底部右侧插槽（多行模式）
   */
  'footer-right'?: () => unknown
}
