/**
 * Template 扩展工具函数
 */

import type { Editor } from '@tiptap/core'
import type { TemplateItem } from '../../index.type'
import { NODE_TYPE_NAMES, USER_API_TYPES } from '../constants'

/**
 * 零宽字符常量
 * Unicode: U+200B (Zero Width Space)
 * HTML Entity: &#8203;
 */
export const ZERO_WIDTH_CHAR = '\u200B'

/**
 * 获取包含 template 的完整文本
 *
 * 例如：请帮我分析 [模板内容1] 和 [模板内容2]
 */
export function getTextWithTemplates(editor: Editor): string {
  const items = getTemplateStructuredData(editor)
  return items.map((item) => item.content).join('')
}

/**
 * 获取结构化数据（辅助函数）
 *
 * 返回包含文本和模板块的结构化数组
 */
export function getTemplateStructuredData(editor: Editor): TemplateItem[] {
  const items: TemplateItem[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
    // 只处理段落的直接子节点，避免重复收集模板块内部的文本
    if (parent && parent.type.name === NODE_TYPE_NAMES.PARAGRAPH) {
      if (node.type.name === NODE_TYPE_NAMES.TEMPLATE_BLOCK) {
        const content = (node.textContent || '').replace(new RegExp(ZERO_WIDTH_CHAR, 'g'), '')
        items.push({
          type: USER_API_TYPES.BLOCK,
          content,
        })
      } else if (node.type.name === NODE_TYPE_NAMES.TEMPLATE_SELECT) {
        // 获取选中的值
        const selectedOption = node.attrs.options.find((opt: { value: string }) => opt.value === node.attrs.value)
        const content = selectedOption?.value || ''

        items.push({
          type: USER_API_TYPES.SELECT,
          content,
        })
      } else if (node.type.name === NODE_TYPE_NAMES.TEXT) {
        const text = (node.text || '').replace(new RegExp(ZERO_WIDTH_CHAR, 'g'), '')
        if (text) {
          // 合并连续的文本节点
          const lastItem = items[items.length - 1]
          if (lastItem && lastItem.type === USER_API_TYPES.TEXT) {
            lastItem.content += text
          } else {
            items.push({
              type: USER_API_TYPES.TEXT,
              content: text,
            })
          }
        }
      }
    }
  })

  return items
}
