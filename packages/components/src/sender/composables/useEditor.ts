/**
 * 编辑器初始化和管理
 */

import { ref, watch, onBeforeUnmount, nextTick, toRef } from 'vue'
import { useEditor as useTiptapEditor } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { AnyExtension } from '@tiptap/core'
import type { SenderProps, SenderEmits, UseEditorReturn } from '../index.type'

/**
 * 编辑器 Hook
 *
 * 职责：
 * - 初始化编辑器
 * - 管理编辑器状态
 * - 处理编辑器事件
 * - 提供编辑器实例
 *
 */
export function useEditor(props: SenderProps, emit: SenderEmits): UseEditorReturn {
  const editorRef = ref<HTMLElement | null>(null)

  // 将 placeholder 转换为响应式引用
  const placeholderRef = toRef(props, 'placeholder')

  /**
   * 构建扩展列表
   *
   * 基础扩展 + 用户传入的扩展
   */
  const buildExtensions = (): AnyExtension[] => {
    const extensions: AnyExtension[] = [
      Document,
      Paragraph,
      Text,
      History, // 提供 undo/redo 功能
      Placeholder.configure({
        placeholder: () => placeholderRef.value || '请输入内容...',
      }),
      CharacterCount.configure({
        mode: 'textSize',
      }),
    ]

    if (props.extensions?.length) {
      extensions.push(...props.extensions)
    }

    return extensions
  }

  const editor = useTiptapEditor({
    content: props.modelValue ?? props.defaultValue ?? '',
    extensions: buildExtensions(),
    autofocus: props.autofocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: 'tr-sender-editor',
        // 移动端虚拟键盘回车键提示
        ...(props.enterkeyhint && { enterkeyhint: props.enterkeyhint }),
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

        nextTick(() => {
          editor.value?.commands.scrollIntoView()
        })

        return true
      },
    },
    onUpdate: (props) => {
      const text = props.editor.getText()
      emit('update:modelValue', text)
      emit('input', text)
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
      if (editor.value && newValue !== editor.value.getText()) {
        editor.value.commands.setContent(newValue ?? '', { emitUpdate: false })
      }
    },
  )

  // 监听 placeholder 变化，强制更新视图
  watch(
    () => props.placeholder,
    () => {
      if (editor.value) {
        const { state } = editor.value
        const tr = state.tr
        editor.value.view.dispatch(tr)
      }
    },
  )

  // 监听 enterkeyhint 变化，动态更新属性
  watch(
    () => props.enterkeyhint,
    (newHint) => {
      if (editor.value) {
        const editorElement = editor.value.view.dom
        if (newHint) {
          editorElement.setAttribute('enterkeyhint', newHint)
        } else {
          editorElement.removeAttribute('enterkeyhint')
        }
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
