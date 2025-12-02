/**
 * 扩展便捷函数
 *
 * 提供简化的 API，用于快速创建扩展实例
 */

import type { Ref } from 'vue'
import { Mention, Suggestion, TemplateBlock } from '../extensions'
import type { MentionItem, MentionOptions } from '../extensions/mention'
import type { SuggestionItem, SuggestionOptions } from '../extensions/suggestion'
import type { TemplateItem } from '../index.type'
import type { TemplateBlockOptions } from '../extensions/template-block'

/**
 * 创建 Mention 扩展（便捷函数）
 *
 * @param items - 提及项列表
 * @param char - 触发字符，默认 '@'
 * @param options - 其他配置项
 *
 * @example 基础用法
 * ```typescript
 * const extensions = [mention(mentions)]
 * ```
 *
 * @example 自定义触发字符
 * ```typescript
 * const extensions = [mention(mentions, '#')]
 * ```
 */
export function mention(
  items: MentionItem[] | Ref<MentionItem[]>,
  char: string = '@',
  options?: Partial<Omit<MentionOptions, 'items' | 'char'>>,
) {
  return Mention.configure({
    items,
    char,
    ...options,
  })
}

/**
 * 创建 Suggestion 扩展（便捷函数）
 *
 * @param items - 建议项列表
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [suggestion(suggestions)]
 * ```
 */
export function suggestion(
  items: SuggestionItem[] | Ref<SuggestionItem[]>,
  options?: Partial<Omit<SuggestionOptions, 'items'>>,
) {
  return Suggestion.configure({
    items,
    ...options,
  })
}

/**
 * 创建 TemplateBlock 扩展（便捷函数）
 *
 * @param items - 模板项列表
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [template(templates)]
 * ```
 */
export function template(
  items: TemplateItem[] | Ref<TemplateItem[]>,
  options?: Partial<Omit<TemplateBlockOptions, 'items'>>,
) {
  return TemplateBlock.configure({
    items,
    ...options,
  })
}
