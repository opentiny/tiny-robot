/**
 * 自动高度调整
 * 根据内容自动调整编辑器高度
 */

import { watch, nextTick, type Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ChatInputProps } from '../index.type'

export function useAutoSize(
  props: ChatInputProps,
  editor: Ref<Editor | undefined>,
  editorRef: Ref<HTMLElement | null>,
) {
  /**
   * 计算并设置编辑器高度
   */
  const updateHeight = () => {
    if (!editor.value || !editorRef.value) return
    if (props.mode !== 'multiple') return

    const editorElement = editorRef.value.querySelector('.ProseMirror') as HTMLElement
    if (!editorElement) return

    // 获取 autoSize 配置
    const autoSize = props.autoSize
    if (!autoSize) return

    const config = typeof autoSize === 'boolean' ? { minRows: 1, maxRows: 3 } : autoSize

    // 计算行高
    const lineHeight = parseInt(window.getComputedStyle(editorElement).lineHeight || '26')

    // 计算最小和最大高度
    const minHeight = lineHeight * config.minRows
    const maxHeight = lineHeight * config.maxRows

    // 重置高度以获取真实的 scrollHeight
    editorElement.style.height = 'auto'

    // 获取内容高度
    const scrollHeight = editorElement.scrollHeight

    // 设置新高度
    let newHeight = scrollHeight
    if (newHeight < minHeight) {
      newHeight = minHeight
    } else if (newHeight > maxHeight) {
      newHeight = maxHeight
      editorElement.style.overflowY = 'auto'
    } else {
      editorElement.style.overflowY = 'hidden'
    }

    editorElement.style.height = `${newHeight}px`
  }

  // 监听编辑器内容变化
  watch(
    () => editor.value?.state.doc.content,
    () => {
      nextTick(() => {
        updateHeight()
      })
    },
    { deep: true },
  )

  // 监听模式变化
  watch(
    () => props.mode,
    () => {
      nextTick(() => {
        updateHeight()
      })
    },
  )

  return {
    updateHeight,
  }
}
