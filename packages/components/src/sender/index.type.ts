/**
 * Sender 类型定义（v0.4.0+）
 * Sender 是 ChatInput 的对外名称
 *
 * 注意：扩展类型（如 SuggestionItem, TemplateAttrs 等）
 * 应该直接从 @opentiny/tiny-robot 导入，不通过 Sender 重新导出
 */

// 重新导出 ChatInput 的主要类型，使用 Sender 命名
export type {
  ChatInputProps as SenderProps,
  ChatInputEmits as SenderEmits,
  ChatInputSlots as SenderSlots,
  ChatInputContext as SenderContext,
} from '../chat-input/index.type'
