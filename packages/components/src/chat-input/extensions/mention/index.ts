/**
 * Mention 扩展
 *
 * 提及功能，用于 @提及某项 的场景
 * - 定义为 inline + atom 节点
 * - 支持 @ 触发建议列表
 * - 使用 @floating-ui/dom 定位弹窗
 * - 支持键盘和鼠标交互
 */

import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { watch, isRef } from 'vue'
import MentionView from './mention-view.vue'
import { createSuggestionPlugin, MentionPluginKey } from './plugins'
import type { MentionAttrs, MentionOptions, MentionItem } from './types'
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
      `@${node.attrs.label as string}`,
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
