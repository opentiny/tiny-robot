/**
 * Suggestion 扩展
 *
 * 为 ChatInput 提供智能联想功能
 *
 * @example
 * ```typescript
 * import { Suggestion } from '@opentiny/vue-robot'
 *
 * const editor = useEditor({
 *   extensions: [
 *     Suggestion.configure({
 *       suggestions: [
 *         { content: 'ECS-云服务器' },
 *         { content: 'CDN-权限管理' }
 *       ]
 *     })
 *   ]
 * })
 * ```
 */

import { Extension } from '@tiptap/core'
import { createSuggestionPlugin } from './plugins'
import type { SuggestionOptions } from './types'
import './index.less'

/**
 * Suggestion 扩展定义
 *
 * 支持全局匹配模式的智能联想功能
 */
export const Suggestion = Extension.create<SuggestionOptions>({
  name: 'suggestion',

  addOptions() {
    return {
      char: null,
      suggestions: [],
      activeSuggestionKeys: ['Enter', 'Tab'],
      allowSpaces: true,
      popupWidth: 400,
      showAutoComplete: true,
      filterFn: undefined,
      onSelect: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        ...this.options,
      }),
    ]
  },
})

// 导出类型和工具函数
export * from './types'
export { SuggestionPluginKey } from './plugins'
export { filterSuggestions, syncAutoComplete } from './utils/filter'
export { processHighlights, highlightSuggestionText, convertHighlightsArrayToTextParts } from './utils/highlight'
