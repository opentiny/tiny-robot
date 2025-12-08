/**
 * Tiptap 扩展统一导出
 */

export { Template, getTemplateStructuredData, getTextWithTemplates } from './template'
export type { TemplateAttrs, TemplateOptions } from './template'

export { Mention, MentionPluginKey, getMentions, getMentionStructuredData, getTextWithMentions } from './mention'
export type { MentionAttrs, MentionOptions, MentionItem, MentionStructuredItem } from './mention'

export { Suggestion, SuggestionPluginKey } from './suggestion'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './suggestion'
