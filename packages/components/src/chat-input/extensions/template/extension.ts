/**
 * Template 扩展定义
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef } from 'vue'
import TemplateBlockView from './template-block-view.vue'
import { ensureZeroWidthChars, keyboardNavigationPlugin, pasteHandlerPlugin } from './plugins'
import type { TemplateOptions } from './types'
import { templateCommands } from './commands'
import './index.less'

/**
 * Template 扩展定义
 */
export const Template = Node.create<TemplateOptions>({
  name: 'template',

  // 节点配置
  group: 'inline',
  inline: true,
  content: 'text*', // 允许内部有文本内容
  atom: false, // 不是 atom 节点，允许光标进入
  selectable: true,
  draggable: false,

  // 配置选项
  addOptions() {
    return {
      items: undefined,
      HTMLAttributes: {},
    }
  },

  onCreate() {
    const { items } = this.options

    if (items && isRef(items)) {
      watch(
        items,
        () => {
          const currentItems = isRef(items) ? items.value : items
          if (currentItems !== null && currentItems !== undefined) {
            this.editor.commands.setTemplateData(currentItems)
            this.editor.commands.focusFirstTemplate()
          }
        },
        { deep: true, immediate: true },
      )
    }
  },

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
      content: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-content') || element.textContent,
        renderHTML: (attributes) => {
          return {
            'data-content': attributes.content,
          }
        },
      },
    }
  },

  // HTML 解析
  parseHTML() {
    return [
      {
        tag: 'span[data-template]',
      },
    ]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    const content = node.textContent || ''
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-template': '',
        'data-id': node.attrs.id as string,
        'data-content': content,
      }),
      content,
    ]
  },

  // 使用 Vue 组件渲染
  addNodeView() {
    // @ts-expect-error - Vue SFC type compatibility
    return VueNodeViewRenderer(TemplateBlockView)
  },

  // 添加插件
  addProseMirrorPlugins() {
    return [ensureZeroWidthChars(), keyboardNavigationPlugin(), pasteHandlerPlugin()]
  },

  // 添加命令
  addCommands() {
    return templateCommands
  },
})
