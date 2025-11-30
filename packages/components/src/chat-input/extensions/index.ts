/**
 * Tiptap 扩展统一导出
 */

export { TemplateBlock, getTemplateStructuredData } from './template-block'
export type { TemplateBlockAttrs, TemplateBlockOptions } from './template-block'

export { Mention, MentionPluginKey, getMentions } from './mention'
export type { MentionAttrs, MentionOptions, MentionItem } from './mention'

export { Suggestion, SuggestionPluginKey } from './suggestion'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './suggestion'
