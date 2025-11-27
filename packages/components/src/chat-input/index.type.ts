/**
 * Chat-Input 组件类型定义
 *
 * 本文件包含 Chat-Input 组件的所有类型定义
 * 遵循"组合优于配置"的设计哲学
 */

import type { InputMode, TemplateItem, SkillItem, SubmitTrigger, ButtonGroupConfig, AutoSize } from './types/base'
import type { SuggestionItem } from './extensions/suggestion'

// 导出所有子模块类型
export * from './types/base'
export * from './types/composables'
export * from './types/components'
export * from './types/context'
export type { SuggestionItem } from './extensions/suggestion'

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

  /**
   * 模板数据（双向绑定）
   *
   * 支持 v-model:templateData
   */
  templateData?: TemplateItem[]

  /**
   * 技能列表
   *
   * 用于 @ 提及功能
   */
  skills?: SkillItem[]

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

  // ===== 功能开关 =====

  /**
   * 是否允许语音输入
   *
   * @default false
   */
  allowSpeech?: boolean

  /**
   * 是否允许文件上传
   *
   * @default false
   */
  allowFiles?: boolean

  // ===== 输入联想 =====

  /**
   * 建议列表
   *
   * 提供输入联想功能
   */
  suggestions?: SuggestionItem[]

  /**
   * 建议触发字符
   *
   * - null: 全局匹配模式（默认）
   * - string: 字符触发模式（如 '/'）
   *
   * @default null
   */
  suggestionChar?: string | null

  /**
   * 建议弹窗宽度
   *
   * @default 400
   */
  suggestionPopupWidth?: number | string

  /**
   * 激活建议项的按键
   *
   * @default ['Enter', 'Tab']
   */
  activeSuggestionKeys?: string[]

  /**
   * 是否显示自动补全提示
   *
   * @default true
   */
  showAutoComplete?: boolean

  /**
   * 是否为受控模式
   *
   * - false (默认): 组件内部自动过滤
   * - true: 用户自己控制过滤，传入已过滤的列表
   *
   * @default false
   */
  suggestionControlled?: boolean

  /**
   * 当前输入的查询文本（受控模式下使用）
   * 用于计算自动补全时的前缀匹配
   */
  suggestionQuery?: string

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
   * 注意：当前主要使用 submit 配置，file 和 voice 配置需要配合 allowFiles 和 allowSpeech 使用
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
   * 更新模板数据
   *
   * @param e - 事件名
   * @param value - 新模板数据
   */
  (e: 'update:templateData', value: TemplateItem[]): void

  /**
   * 提交内容
   *
   * @param e - 事件名
   * @param value - 提交的内容（默认拼接结果）
   * @param context - 提交上下文（包含原始数据）
   */
  (e: 'submit', value: string, context: { presets: string[]; userText: string }): void

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

  /**
   * 选择建议项时触发
   *
   * @param e - 事件名
   * @param value - 选中的建议内容
   */
  (e: 'suggestion-select', value: string): void

  /**
   * 查询文本变化时触发（受控模式下使用）
   *
   * @param e - 事件名
   * @param query - 当前查询文本
   */
  (e: 'suggestion-query-change', query: string): void
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
