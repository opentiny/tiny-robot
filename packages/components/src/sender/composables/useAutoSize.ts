/**
 * 自动高度调整
 *
 * 核心思路：
 * 1. 只在用户传递了 autoSize 配置时才生效
 * 2. 监听真正的当前模式（currentMode）
 * 3. 操作滚动容器的 min-height 和 max-height
 * 4. 让浏览器自动处理滚动
 *
 */

import { watch, nextTick, computed, type Ref } from 'vue'
import { useCssVar } from '@vueuse/core'
import type { InputMode, AutoSize } from '../index.type'

export function useAutoSize(currentMode: Ref<InputMode>, editorRef: Ref<HTMLElement | null>, autoSize?: AutoSize) {
  const lineHeightVar = useCssVar('--tr-sender-line-height', editorRef)

  const lineHeight = computed(() => {
    const value = lineHeightVar.value
    if (value) {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 26 : parsed
    }
    return 26
  })

  const autoSizeConfig = computed(() => {
    if (autoSize === false || autoSize === undefined) {
      return null
    }

    if (autoSize === true) {
      return {
        minRows: 1,
        maxRows: 5,
      }
    }

    if (typeof autoSize === 'object') {
      return {
        minRows: autoSize.minRows,
        maxRows: autoSize.maxRows,
      }
    }

    return null
  })

  /**
   * 更新滚动容器高度
   */
  const updateHeight = () => {
    if (!editorRef.value) return

    const scrollContainer = editorRef.value.querySelector('.tr-sender-editor-scroll') as HTMLElement
    if (!scrollContainer) {
      console.warn('⚠️ 找不到滚动容器 .tr-sender-editor-scroll')
      return
    }

    const config = autoSizeConfig.value

    // 多行模式且启用了 autoSize
    if (currentMode.value === 'multiple' && config) {
      const minHeight = lineHeight.value * config.minRows
      const maxHeight = lineHeight.value * config.maxRows

      scrollContainer.style.minHeight = `${minHeight}px`
      scrollContainer.style.maxHeight = `${maxHeight}px`
      scrollContainer.style.overflowY = 'auto'
    }
    // 单行模式或未启用 autoSize
    else {
      scrollContainer.style.minHeight = ''
      scrollContainer.style.maxHeight = ''
      scrollContainer.style.overflowY = currentMode.value === 'single' ? 'hidden' : 'auto'
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

  watch(
    autoSizeConfig,
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
