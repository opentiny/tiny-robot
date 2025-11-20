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
   * 计算单行模式下的可用宽度
   * 无论当前是什么模式，都基于单行模式的布局来计算
   */
  const calculateSingleModeAvailableWidth = (): number => {
    if (!editorRef.value) return 0

    const container = editorRef.value.closest('.tr-chat-input-main') as HTMLElement
    if (!container) return 0

    // 获取容器的总宽度
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width

    // 单行模式的布局参数（从样式中获取）
    // content padding-left: 20px
    // actions padding-right: 10px (has-content 时)
    // actions-group gap: 12px
    const contentPaddingLeft = 20
    const actionsPaddingRight = 10
    const actionsGap = 12

    // 估算按钮组宽度
    // 清除按钮: 32px, 发送按钮: 36px, gap: 12px
    const clearButtonWidth = 32
    const submitButtonWidth = 36
    const buttonsWidth = clearButtonWidth + actionsGap + submitButtonWidth

    // 计算可用宽度
    const availableWidth = containerWidth - contentPaddingLeft - actionsPaddingRight - buttonsWidth - actionsGap

    return availableWidth
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

    // 获取字体样式
    const fontStyle = window.getComputedStyle(editorElement).font

    // 获取文本内容
    const text = editor.value.getText()

    // 计算文本宽度
    const textWidth = calculateTextWidth(text, fontStyle)

    // 始终基于单行模式的布局来计算可用宽度
    const singleModeAvailableWidth = calculateSingleModeAvailableWidth()

    // 使用滞后机制避免临界状态的抖动
    const threshold = 20 // 20px 的缓冲区

    if (currentMode.value === 'single') {
      // 单行模式：文本超出时切换到多行
      if (textWidth > singleModeAvailableWidth && singleModeAvailableWidth > 80) {
        setMode('multiple')
      }
    } else {
      // 多行模式：文本明显小于可用宽度时切换回单行
      // 使用 threshold 避免临界状态的反复切换
      if (textWidth < singleModeAvailableWidth - threshold) {
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
