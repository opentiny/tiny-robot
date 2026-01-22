/**
 * Suggestion 扩展定义
 */

import { Extension } from '@tiptap/core'
import { watch, isRef, type WatchStopHandle } from 'vue'
import { createSuggestionPlugin, SuggestionPluginKey } from './plugin'
import type { SuggestionOptions } from './types'
import { EXTENSION_NAMES } from '../constants'
import './index.less'

/**
 * Suggestion 扩展定义
 *
 * 支持全局匹配模式的智能联想功能
 */
export const Suggestion = Extension.create<SuggestionOptions>({
  name: EXTENSION_NAMES.SUGGESTION,

  addOptions() {
    return {
      items: [],
      activeSuggestionKeys: ['Enter'],
      popupWidth: 400,
      showAutoComplete: true,
    }
  },

  // 添加 storage 用于存储实例状态
  addStorage() {
    return {
      watchStopHandle: null as WatchStopHandle | null,
    }
  },

  onCreate() {
    if (isRef(this.options.items)) {
      // 保存到实例 storage
      this.storage.watchStopHandle = watch(
        this.options.items,
        () => {
          // 触发更新
          const tr = this.editor.state.tr
          // 使用 SuggestionPluginKey 确保插件能正确接收更新
          tr.setMeta(SuggestionPluginKey, { type: 'update' })
          this.editor.view.dispatch(tr)
        },
        { deep: true },
      )
    }
  },

  onDestroy() {
    if (this.storage.watchStopHandle) {
      this.storage.watchStopHandle()
      this.storage.watchStopHandle = null
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
