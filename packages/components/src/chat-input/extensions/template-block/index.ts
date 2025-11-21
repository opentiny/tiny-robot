/**
 * TemplateBlock 扩展
 *
 * 模板块节点，用于模板填充功能
 * - 定义为 inline + atom 节点
 * - 支持编辑和删除
 * - 自动管理光标位置
 */

import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import TemplateBlockView from './template-block-view.vue'
import type { TemplateItem } from '../../index.type'
import { ensureZeroWidthChars, keyboardNavigationPlugin, pasteHandlerPlugin } from './plugins'
import './commands.d.ts'

// ProseMirror Node 类型（文档节点，不是 Tiptap 扩展）
type PMNode = ReturnType<Editor['state']['doc']['nodeAt']> & { nodeSize: number }

/**
 * 模板块属性
 */
export interface TemplateBlockAttrs {
  id: string
  content: string
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 查找模板块节点
 */
function findTemplateBlock(editor: Editor, id: string): { node: PMNode; pos: number } | null {
  let result: { node: PMNode; pos: number } | null = null

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'templateBlock' && node.attrs.id === id) {
      result = { node, pos }
      return false // 停止遍历
    }
  })

  return result
}

/**
 * 获取所有模板块节点
 */
function getAllTemplateBlocks(editor: Editor): Array<{ node: PMNode; pos: number }> {
  const blocks: Array<{ node: PMNode; pos: number }> = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'templateBlock') {
      blocks.push({ node, pos })
    }
  })

  return blocks
}

/**
 * TemplateBlock 扩展定义
 */
export const TemplateBlock = Node.create({
  name: 'templateBlock',

  // 节点配置
  group: 'inline',
  inline: true,
  content: 'text*', // 允许内部有文本内容
  atom: false, // 不是 atom 节点，允许光标进入
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
        tag: 'span[data-template-block]',
      },
    ]
  },

  // HTML 渲染
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-template-block': '',
        'data-id': node.attrs.id as string,
        'data-content': node.attrs.content as string,
      }),
      (node.attrs.content as string) || '',
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
    return {
      /**
       * 设置模板数据（批量）
       */
      setTemplateData:
        (items: TemplateItem[]) =>
        ({ commands }) => {
          // 清空编辑器
          commands.clearContent()

          // 构建内容
          const content: Array<Record<string, unknown>> = []

          items.forEach((item) => {
            if (item.type === 'text') {
              // 添加文本节点
              if (item.content) {
                content.push({
                  type: 'text',
                  text: item.content,
                })
              }
            } else if (item.type === 'template') {
              // 添加模板块节点（内部包含文本）
              content.push({
                type: 'templateBlock',
                attrs: {
                  id: item.id || generateId(),
                  content: item.content,
                },
                content: item.content
                  ? [
                      {
                        type: 'text',
                        text: item.content,
                      },
                    ]
                  : [],
              })
            }
          })

          // 如果有内容，插入到段落中
          if (content.length > 0) {
            commands.insertContent({
              type: 'paragraph',
              content,
            })
          }

          return true
        },

      /**
       * 插入模板块
       */
      insertTemplateBlock:
        (attrs: Partial<TemplateBlockAttrs>) =>
        ({ commands }: { commands: Editor['commands'] }) => {
          return commands.insertContent({
            type: 'templateBlock',
            attrs: {
              id: attrs.id || generateId(),
              content: attrs.content || '',
            },
          })
        },

      /**
       * 更新模板块
       */
      updateTemplateBlock:
        (id: string, content: string) =>
        ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
          const result = findTemplateBlock(editor, id)
          if (!result) {
            return false
          }

          const { pos } = result
          tr.setNodeMarkup(pos, undefined, {
            id,
            content,
          })

          return true
        },

      /**
       * 删除模板块
       */
      deleteTemplateBlock:
        (id: string) =>
        ({ editor, tr }: { editor: Editor; tr: Editor['state']['tr'] }) => {
          const result = findTemplateBlock(editor, id)
          if (!result) {
            return false
          }

          const { node, pos } = result
          tr.delete(pos, pos + node.nodeSize)

          return true
        },

      /**
       * 聚焦到模板块
       */
      focusTemplateBlock:
        (id: string, position: 'start' | 'end' | number = 'end') =>
        ({ editor, commands }: { editor: Editor; commands: Editor['commands'] }) => {
          const result = findTemplateBlock(editor, id)
          if (!result) {
            return false
          }

          const { node, pos } = result

          let targetPos: number
          if (position === 'start') {
            targetPos = pos
          } else if (position === 'end') {
            targetPos = pos + node.nodeSize
          } else {
            targetPos = pos + position
          }

          return commands.focus(targetPos)
        },

      /**
       * 聚焦到第一个模板块
       */
      focusFirstTemplateBlock:
        () =>
        ({ editor }: { editor: Editor }) => {
          const blocks = getAllTemplateBlocks(editor)
          if (blocks.length === 0) {
            return false
          }

          const { node } = blocks[0]
          const blockId = node.attrs.id as string

          // 模板初始化：将光标置于第一个可编辑元素之后。
          setTimeout(() => {
            // 通过 data-id 找到对应的 DOM 元素
            const blockElement = editor.view.dom.querySelector(`[data-id="${blockId}"]`)
            if (blockElement) {
              // 找到内部的 contenteditable 元素
              const contentElement = blockElement.querySelector('.template-block__content') as HTMLElement
              if (contentElement) {
                contentElement.focus()
                // 将光标移到内容末尾
                const selection = window.getSelection()
                if (selection) {
                  selection.selectAllChildren(contentElement)
                  selection.collapseToEnd()
                }
              }
            }
          }, 0)

          return true
        },

      /**
       * 聚焦到最后一个模板块
       */
      focusLastTemplateBlock:
        () =>
        ({ editor, commands }: { editor: Editor; commands: Editor['commands'] }) => {
          const blocks = getAllTemplateBlocks(editor)
          if (blocks.length === 0) {
            return false
          }

          const { pos } = blocks[blocks.length - 1]
          // 聚焦到节点内部（pos + 1）
          return commands.focus(pos + 1)
        },
    }
  },
})

export default TemplateBlock
