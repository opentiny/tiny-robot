/**
 * Mention 扩展工具函数
 */

import type { Editor } from '@tiptap/core'
import type { MentionItem, MentionStructuredItem } from './types'

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
