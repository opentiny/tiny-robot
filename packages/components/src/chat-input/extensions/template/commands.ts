/**
 * Template 扩展命令实现
 */

import type { Editor } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { generateId } from '../utils'
import type { TemplateItem, TemplateAttrs, TemplateSelectAttrs } from './types'

// ProseMirror Node 类型
type PMNode = ReturnType<Editor['state']['doc']['nodeAt']> & { nodeSize: number }

/**
 * 获取所有模板块节点
 */
function getAllTemplates(editor: Editor): Array<{ node: PMNode; pos: number }> {
  const blocks: Array<{ node: PMNode; pos: number }> = []

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'template') {
      blocks.push({ node, pos })
    }
  })

  return blocks
}

/**
 * Template 命令集合
 */
export const templateCommands = {
  /**
   * 设置模板数据（批量）
   */
  setTemplateData:
    (items: TemplateItem[]) =>
    ({ commands }: { commands: Editor['commands'] }) => {
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
        } else if (item.type === 'block') {
          // 添加模板块节点（内部包含文本）
          content.push({
            type: 'template',
            attrs: {
              id: item.id || generateId('template'),
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
        } else if (item.type === 'select') {
          // 添加选择器节点
          content.push({
            type: 'templateSelect',
            attrs: {
              id: item.id || generateId('select'),
              placeholder: item.placeholder,
              options: item.options,
              value: item.value || null,
            },
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
  insertTemplate:
    (attrs: Partial<TemplateAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      const content = attrs.content || ''
      return commands.insertContent({
        type: 'template',
        attrs: {
          id: attrs.id || generateId('template'),
          content,
        },
        content: content
          ? [
              {
                type: 'text',
                text: content,
              },
            ]
          : [],
      })
    },

  /**
   * 聚焦到第一个模板块
   */
  focusFirstTemplate:
    () =>
    ({ editor }: { editor: Editor }) => {
      const blocks = getAllTemplates(editor)

      // 使用 setTimeout 确保在文档更新后执行
      setTimeout(() => {
        const { state, view } = editor
        const tr = state.tr

        try {
          let targetPos: number

          if (blocks.length === 0) {
            // 没有模板块时，聚焦到文档末尾
            targetPos = state.doc.content.size - 1
          } else {
            // 有模板块时，聚焦到第一个模板块的末尾
            const { node, pos } = blocks[0]
            const contentLength = node.textContent?.length || 0
            targetPos = pos + 1 + contentLength
          }

          // 使用 ProseMirror 的 TextSelection 精确设置光标位置
          const selection = TextSelection.create(state.doc, targetPos)
          tr.setSelection(selection)
          view.dispatch(tr)
          view.focus()
        } catch (error) {
          console.error('[focusFirstTemplate] 设置光标失败', error)
        }
      }, 0)

      return true
    },

  /**
   * 插入选择器
   */
  insertTemplateSelect:
    (attrs: Partial<TemplateSelectAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      return commands.insertContent({
        type: 'templateSelect',
        attrs: {
          id: attrs.id || generateId('select'),
          placeholder: attrs.placeholder || 'Please select',
          options: attrs.options || [],
          value: attrs.value || null,
        },
      })
    },
}
