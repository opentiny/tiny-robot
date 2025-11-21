/**
 * SkillMention 命令类型声明
 */

import '@tiptap/core'
import type { SkillMentionAttrs } from './types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    skillMention: {
      /**
       * 插入技能 mention
       */
      insertSkillMention: (attrs: Partial<SkillMentionAttrs>) => ReturnType

      /**
       * 删除技能 mention
       */
      deleteSkillMention: (id: string) => ReturnType
    }
  }
}
