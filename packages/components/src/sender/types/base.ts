import type { TooltipContent, TooltipPlacement } from '../../sender-actions/types/common'
import type { MentionItem, MentionStructuredItem } from '../extensions/mention/types'

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
 * 移动端虚拟键盘回车键提示
 *
 * 用于自定义移动端虚拟键盘上回车键的显示文本或图标
 *
 * - `enter`: 插入换行
 * - `done`: 完成
 * - `go`: 前往
 * - `next`: 下一项
 * - `previous`: 上一项
 * - `search`: 搜索
 * - `send`: 发送（推荐用于聊天场景）
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint
 */
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'

// ============================================
// 模板相关类型
// ============================================

/**
 * 选择器选项
 */
export interface SelectOption {
  /**
   * 显示文本
   */
  label: string

  /**
   * 选择后的值
   */
  value: string

  /**
   * 自定义数据（可选）
   */
  data?: string
}

/**
 * 模板项（用户侧）
 *
 * 用户传入的模板数据格式
 * 组件内部会转换为 Tiptap 节点格式
 */
export type TemplateItem =
  | {
      /**
       * 模板 ID，可选
       * 如果不提供，组件会自动生成
       */
      id?: string

      /**
       * 类型：普通文本
       */
      type: 'text'

      /**
       * 内容
       */
      content: string
    }
  | {
      /**
       * 模板 ID，可选
       * 如果不提供，组件会自动生成
       */
      id?: string

      /**
       * 类型：模板块（可编辑）
       */
      type: 'block'

      /**
       * 内容
       */
      content: string
    }
  | {
      /**
       * 模板 ID，可选
       * 如果不提供，组件会自动生成
       */
      id?: string

      /**
       * 类型：选择器
       */
      type: 'select'

      /**
       * 内容（选中的值）
       */
      content: string

      /**
       * 占位文字（未选择时显示）
       */
      placeholder?: string

      /**
       * 选项列表
       */
      options?: SelectOption[]

      /**
       * 当前选中的值
       */
      value?: string
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
 * @see packages/components/src/sender/extensions/mention/types.ts
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
 * - `TemplateItem[]`: 使用 Template 扩展时返回（混合结构）
 * - `MentionStructuredItem[]`: 使用 Mention 扩展时返回（混合结构）
 *
 * @example Template 场景
 * ```typescript
 * function handleSubmit(text: string, data?: StructuredData) {
 *   // text: "帮我分析 的周报"
 *   // data: [
 *   //   { type: 'text', content: '帮我分析 ' },
 *   //   { type: 'block', content: '张三' },
 *   //   { type: 'text', content: ' 的周报' }
 *   // ]
 *
 *   // 提取模板块（可编辑部分）
 *   if (data && data.some(item => item.type === 'block')) {
 *     const blocks = data.filter(item => item.type === 'block')
 *     console.log('模板块:', blocks)
 *   }
 *
 *   // 提取选择器
 *   if (data && data.some(item => item.type === 'select')) {
 *     const selects = data.filter(item => item.type === 'select')
 *     console.log('选择器:', selects)
 *   }
 * }
 * ```
 *
 * @example Mention 场景
 * ```typescript
 * function handleSubmit(text: string, data?: StructuredData) {
 *   // text: "帮我分析 @张三 的周报"
 *   // data: [
 *   //   { type: 'text', content: '帮我分析 ' },
 *   //   { type: 'mention', content: '张三', value: '...' },
 *   //   { type: 'text', content: ' 的周报' }
 *   // ]
 *
 *   // 统一使用 content 属性
 *   const allContent = data?.map(item => item.content).join('')
 *   console.log('完整内容:', allContent)
 *
 *   // 提取 mention（正确的类型守卫）
 *   if (data && data.some(item => item.type === 'mention')) {
 *     const mentions = data.filter(item => item.type === 'mention')
 *     console.log('提及的人:', mentions.map(m => m.content))
 *     console.log('关联值:', mentions.map(m => m.value))
 *   }
 * }
 * ```
 */
export type StructuredData = TemplateItem[] | MentionStructuredItem[]

// ============================================
// 按钮配置相关类型
// ============================================

/**
 * 默认操作按钮配置
 *
 * 用于统一配置 Sender 的默认按钮（Clear、Submit）
 *
 * @example
 * ```typescript
 * const defaultActions = {
 *   submit: { disabled: !isValid, tooltip: '请完善表单' },
 *   clear: { tooltip: '清空内容' }
 * }
 * ```
 */
export interface DefaultActions {
  /**
   * 提交按钮配置
   */
  submit?: {
    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * 工具提示
     * - string: 简单文本
     * - () => string | VNode: 渲染函数，支持复杂内容
     */
    tooltip?: TooltipContent

    /**
     * Tooltip 位置
     */
    tooltipPlacement?: TooltipPlacement
  }

  /**
   * 清空按钮配置
   */
  clear?: {
    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * 工具提示
     * - string: 简单文本
     * - () => string | VNode: 渲染函数，支持复杂内容
     */
    tooltip?: TooltipContent

    /**
     * Tooltip 位置
     */
    tooltipPlacement?: TooltipPlacement
  }
}

// ============================================
// 工具类型
// ============================================

/**
 * 自动高度配置
 */
export type AutoSize = boolean | { minRows: number; maxRows: number }
