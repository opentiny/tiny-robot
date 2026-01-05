/**
 * Mention 扩展命令实现
 */

import type { Editor } from '@tiptap/core'
import { generateId } from '../utils'
import type { MentionAttrs } from './types'

/**
 * Mention 命令集合
 */
export const mentionCommands = {
  /**
   * 插入 mention 节点
   */
  insertMention:
    (attrs: Partial<MentionAttrs>) =>
    ({ commands }: { commands: Editor['commands'] }) => {
      return commands.insertContent({
        type: 'mention',
        attrs: {
          id: attrs.id || generateId('mention'),
          label: attrs.label || '',
          value: attrs.value,
        },
      })
    },

  /**
   * 删除 mention 节点
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
