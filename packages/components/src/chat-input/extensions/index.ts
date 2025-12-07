/**
 * Tiptap 扩展统一导出
 */

export { Template, getTemplateStructuredData } from './template'
export type { TemplateAttrs, TemplateOptions } from './template'

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
