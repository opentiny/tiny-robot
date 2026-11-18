/**
 * 模式切换逻辑
 * 支持单行/多行模式的自动和手动切换
 */

import { ref, watch, nextTick, computed, onScopeDispose, type Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import type { Editor } from '@tiptap/vue-3'
import type { SenderProps, UseModeSwitchReturn, InputMode } from '../index.type'

export function useModeSwitch(
  props: SenderProps,
  editor: Ref<Editor | undefined>,
  editorRef: Ref<HTMLElement | null>,
): UseModeSwitchReturn {
  const currentMode = ref<InputMode>(props.mode || 'single')
  const initialMode = ref<InputMode>(props.mode || 'single')
  const isAutoSwitching = ref(false)
  let overflowFrame = 0
  let disposed = false

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
    if (!editor.value || !editorRef.value) return
    // 组合期间重建布局会使浏览器丢失输入法维护的文本范围。
    if (editor.value.view.composing) return

    const editorElement = editorRef.value.querySelector('.ProseMirror') as HTMLElement
    if (!editorElement) return

    if (currentMode.value === 'single') {
      // 空段落的 scrollWidth 包含占位文本，不能据此切换布局。
      if (editor.value.isEmpty) return
      // 测量实际段落，避免父级 overflow:hidden 和省略号影响 scrollWidth。
      const contentElement = editorElement.querySelector('p') as HTMLElement | null
      const contentWidth = contentElement?.scrollWidth ?? editorElement.scrollWidth
      const isOverflowing = contentWidth > editorElement.clientWidth + 1

      if (isOverflowing) {
        setMode('multiple')
      }
    } else {
      // 多行模式：清空文本后切换回单行
      if (editor.value.isEmpty) {
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

    const getActiveElement = () => {
      const dom = editor.value?.view.dom
      if (!dom) return null
      const root = dom.getRootNode()
      if (root instanceof ShadowRoot) {
        // A shadow root reports no active element when focus moved to a control
        // outside the root. Fall back to the document active element so that
        // restoration does not steal focus from that control.
        return root.activeElement ?? dom.ownerDocument.activeElement
      }
      return dom.ownerDocument.activeElement
    }

    const activeElement = getActiveElement()
    const restoreEditorFocus = Boolean(
      editor.value?.isFocused || (activeElement && editorRef.value?.contains(activeElement)),
    )

    isAutoSwitching.value = true
    currentMode.value = mode

    nextTick(() => {
      if (disposed) return
      if (editor.value && !editor.value.isDestroyed) {
        const currentActiveElement = getActiveElement()
        const focusWasNotMovedOutside =
          !currentActiveElement ||
          currentActiveElement === editor.value.view.dom.ownerDocument.body ||
          Boolean(editorRef.value?.contains(currentActiveElement))

        if (restoreEditorFocus && focusWasNotMovedOutside) {
          const currentEditor = editor.value
          const endPosition = currentEditor.state.doc.content.size
          currentEditor.commands.setTextSelection(endPosition)

          // Tiptap's focus command defers view.focus() to an animation frame.
          // Recheck ownership in that frame before performing the actual focus.
          requestAnimationFrame(() => {
            if (disposed || currentEditor.isDestroyed) return
            const activeElement = getActiveElement()
            const focusStillBelongsToSender =
              !activeElement ||
              activeElement === currentEditor.view.dom.ownerDocument.body ||
              Boolean(editorRef.value?.contains(activeElement))
            if (!focusStillBelongsToSender) return

            currentEditor.view.focus()
            currentEditor.commands.scrollIntoView()
          })
        }
      }
      isAutoSwitching.value = false
      scheduleOverflowCheck()
    })
  }

  const scheduleOverflowCheck = () => {
    if (disposed) return
    cancelAnimationFrame(overflowFrame)
    overflowFrame = requestAnimationFrame(() => checkOverflow())
  }

  // 即使确认或取消组合输入没有改变文档，也要在原生事件和 DOM 更新后重新测量。
  useEventListener(() => editor.value?.view.dom, 'compositionend', scheduleOverflowCheck)

  onScopeDispose(() => {
    disposed = true
    cancelAnimationFrame(overflowFrame)
  })

  useResizeObserver(containerRef, () => {
    scheduleOverflowCheck()
  })

  watch(editor, scheduleOverflowCheck, { flush: 'post' })

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
    checkOverflow: scheduleOverflowCheck,
  }
}
