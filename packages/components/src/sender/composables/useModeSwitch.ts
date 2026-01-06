/**
 * 模式切换逻辑
 * 支持单行/多行模式的自动和手动切换
 */

import { ref, watch, nextTick, computed, type Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { Editor } from '@tiptap/vue-3'
import type { SenderProps, UseModeSwitchReturn, InputMode } from '../index.type'

export function useModeSwitch(
  props: SenderProps,
  editor: Ref<Editor | undefined>,
  editorRef: Ref<HTMLElement | null>,
): UseModeSwitchReturn {
  const currentMode = ref<InputMode>(props.mode || 'single')
  const isAutoSwitching = ref(false)
  const initialMode = ref<InputMode>(props.mode || 'single')

  // 获取容器元素
  const containerRef = computed(() => {
    return editorRef.value?.closest('.tr-sender-main') as HTMLElement | null
  })

  /**
   * 检查内容是否溢出
   * 使用浏览器原生的 scrollWidth 检测
   */
  const checkOverflow = () => {
    if (initialMode.value !== 'single') return
    if (isAutoSwitching.value) return
    if (!editor.value || !editorRef.value) return

    const editorElement = editorRef.value.querySelector('.ProseMirror') as HTMLElement
    if (!editorElement) return

    const text = editor.value.getText()

    if (currentMode.value === 'single') {
      // 单行模式：检查是否溢出
      // scrollWidth > clientWidth 表示内容超出可见区域
      const isOverflowing = editorElement.scrollWidth > editorElement.clientWidth

      if (isOverflowing) {
        setMode('multiple')
      }
    } else {
      // 多行模式：清空文本后切换回单行
      if (!text.length) {
        setMode('single')
      }
    }
  }

  /**
   * 设置模式
   * 注意：不再设置 white-space 样式，由容器的 overflow 来控制文本显示
   */
  const setMode = (mode: InputMode) => {
    if (currentMode.value === mode) return

    isAutoSwitching.value = true
    currentMode.value = mode

    nextTick(() => {
      if (editor.value) {
        editor.value.commands.focus('end')
      }

      setTimeout(() => {
        isAutoSwitching.value = false
      }, 300)
    })
  }

  useResizeObserver(containerRef, () => {
    // 使用 requestAnimationFrame 避免频繁触发
    requestAnimationFrame(() => {
      checkOverflow()
    })
  })

  watch(
    () => props.mode,
    (newMode) => {
      if (newMode && newMode !== currentMode.value) {
        initialMode.value = newMode
        setMode(newMode)
      }
    },
  )

  return {
    currentMode,
    isAutoSwitching,
    setMode,
    checkOverflow,
  }
}
