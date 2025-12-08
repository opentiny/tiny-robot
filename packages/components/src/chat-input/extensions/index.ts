/**
 * Tiptap 扩展统一导出
 */

// ===== Mention =====
export { Mention, mention, MentionPluginKey } from './mention'
export { getMentions, getTextWithMentions, getMentionStructuredData } from './mention'
export type { MentionAttrs, MentionOptions, MentionItem, MentionStructuredItem } from './mention'

// ===== Suggestion =====
export { Suggestion, suggestion, SuggestionPluginKey } from './suggestion'
export { syncAutoComplete, processHighlights, highlightSuggestionText } from './suggestion'
export type {
  SuggestionItem,
  SuggestionOptions,
  SuggestionState,
  SuggestionTextPart,
  HighlightFunction,
} from './suggestion'

// ===== Template =====
export { Template, template } from './template'
export { getTemplateStructuredData, getTextWithTemplates } from './template'
export type { TemplateAttrs, TemplateOptions } from './template'
