/**
 * 编辑器初始化和管理
 */

import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor as useTiptapEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { ChatInputProps, ChatInputEmits, UseEditorReturn } from '../index.type'

export function useEditor(props: ChatInputProps, emit: ChatInputEmits): UseEditorReturn {
  const editorRef = ref<HTMLElement | null>(null)

  const editor = useTiptapEditor({
    content: props.modelValue || props.defaultValue || '',
    extensions: [
      StarterKit.configure({
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder: props.placeholder || '请输入内容...',
      }),
      CharacterCount.configure({
        limit: props.maxLength,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tr-chat-input-editor',
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
