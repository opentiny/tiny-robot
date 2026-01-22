/**
 * Suggestion 扩展
 *
 * 为 Sender 提供智能联想功能
 */

import type { Ref } from 'vue'
import { Suggestion } from './extension'
import type { SenderSuggestionItem, SuggestionOptions } from './types'

// ===== 导出扩展类和工具 =====
export { Suggestion } from './extension'
export { SuggestionPluginKey } from './plugin'
export * from './types'
export { syncAutoComplete } from './utils/filter'
export { processHighlights, highlightSuggestionText, convertHighlightsArrayToTextParts } from './utils/highlight'

// ===== 便捷函数 =====

/**
 * 创建 Suggestion 扩展的便捷函数
 *
 * @param items - 建议项列表
 * @param options - 其他配置项
 *
 * @example
 * ```typescript
 * const extensions = [suggestion(suggestions)]
 * const extensions = [suggestion(suggestions, { popupWidth: 500 })]
 * ```
 */
export function suggestion(
  items: SenderSuggestionItem[] | Ref<SenderSuggestionItem[]>,
  options?: Partial<Omit<SuggestionOptions, 'items'>>,
) {
  return Suggestion.configure({
    items,
    ...options,
  })
}
