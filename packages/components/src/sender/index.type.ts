/**
 * Sender 类型定义（v0.4.0+）
 * Sender 是 ChatInput 的对外名称
 */

// 重新导出 ChatInput 的所有类型，使用 Sender 命名
export type {
  ChatInputProps as SenderProps,
  ChatInputEmits as SenderEmits,
  ChatInputSlots as SenderSlots,
  ChatInputContext as SenderContext,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  MentionItem,
  DefaultActions,
} from '../chat-input/index.type'

// 扩展类型
export type {
  TemplateAttrs,
  TemplateOptions,
  MentionAttrs,
  MentionOptions,
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from '../chat-input/extensions'
