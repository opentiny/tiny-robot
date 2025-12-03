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
 * @returns ChatInputSlotScope computed 对象
 */
export function useSlotScope(): ComputedRef<ChatInputSlotScope> {
  const context = useChatInputContext()

  return computed<ChatInputSlotScope>(() => ({
    editor: context.editor.value,
    focus: context.focus,
    blur: context.blur,
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
    getContent: context.getContent,
    clear: context.clear,
    disabled: context.disabled.value,
    loading: context.loading.value,
    hasContent: context.hasContent.value,
    characterCount: context.characterCount.value,
  }))
}
