import { ComputedRef, Ref } from 'vue'
import type { SenderProps, SenderEmits, SpeechState, SubmitTrigger } from '../index.type'

/**
 * 键盘处理Hook
 * 集中管理组件的键盘相关操作
 *
 * @param props - 组件属性
 * @param emit - 组件方法
 * @param inputValue - 输入值
 * @param isComposing - 是否处于输入法组合状态（即编辑态）
 * @param speechState - 语音识别状态
 * @param showSuggestions - 是否显示建议列表
 * @param activeSuggestion - 当前活动的建议项
 * @param acceptCurrentSuggestion - 接受当前建议的函数
 * @param closeSuggestionsPopup - 关闭建议弹窗的函数
 * @param navigateSuggestions - 导航建议列表的函数
 * @param toggleSpeech - 切换语音识别函数
 * @param canSubmit - 是否可以提交
 * @param currentMode - 当前输入模式
 * @param setMultipleMode - 设置为多行模式的回调函数
 * @param isTemplateMode - 是否处于模板编辑模式
 * @param exitTemplateMode - 退出模板编辑模式的回调函数
 */
export function useKeyboardHandler(
  props: SenderProps,
  emit: SenderEmits,
  inputValue: Ref<string>,
  isComposing: Ref<boolean>,
  speechState: SpeechState,
  showSuggestions: Ref<boolean>,
  activeSuggestion: Ref<string | null>,
  acceptCurrentSuggestion: () => void,
  closeSuggestionsPopup: (keepFocus?: boolean) => void,
  navigateSuggestions: (direction: 'up' | 'down') => void,
  toggleSpeech: () => void,
  canSubmit: ComputedRef<boolean>,
  currentMode?: Ref<'single' | 'multiple'>,
  setMultipleMode?: () => void,
  isTemplateMode?: ComputedRef<boolean>,
  exitTemplateMode?: () => void,
) {
  /**
   * 触发提交
   */
  const triggerSubmit = () => {
    if (!canSubmit.value) return

    if (isTemplateMode?.value) {
      exitTemplateMode?.()
    }

    emit('submit', inputValue.value.trim())
  }

  /**
   * 检查是否为指定的提交快捷键
   * @param event 键盘事件
   * @param submitType 提交类型
   * @returns 是否触发提交
   *
   * 提交行为说明：
   * - 当 submitType 为 enter 时：按 Enter 键提交
   * - 当 submitType 为 ctrlEnter 时：按 Ctrl+Enter 提交，单独按 Enter 换行
   * - 当 submitType 为 shiftEnter 时：按 Shift+Enter 提交，单独按 Enter 换行
   */
  const checkSubmitShortcut = (event: KeyboardEvent, submitType: SubmitTrigger): boolean => {
    const isEnter = event.key === 'Enter'
    if (!isEnter) return false

    switch (submitType) {
      case 'enter':
        return !event.shiftKey && !event.ctrlKey && !event.metaKey
      case 'ctrlEnter':
        return (event.ctrlKey || event.metaKey) && !event.shiftKey
      case 'shiftEnter':
        return event.shiftKey && !event.ctrlKey && !event.metaKey
      default:
        return false
    }
  }

  /**
   * 在光标位置插入换行符
   * @param target 输入框元素
   */
  const insertNewLine = (target: HTMLTextAreaElement) => {
    const cursorPosition = target.selectionStart
    const currentValue = inputValue.value

    // 在光标位置插入换行符
    inputValue.value = currentValue.substring(0, cursorPosition) + '\n' + currentValue.substring(cursorPosition)

    // 设置光标位置到换行符之后，并滚动到光标位置
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = cursorPosition + 1
      // 滚动到光标所在位置，确保光标可见
      target.scrollTop = target.scrollHeight
    }, 0)
  }

  /**
   * 处理换行操作（仅在 submitType='enter' 时生效）
   * @param event 键盘事件
   * @returns 是否已处理换行
   */
  const handleNewLine = (event: KeyboardEvent): boolean => {
    // 只在 submitType='enter' 时支持 Ctrl+Enter 和 Shift+Enter 换行
    if (props.submitType !== 'enter' || event.key !== 'Enter') return false

    const isCtrlEnter = event.ctrlKey && !event.shiftKey
    const isShiftEnter = event.shiftKey && !event.ctrlKey

    // Ctrl+Enter 或 Shift+Enter: 单行模式切换到多行，多行模式直接换行
    if (isCtrlEnter || isShiftEnter) {
      event.preventDefault()
      const target = event.target as HTMLTextAreaElement

      if (currentMode?.value === 'single' && setMultipleMode) {
        setMultipleMode()
      }
      insertNewLine(target)
      return true
    }

    return false
  }

  /**
   * 处理键盘按下事件
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (isComposing.value) return // 阻止输入法状态下的提交

    // 优先处理换行操作
    if (handleNewLine(event)) {
      return
    }

    if (showSuggestions.value) {
      // 处理上下键 - 导航建议列表
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        navigateSuggestions('down')
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        navigateSuggestions('up')
        return
      }

      if (activeSuggestion.value) {
        // 处理激活建议项的快捷键
        const activeSuggestionKeys = props.activeSuggestionKeys || ['Enter', 'Tab']

        if (activeSuggestionKeys.includes(event.key)) {
          event.preventDefault()
          acceptCurrentSuggestion()
          return
        }
      }
    }

    // 处理Esc键 - 关闭建议列表或停止语音录制
    if (event.key === 'Escape') {
      if (showSuggestions.value) {
        closeSuggestionsPopup()
        event.preventDefault()
      } else if (speechState.isRecording) {
        toggleSpeech()
        event.preventDefault()
      }

      emit('escape-press')
      return
    }

    // 检查是否匹配当前的提交快捷键
    if (checkSubmitShortcut(event, props.submitType as SubmitTrigger) && canSubmit.value) {
      event.preventDefault()
      triggerSubmit()
    }
  }

  return {
    handleKeyPress,
    triggerSubmit,
  }
}
