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
import { watch, isRef } from 'vue'
import { createSuggestionPlugin, SuggestionPluginKey } from './plugins'
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
      items: [],
      suggestions: [],
      activeSuggestionKeys: ['Enter', 'Tab'],
      allowSpaces: true,
      popupWidth: 400,
      showAutoComplete: true,
      filterFn: undefined,
      onSelect: undefined,
    }
  },

  onCreate() {
    const items = this.options.items || this.options.suggestions

    if (isRef(items)) {
      watch(
        items,
        () => {
          // 触发更新
          const tr = this.editor.state.tr
          // 使用一个特殊的 meta 来触发插件更新，虽然实际上只要有 dispatch 就会触发 apply
          tr.setMeta(SuggestionPluginKey, { type: 'update' })
          this.editor.view.dispatch(tr)
        },
        { deep: true },
      )
    }
  },

  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        ...this.options,
        // 确保传递 items
        items: this.options.items || this.options.suggestions || [],
      }),
    ]
  },
})

// 导出类型和工具函数
export * from './types'
export { SuggestionPluginKey } from './plugins'
export { filterSuggestions, syncAutoComplete } from './utils/filter'
export { processHighlights, highlightSuggestionText, convertHighlightsArrayToTextParts } from './utils/highlight'
