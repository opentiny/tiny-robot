/**
 * Mention 扩展
 *
 * 提及功能，用于提及某项的场景（如 @用户、#标签 等）
 * - 定义为 inline + atom 节点
 * - 支持自定义触发字符（默认为 @）
 * - 使用 @floating-ui/dom 定位弹窗
 * - 支持键盘和鼠标交互
 */

import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef } from 'vue'
import MentionView from './mention-view.vue'
import { createSuggestionPlugin, MentionPluginKey } from './plugins'
import type { MentionAttrs, MentionOptions, MentionItem, MentionStructuredItem } from './types'
import './commands.d.ts'
import './index.less'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `mention_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 获取所有 mention 节点（辅助函数）
 *
 * 返回文档中所有的 mention 节点数据
 */
export function getMentions(editor: Editor): MentionItem[] {
  const mentions: MentionItem[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'mention') {
      mentions.push({
        id: node.attrs.id as string,
        label: node.attrs.label as string,
        preset: (node.attrs.preset as string) || '',
      })
    }
  })

  return mentions
}

/**
 * 获取包含 mention 标签的完整文本
 *
 * 自动从编辑器中获取 mention 扩展的 char 配置
 *
 * @param editor - 编辑器实例
 *
 * @example
 * getTextWithMentions(editor) // @代码分析 hello world @文本分析 12315
 * // 如果配置了 char: '#'，则返回：#代码分析 hello world #文本分析 12315
 */
export function getTextWithMentions(editor: Editor): string {
  // 获取 mention 扩展的 char 配置
  const mentionExt = editor.extensionManager.extensions.find((ext) => ext.name === 'mention')
  const char = mentionExt?.options?.char || '@'

  let text = ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'mention') {
      // Mention 节点 (atom: true)：手动添加 char + label
      // 因为 atom 节点在 getText() 中会被跳过
      text += `${char}${node.attrs.label as string}`
    } else if (node.type.name === 'text') {
      // 文本节点：直接添加文本
      text += node.text || ''
    }
  })

  return text.trim()
}

/**
 * 获取结构化数据（包含文本和 mention 的混合结构）
 *
 * 返回按顺序排列的文本和 mention 节点，用于确认内容和顺序
 *
 * @example
 * 输入：帮我分析 @张三 的周报（或 #标签 等，取决于 char 配置）
 * 返回：[
 *   { type: 'text', content: '帮我分析 ' },
 *   { type: 'mention', content: '张三', preset: '...' },
 *   { type: 'text', content: ' 的周报' }
 * ]
 */
export function getMentionStructuredData(editor: Editor): MentionStructuredItem[] {
  const items: MentionStructuredItem[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
    // 只处理段落的直接子节点，避免重复收集
    if (parent && parent.type.name === 'paragraph') {
      if (node.type.name === 'mention') {
        // Mention 节点
        items.push({
          type: 'mention',
          content: node.attrs.label as string,
          preset: (node.attrs.preset as string) || '',
        })
      } else if (node.type.name === 'text') {
        // 文本节点
        const text = node.text || ''
        if (text) {
          // 合并连续的文本节点
          const lastItem = items[items.length - 1]
          if (lastItem && lastItem.type === 'text') {
            lastItem.content = (lastItem.content || '') + text
          } else {
            items.push({
              type: 'text',
              content: text,
            })
          }
        }
      }
    }
  })

  return items
}

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
    return VueNodeViewRenderer(MentionView, {
      extension: {
        options: {
          char: this.options.char,
        },
      },
    })
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
    return {
      /**
       * 插入 mention
       */
      insertMention:
        (attrs: Partial<MentionAttrs>) =>
        ({ commands }: { commands: Editor['commands'] }) => {
          return commands.insertContent({
            type: 'mention',
            attrs: {
              id: attrs.id || generateId(),
              label: attrs.label || '',
              preset: attrs.preset,
            },
          })
        },

      /**
       * 删除 mention
       */
      deleteMention:
        (id: string) =>
        ({ tr, state }: { tr: Editor['state']['tr']; state: Editor['state'] }) => {
          let deleted = false

          state.doc.descendants((node, pos) => {
            if (node.type.name === 'mention' && node.attrs.id === id) {
              tr.delete(pos, pos + node.nodeSize)
              deleted = true
              return false
            }
          })

          return deleted
        },
    }
  },
})

export default Mention
export { MentionPluginKey }
export type { MentionAttrs, MentionOptions }
export * from './types'
