import type { VNode, Component } from 'vue'
import type { MentionItem } from '../extensions/mention/types'

// ============================================
// 基础类型
// ============================================

/**
 * 输入模式
 * - single: 单行模式，适用于简短输入
 * - multiple: 多行模式，适用于长文本输入
 */
export type InputMode = 'single' | 'multiple'

/**
 * 提交触发方式
 * - enter: Enter 键提交
 * - ctrlEnter: Ctrl+Enter 提交
 * - shiftEnter: Shift+Enter 提交
 */
export type SubmitTrigger = 'enter' | 'ctrlEnter' | 'shiftEnter'

/**
 * Tooltip 位置
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

// ============================================
// 模板相关类型
// ============================================

/**
 * 模板项（用户侧）
 *
 * 用户传入的模板数据格式
 * 组件内部会转换为 Tiptap 节点格式
 */
export interface TemplateItem {
  /**
   * 模板 ID，可选
   * 如果不提供，组件会自动生成
   */
  id?: string

  /**
   * 类型
   * - text: 普通文本
   * - template: 模板块
   */
  type: 'text' | 'template'

  /**
   * 内容
   */
  content: string
}

// ============================================
// Mention 相关类型（从扩展导入）
// ============================================

/**
 * 提及项
 *
 * 用于 @ 提及功能的数据
 *
 * @deprecated 请从 extensions/mention 导入
 * @see packages/components/src/chat-input/extensions/mention/types.ts
 */
export type { MentionItem }

// ============================================
// Submit 事件相关类型
// ============================================

/**
 * 结构化数据（联合类型）
 *
 * Submit 事件的第二个参数，根据使用的扩展直接返回对应的数据数组
 *
 * **设计理念**：
 * - 第一个参数 `text`：纯文本内容，适用于简单场景
 * - 第二个参数 `data`：结构化数据数组，直接使用无需解包
 *
 * **类型说明**：
 * - `TemplateItem[]`: 使用 TemplateBlock 扩展时返回
 * - `MentionItem[]`: 使用 Mention 扩展时返回
 *
 * @example TemplateBlock 场景
 * ```typescript
 * function handleSubmit(text: string, data?: StructuredData) {
 *   // text: "帮我分析 的周报"
 *   // data: [
 *   //   { type: 'text', content: '帮我分析 ' },
 *   //   { type: 'template', id: 't1', content: '张三' },
 *   //   { type: 'text', content: ' 的周报' }
 *   // ]
 *
 *   if (data && data[0]?.type) {
 *     // TemplateBlock 场景：数组元素有 type 字段
 *     const templates = data.filter(item => item.type === 'template')
 *     console.log('模板变量:', templates)
 *   }
 * }
 * ```
 *
 * @example Mention 场景
 * ```typescript
 * function handleSubmit(text: string, data?: StructuredData) {
 *   // text: "帮我分析 @张三 的周报"
 *   // data: [{ id: 'm1', label: '张三', preset: '...' }]
 *
 *   if (data && data[0]?.label) {
 *     // Mention 场景：数组元素有 label 字段
 *     const mentionedUsers = data.map(m => m.label)
 *     console.log('提及的人:', mentionedUsers)
 *   }
 * }
 * ```
 */
export type StructuredData = TemplateItem[] | MentionItem[]

// ============================================
// 语音输入相关类型
// ============================================

/**
 * 语音识别状态
 */
export interface SpeechState {
  /**
   * 是否正在录音
   */
  isRecording: boolean

  /**
   * 是否支持语音识别
   */
  isSupported: boolean

  /**
   * 错误信息
   */
  error?: Error
}

// ============================================
// 按钮配置相关类型
// ============================================

/**
 * 按钮组配置
 *
 * 用于细粒度控制各个按钮的行为
 */
export interface ButtonGroupConfig {
  /**
   * 文件上传按钮配置
   */
  file?: {
    /**
     * 工具提示
     */
    tooltips?: string

    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * Tooltip 位置
     */
    tooltipPlacement?: TooltipPlacement
  }

  /**
   * 提交按钮配置
   */
  submit?: {
    /**
     * 工具提示
     */
    tooltips?: string

    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * Tooltip 位置
     */
    tooltipPlacement?: TooltipPlacement
  }

  /**
   * 语音按钮配置
   */
  voice?: {
    /**
     * 自定义语音图标（未录音状态）
     */
    icon?: VNode | Component
  }
}

// ============================================
// 工具类型
// ============================================

/**
 * 自动高度配置
 */
export type AutoSize = boolean | { minRows: number; maxRows: number }
