/**
 * Suggestion 扩展定义
 */

import { Extension } from '@tiptap/core'
import { watch, isRef } from 'vue'
import { createSuggestionPlugin, SuggestionPluginKey } from './plugin'
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
      items: [],
      activeSuggestionKeys: ['Enter', 'Tab'],
      popupWidth: 400,
      showAutoComplete: true,
      filterFn: undefined,
      onSelect: undefined,
    }
  },

  onCreate() {
    if (isRef(this.options.items)) {
      watch(
        this.options.items,
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
      }),
    ]
  },
})
