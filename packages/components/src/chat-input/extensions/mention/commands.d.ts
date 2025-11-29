/**
 * Mention 命令类型声明
 */

import '@tiptap/core'
import type { MentionAttrs } from './types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      /**
       * 插入 mention
       */
      insertMention: (attrs: Partial<MentionAttrs>) => ReturnType

      /**
       * 删除 mention
       */
      deleteMention: (id: string) => ReturnType
    }
  }
}
