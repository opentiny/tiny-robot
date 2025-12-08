/**
 * Template 扩展工具函数
 */

import type { Editor } from '@tiptap/core'
import type { TemplateItem } from '../../index.type'

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
  const ZERO_WIDTH_CHAR = '\u200B'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor.state.doc.descendants((node: any, _pos: number, parent: any) => {
    // 只处理段落的直接子节点，避免重复收集模板块内部的文本
    if (parent && parent.type.name === 'paragraph') {
      if (node.type.name === 'template') {
        const content = (node.textContent || '').replace(new RegExp(ZERO_WIDTH_CHAR, 'g'), '')
        items.push({
          type: 'template',
          content,
        })
      } else if (node.type.name === 'text') {
        const text = (node.text || '').replace(new RegExp(ZERO_WIDTH_CHAR, 'g'), '')
        if (text) {
          // 合并连续的文本节点
          const lastItem = items[items.length - 1]
          if (lastItem && lastItem.type === 'text') {
            lastItem.content += text
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
