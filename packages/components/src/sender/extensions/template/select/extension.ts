/**
 * TemplateSelect 扩展定义
 */

import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { TemplateSelectAttrs } from '../types'
import TemplateSelectView from './template-select-view.vue'
import { selectDropdownStatePlugin, selectZeroWidthPlugin, selectKeyboardPlugin } from './plugins'
import { NODE_TYPE_NAMES } from '../../constants'

/**
 * TemplateSelect 节点定义
 */
export const TemplateSelect = Node.create<Record<string, unknown>>({
  name: NODE_TYPE_NAMES.TEMPLATE_SELECT,

  // 节点配置
  group: 'inline',
  inline: true,
  atom: true, // 原子节点，光标不能进入
  selectable: false,
  draggable: false,

  // 节点属性
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return { 'data-id': attributes.id }
        },
      },
      placeholder: {
        default: 'Please select',
        parseHTML: (element) => element.getAttribute('data-placeholder'),
        renderHTML: (attributes) => {
          return { 'data-placeholder': attributes.placeholder }
        },
      },
      options: {
        default: [],
        parseHTML: (element) => {
          const optionsStr = element.getAttribute('data-options')
          if (!optionsStr) return []

          try {
            return JSON.parse(optionsStr)
          } catch (error) {
            console.warn('Failed to parse template select options:', error)
            return []
          }
        },
        renderHTML: (attributes) => {
          try {
            return { 'data-options': JSON.stringify(attributes.options) }
          } catch (error) {
            console.error('Failed to stringify template select options:', error)
            return { 'data-options': '[]' }
          }
        },
      },
      value: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-value') || null,
        renderHTML: (attributes) => {
          if (!attributes.value) return {}
          return { 'data-value': attributes.value }
        },
      },
    }
  },

  // HTML 解析
  parseHTML() {
    return [
      {
        tag: 'span[data-template-select]',
      },
    ]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    const selectedOption = (node.attrs.options as TemplateSelectAttrs['options']).find(
      (opt) => opt.value === node.attrs.value,
    )
    const displayText = selectedOption?.label || node.attrs.placeholder

    let optionsStr = '[]'
    try {
      optionsStr = JSON.stringify(node.attrs.options)
    } catch (error) {
      console.error('Failed to stringify template select options in renderHTML:', error)
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-template-select': '',
        'data-id': node.attrs.id as string,
        'data-placeholder': node.attrs.placeholder as string,
        'data-options': optionsStr,
        'data-value': (node.attrs.value as string) || '',
      }),
      displayText,
    ]
  },

  // 使用 Vue 组件渲染
  addNodeView() {
    // @ts-expect-error - Vue SFC type compatibility
    return VueNodeViewRenderer(TemplateSelectView)
  },

  // 添加插件
  addProseMirrorPlugins() {
    return [selectDropdownStatePlugin(), selectZeroWidthPlugin(), selectKeyboardPlugin()]
  },
})
