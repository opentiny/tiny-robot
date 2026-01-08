/**
 * Mention 扩展定义
 *
 * 定义 mention 节点的结构、属性、渲染方式和插件
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef, type WatchStopHandle } from 'vue'
import MentionView from './components/mention-view.vue'
import { createSuggestionPlugin, MentionPluginKey } from './plugin'
import { EXTENSION_NAMES } from '../constants'
import type { MentionOptions } from './types'
import { mentionCommands } from './commands'
import './index.less'

/**
 * Mention 扩展定义
 */
export const Mention = Node.create<MentionOptions>({
  name: EXTENSION_NAMES.MENTION,

  // 节点配置
  group: 'inline',
  inline: true,
  atom: true, // 不可编辑，作为整体
  selectable: true,
  draggable: false,

  // 节点属性
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
      value: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-value'),
        renderHTML: (attributes) => {
          if (!attributes.value) {
            return {}
          }
          return {
            'data-value': attributes.value,
          }
        },
      },
    }
  },

  // HTML 解析
  parseHTML() {
    return [
      {
        tag: 'span[data-mention]',
      },
    ]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes, {
        'data-mention': '',
        'data-id': node.attrs.id as string,
        'data-label': node.attrs.label as string,
        'data-value': node.attrs.value as string,
      }),
      `${this.options.char}${node.attrs.label as string}`,
    ]
  },

  // 使用 Vue 组件渲染
  addNodeView() {
    // @ts-expect-error - Vue SFC type compatibility
    return VueNodeViewRenderer(MentionView)
  },

  // 添加 storage 用于存储实例状态
  addStorage() {
    return {
      watchStopHandle: null as WatchStopHandle | null,
    }
  },

  onCreate() {
    const { items } = this.options

    // 如果是响应式数据，监听变化
    if (isRef(items)) {
      // 保存到实例 storage
      this.storage.watchStopHandle = watch(
        items,
        () => {
          // 触发一次事务，使插件重新计算状态
          // 使用 MentionPluginKey 而非字符串，确保插件能正确接收更新
          const tr = this.editor.state.tr
          tr.setMeta(MentionPluginKey, { type: 'mention-update' })
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

  // 添加 Suggestion 插件
  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        char: this.options.char,
        items: this.options.items,
        allowSpaces: this.options.allowSpaces || false,
      }),
    ]
  },

  // 配置选项
  addOptions() {
    return {
      items: [],
      char: '@',
    }
  },

  // 自定义命令
  addCommands() {
    return mentionCommands
  },
})
