/**
 * Sender 组件入口（v0.4.0+）
 * Sender 是 ChatInput 的对外名称
 */
import ChatInput from '../chat-input'

const Sender = ChatInput
Sender.name = 'TrSender'

export default Sender

// 重新导出类型
export type {
  ChatInputProps as SenderProps,
  ChatInputEmits as SenderEmits,
  ChatInputSlots as SenderSlots,
  ChatInputContext as SenderContext,
  TemplateItem,
  MentionItem,
  DefaultActions,
} from '../chat-input/index.type'

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

export { useChatInputContext as useSenderContext } from '../chat-input/context'
