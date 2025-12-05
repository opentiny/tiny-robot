/**
 * 自动高度调整 - 核心思路：
 * 1. 监听真正的当前模式（currentMode）
 * 2. 操作滚动容器的 min-height 和 max-height
 * 3. 让浏览器自动处理滚动
 */

import { watch, nextTick, type Ref } from 'vue'
import type { InputMode } from '../index.type'

export function useAutoSize(currentMode: Ref<InputMode>, editorRef: Ref<HTMLElement | null>) {
  /**
   * 更新滚动容器高度
   */
  const updateHeight = () => {
    if (!editorRef.value) return

    const scrollContainer = editorRef.value.querySelector('.tr-chat-input-editor-scroll') as HTMLElement
    if (!scrollContainer) {
      console.warn('⚠️ 找不到滚动容器')
      return
    }

    // 多行模式：设置高度限制
    if (currentMode.value === 'multiple') {
      const lineHeight = 26
      const minHeight = lineHeight * 1 // minRows
      const maxHeight = lineHeight * 3 // maxRows

      scrollContainer.style.minHeight = `${minHeight}px`
      scrollContainer.style.maxHeight = `${maxHeight}px`
      scrollContainer.style.overflowY = 'auto'
    } else {
      // 单行模式：清除高度限制
      scrollContainer.style.minHeight = ''
      scrollContainer.style.maxHeight = ''
      scrollContainer.style.overflowY = 'hidden'
    }
  }

  watch(
    currentMode,
    () => {
      nextTick(() => {
        updateHeight()
      })
    },
    { immediate: true },
  )

  return {
    updateHeight,
  }
}
