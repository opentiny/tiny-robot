import type { Extension } from '@tiptap/core'
import type { InputMode, SubmitTrigger, DefaultActions, AutoSize, StructuredData, EnterKeyHint } from './types/base'
import type { SenderSubmitMeta } from './types/submit-meta'

// 导出所有子模块类型
export * from './types/base'
export * from './types/composables'
export * from './types/components'
export * from './types/context'
export * from './types/slots'
export type {
  SenderAttachmentPayload,
  SenderExternalPayload,
  SenderExternalPayloadSourceId,
  SenderSubmitMeta,
} from './types/submit-meta'

// 导入插槽作用域类型
import type { SenderSlotScope } from './types/slots'

// 导出扩展类型（供用户使用）
export type { MentionItem } from './extensions/mention'
export type {
  SenderSuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './extensions/suggestion'

// ============================================
// 主组件 Props
// ============================================

/**
 * Sender 组件 Props
 */
export interface SenderProps {
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

  /**
   * 移动端虚拟键盘回车键提示
   *
   * 用于自定义移动端虚拟键盘上回车键的显示文本或图标
   *
   * @default 'send'
   */
  enterkeyhint?: EnterKeyHint

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

  /**
   * 是否存在外部可提交内容
   *
   * 用于附件、图片、文件列表等不写入编辑器文本的内容场景。
   * 当编辑器文本为空但该值为 true 时，Sender 仍会认为存在可提交内容。
   *
   * @deprecated 若使用 TrAttachments，请改用 contentSourceId 注册附件内容。
   *
   * @default false
   */
  hasExternalContent?: boolean

  // ===== 扩展配置 =====

  /**
   * Tiptap 扩展配置
   *
   * 用于添加增强输入能力，如 Template、Mention、Suggestion 等
   *
   * @example 基础使用
   * ```typescript
   * import { Template } from '@tiny-robot/components/sender/extensions'
   *
   * <Sender :extensions="[Template]" />
   * ```
   *
   * @example 带配置的扩展（响应式推荐）
   * ```typescript
   * import { Mention, Suggestion } from '@tiny-robot/components/sender/extensions'
   *
   * const mentions = ref([...])
   * const suggestions = ref([...])
   *
   * const extensions = [
   *   Mention.configure({ items: mentions }),
   *   Suggestion.configure({ items: suggestions })
   * ]
   *
   * <Sender :extensions="extensions" />
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extensions?: Extension[] | any[]

  // ===== 样式定制 =====

  /**
   * 组件尺寸
   *
   * - normal: 正常尺寸（默认）
   * - small: 紧凑模式，更小的字体、间距和图标
   *
   * @default 'normal'
   */
  size?: 'normal' | 'small'

  /**
   * 停止按钮文字
   *
   * @default '停止响应'
   */
  stopText?: string

  // ===== 默认按钮配置 =====

  /**
   * 默认操作按钮配置
   *
   * 用于统一配置默认按钮（Clear、Submit）的状态和提示
   *
   * @example 基础使用
   * ```vue
   * <Sender
   *   :actions-config="{
   *     submit: { disabled: !isValid, tooltip: '请完善表单' }
   *   }"
   * />
   * ```
   *
   * @example 动态配置
   * ```vue
   * <script setup>
   * const defaultActions = computed(() => ({
   *   submit: {
   *     disabled: !canSubmit.value,
   *     tooltip: canSubmit.value ? '发送' : '请输入内容'
   *   },
   *   clear: { tooltip: '清空输入' }
   * }))
   * </script>
   *
   * <template>
   *   <Sender :actions-config="defaultActions" />
   * </template>
   * ```
   *
   * @default undefined
   */
  defaultActions?: DefaultActions

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
 * Sender 组件 Emits
 */
export interface SenderEmits {
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
   *     // Template 场景
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
  (e: 'submit', textContent: string, structuredData?: StructuredData, meta?: SenderSubmitMeta): void

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
   * 取消事件
   *
   * 在 loading 状态下点击停止按钮时触发
   * 用于取消正在进行的操作（如 AI 响应）
   *
   * @param e - 事件名
   */
  (e: 'cancel'): void

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
 * Sender 组件 Slots
 */
export interface SenderSlots {
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
   *
   * @example
   * ```vue
   * <sender>
   *   <template #actions-inline="{ insert, focus, disabled }">
   *     <voice-input @result="insert" :disabled="disabled" />
   *     <file-upload @select="handleFiles" />
   *   </template>
   * </sender>
   * ```
   */
  'actions-inline'?: (scope: SenderSlotScope) => unknown

  /**
   * 底部插槽（多行模式）
   */
  footer?: (scope: SenderSlotScope) => unknown

  /**
   * 底部右侧插槽（多行模式）
   */
  'footer-right'?: (scope: SenderSlotScope) => unknown
}
