/**
 * TemplateBlock 命令类型声明
 *
 * 扩展 Tiptap 的命令类型
 */

import type { TemplateItem } from '../../index.type'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateBlock: {
      /**
       * 设置模板数据（批量）
       */
      setTemplateData: (items: TemplateItem[]) => ReturnType

      /**
       * 插入模板块
       */
      insertTemplateBlock: (attrs: { id?: string; content?: string }) => ReturnType

      /**
       * 更新模板块
       */
      updateTemplateBlock: (id: string, content: string) => ReturnType

      /**
       * 删除模板块
       */
      deleteTemplateBlock: (id: string) => ReturnType

      /**
       * 聚焦到模板块
       */
      focusTemplateBlock: (id: string, position?: 'start' | 'end' | number) => ReturnType

      /**
       * 聚焦到第一个模板块
       */
      focusFirstTemplateBlock: () => ReturnType

      /**
       * 聚焦到最后一个模板块
       */
      focusLastTemplateBlock: () => ReturnType
    }
  }
}
