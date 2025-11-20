/**
 * 模式切换逻辑
 * 支持单行/多行模式的自动和手动切换
 */

import { ref, watch, nextTick, type Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ChatInputProps, UseModeSwitchReturn, InputMode } from '../index.type'

export function useModeSwitch(
  props: ChatInputProps,
  editor: Ref<Editor | undefined>,
  editorRef: Ref<HTMLElement | null>,
): UseModeSwitchReturn {
  const currentMode = ref<InputMode>(props.mode || 'single')
  const isAutoSwitching = ref(false)
  // 记录初始模式，用于判断是否允许自动切换
  const initialMode = ref<InputMode>(props.mode || 'single')

  /**
   * 计算文本宽度
   */
  const calculateTextWidth = (text: string, fontStyle: string): number => {
    const testElem = document.createElement('span')
    testElem.style.visibility = 'hidden'
    testElem.style.position = 'absolute'
    testElem.style.whiteSpace = 'nowrap'
    testElem.style.font = fontStyle
    testElem.textContent = text
    document.body.appendChild(testElem)

    const width = testElem.offsetWidth
    document.body.removeChild(testElem)

    return width
  }

  /**
   * 检查内容是否溢出
   */
  const checkOverflow = () => {
    // 只有初始模式为 single 时才允许自动切换
    if (initialMode.value !== 'single') return

    if (isAutoSwitching.value) return
    if (!editor.value || !editorRef.value) return

    const editorElement = editorRef.value.querySelector('.ProseMirror') as HTMLElement
    if (!editorElement) return

    // 获取编辑器容器
    const container = editorRef.value.closest('.tr-chat-input-main') as HTMLElement
    if (!container) return

    // 获取按钮容器
    const actionsContainer = container.querySelector('.tr-chat-input-actions-inline') as HTMLElement

    // 获取字体样式
    const fontStyle = window.getComputedStyle(editorElement).font

    // 获取文本内容
    const text = editor.value.getText()

    // 计算文本宽度
    const textWidth = calculateTextWidth(text, fontStyle)

    // 获取容器宽度
    const containerRect = container.getBoundingClientRect()
    const actionsRect = actionsContainer?.getBoundingClientRect()

    // 计算可用宽度
    const actionsWidth = actionsRect?.width || 0
    const availableWidth = containerRect.width - actionsWidth - 40 // 40px 为边距

    // 根据文本宽度决定模式切换
    if (textWidth > availableWidth && availableWidth > 80) {
      // 文本超出，切换到多行模式
      if (currentMode.value === 'single') {
        setMode('multiple')
      }
    } else {
      // 文本未超出，切换回单行模式
      if (currentMode.value === 'multiple') {
        setMode('single')
      }
    }
  }

  /**
   * 设置模式
   */
  const setMode = (mode: InputMode) => {
    if (currentMode.value === mode) return

    isAutoSwitching.value = true
    currentMode.value = mode

    nextTick(() => {
      // 更新编辑器配置
      if (editor.value) {
        const editorElement = editorRef.value?.querySelector('.ProseMirror') as HTMLElement
        if (editorElement) {
          if (mode === 'single') {
            editorElement.style.whiteSpace = 'nowrap'
            editorElement.style.overflow = 'hidden'
          } else {
            editorElement.style.whiteSpace = 'pre-wrap'
            editorElement.style.overflow = 'auto'
          }
        }
      }

      setTimeout(() => {
        // 保持焦点
        if (editor.value) {
          editor.value.commands.focus('end')
        }
        isAutoSwitching.value = false
      }, 300)
    })
  }

  // 监听 props.mode 变化
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
