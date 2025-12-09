/**
 * ChatInput 插槽作用域 Composable
 *
 * 用于在布局组件中创建插槽作用域对象
 */

import { computed, type ComputedRef } from 'vue'
import { useChatInputContext } from '../context'
import type { ChatInputSlotScope } from '../types/slots'

/**
 * 使用插槽作用域
 *
 * 为增强按钮提供便捷的操作方法和常用状态
 *
 * @returns ChatInputSlotScope computed 对象
 */
export function useSlotScope(): ComputedRef<ChatInputSlotScope> {
  const context = useChatInputContext()

  return computed<ChatInputSlotScope>(() => ({
    // 编辑器实例
    editor: context.editor.value,

    // 基础操作
    focus: context.focus,
    blur: context.blur,

    // 内容操作（为增强按钮设计）
    insert: (content: string) => {
      context.editor.value?.commands.insertContent(content + ' ')
      context.focus()
    },
    append: (content: string) => {
      const editor = context.editor.value
      if (editor) {
        // 追加到文档末尾
        const endPos = editor.state.doc.content.size
        editor.chain().focus().insertContentAt(endPos, content).run()
      }
    },
    replace: (content: string) => {
      context.setContent(content)
      context.focus()
    },

    // 常用状态
    disabled: context.disabled.value,
    loading: context.loading.value,
    hasContent: context.hasContent.value,
  }))
}
