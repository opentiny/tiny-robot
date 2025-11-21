/**
 * SkillMention 扩展
 *
 * 技能提及功能，用于 @某种技能 的场景
 * - 定义为 inline + atom 节点
 * - 支持 @ 触发建议列表
 * - 使用 @floating-ui/dom 定位弹窗
 * - 支持键盘和鼠标交互
 */

import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import SkillMentionView from './skill-mention-view.vue'
import { createSuggestionPlugin, SkillMentionPluginKey } from './plugins'
import type { SkillMentionAttrs, SkillMentionOptions } from './types'
import './commands.d.ts'
import './index.less'

/**
 * SkillMention 扩展定义
 */
export const SkillMention = Node.create<SkillMentionOptions>({
  name: 'skillMention',

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
        tag: 'span[data-skill-mention]',
      },
    ]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-skill-mention': '',
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
    return VueNodeViewRenderer(SkillMentionView)
  },

  // 添加 Suggestion 插件
  addProseMirrorPlugins() {
    return [
      createSuggestionPlugin({
        editor: this.editor,
        char: this.options.char,
        skills: this.options.skills,
        allowSpaces: this.options.allowSpaces,
      }),
    ]
  },

  // 配置选项
  addOptions() {
    return {
      skills: [],
      char: '@',
      allowSpaces: false,
      HTMLAttributes: {},
    }
  },

  // 自定义命令
  addCommands() {
    return {
      /**
       * 插入技能 mention
       */
      insertSkillMention:
        (attrs: Partial<SkillMentionAttrs>) =>
        ({ commands }: { commands: Editor['commands'] }) => {
          return commands.insertContent({
            type: 'skillMention',
            attrs: {
              id: attrs.id || '',
              label: attrs.label || '',
              preset: attrs.preset,
            },
          })
        },

      /**
       * 删除技能 mention
       */
      deleteSkillMention:
        (id: string) =>
        ({ tr, state }: { tr: Editor['state']['tr']; state: Editor['state'] }) => {
          let deleted = false

          state.doc.descendants((node, pos) => {
            if (node.type.name === 'skillMention' && node.attrs.id === id) {
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

export default SkillMention
export { SkillMentionPluginKey }
export type { SkillMentionAttrs, SkillMentionOptions }
export * from './types'
