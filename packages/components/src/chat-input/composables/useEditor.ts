/**
 * 编辑器初始化和管理
 */

import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor as useTiptapEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { TemplateBlock } from '../extensions'
import type { ChatInputProps, ChatInputEmits, UseEditorReturn } from '../index.type'

export function useEditor(props: ChatInputProps, emit: ChatInputEmits): UseEditorReturn {
  const editorRef = ref<HTMLElement | null>(null)

  const editor = useTiptapEditor({
    content: props.modelValue || props.defaultValue || '',
    extensions: [
      StarterKit.configure({
        // 禁用所有格式化功能，只保留基础文本
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        heading: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder: props.placeholder || '请输入内容...',
      }),
      CharacterCount.configure({
        mode: 'textSize',
      }),
      TemplateBlock,
    ],
    editorProps: {
      attributes: {
        class: 'tr-chat-input-editor',
      },
      // 处理粘贴事件 - 只粘贴纯文本
      handlePaste(view, event) {
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return false

        // 处理文本：单行模式替换换行符，多行模式保留
        const processedText = props.mode === 'single' ? text.replace(/\r?\n/g, ' ') : text

        // 插入纯文本
        const { state } = view
        const { tr } = state
        tr.insertText(processedText)
        view.dispatch(tr)

        return true
      },
    },
    onUpdate: (props) => {
      const html = props.editor.getHTML()
      emit('update:modelValue', html)
    },
    onFocus: (props) => {
      emit('focus', props.event as FocusEvent)
    },
    onBlur: (props) => {
      emit('blur', props.event as FocusEvent)
    },
  })

  // 监听外部 modelValue 变化
  watch(
    () => props.modelValue,
    (newValue) => {
      if (editor.value && newValue !== editor.value.getHTML()) {
        editor.value.commands.setContent(newValue || '', { emitUpdate: false })
      }
    },
  )

  // 清理
  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return {
    editor,
    editorRef,
  }
}
