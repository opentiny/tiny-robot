/**
 * Sender 类型定义（v0.4.0+）
 * Sender 是 ChatInput 的对外名称
 *
 * 本文件统一导出 Sender 组件的所有类型，包括：
 * - Props、Emits、Slots、Context（组件接口）
 * - 扩展类型（Template、Mention、Suggestion）
 * - 基础类型（StructuredData、SubmitTrigger 等）
 */

// ============================================
// 组件接口类型
// ============================================
export type {
  ChatInputProps as SenderProps,
  ChatInputEmits as SenderEmits,
  ChatInputSlots as SenderSlots,
  ChatInputContext as SenderContext,
} from '../chat-input/index.type'

// ============================================
// 扩展类型（供 Sender 使用）
// ============================================
export type {
  TemplateAttrs,
  TemplateOptions,
  TemplateItem,
  TemplateSelectAttrs,
} from '../chat-input/extensions/template'
export type { MentionAttrs, MentionOptions, MentionItem, MentionStructuredItem } from '../chat-input/extensions/mention'
export type {
  SuggestionItem as SenderSuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from '../chat-input/extensions/suggestion'

// ============================================
// 基础类型
// ============================================
export type {
  StructuredData,
  SubmitTrigger,
  DefaultActions,
  InputMode,
  AutoSize,
  SelectOption,
} from '../chat-input/index.type'
