/**
 * Mention 扩展定义
 *
 * 定义 mention 节点的结构、属性、渲染方式和插件
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef } from 'vue'
import MentionView from './components/mention-view.vue'
import { createSuggestionPlugin } from './plugin'
import type { MentionOptions } from './types'
import { mentionCommands } from './commands'
import './index.less'

/**
 * Mention 扩展定义
 */
export const Mention = Node.create<MentionOptions>({
  name: 'mention',

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
      preset: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-preset'),
        renderHTML: (attributes) => {
          if (!attributes.preset) {
            return {}
          }
          return {
            'data-preset': attributes.preset,
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
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-mention': '',
        'data-id': node.attrs.id as string,
        'data-label': node.attrs.label as string,
        'data-preset': node.attrs.preset as string,
      }),
      `${this.options.char}${node.attrs.label as string}`,
    ]
  },

  // 使用 Vue 组件渲染
  addNodeView() {
    // @ts-expect-error - Vue SFC type compatibility
    return VueNodeViewRenderer(MentionView)
  },

  onCreate() {
    const { items } = this.options

    // 如果是响应式数据，监听变化
    if (isRef(items)) {
      watch(
        items,
        () => {
          // 触发一次事务，使插件重新计算状态
          // 我们发送一个空的 meta 事务来触发插件的 apply 方法
          const tr = this.editor.state.tr
          tr.setMeta('mention-update', true)
          this.editor.view.dispatch(tr)
        },
        { deep: true },
      )
    }
  },

  // 添加 Suggestion 插件
  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        char: this.options.char,
        items: this.options.items,
        allowSpaces: this.options.allowSpaces,
      }),
    ]
  },

  // 配置选项
  addOptions() {
    return {
      items: [],
      char: '@',
      allowSpaces: false,
      HTMLAttributes: {},
    }
  },

  // 自定义命令
  addCommands() {
    return mentionCommands
  },
})
