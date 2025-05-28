import { Ref } from 'vue'
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
 * @param currentMode - 当前输入模式
 * @param setMultipleMode - 设置为多行模式的回调函数
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
  currentMode?: Ref<'single' | 'multiple'>,
  setMultipleMode?: () => void,
) {
  /**
   * 验证提交条件
   */
  const validateSubmission = (value: string) => {
    return !props.disabled && !props.loading && value.trim().length > 0
  }

  /**
   * 触发提交
   */
  const triggerSubmit = () => {
    if (!validateSubmission(inputValue.value)) return
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
   * 处理键盘按下事件
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    if (isComposing.value) return // 阻止输入法状态下的提交

    // 处理 Shift+Enter - 单行模式切换到多行模式并添加换行
    if (event.key === 'Enter' && event.shiftKey && currentMode?.value === 'single' && setMultipleMode) {
      event.preventDefault()
      // 首先切换到多行模式
      setMultipleMode()
      // 然后在当前输入内容的光标位置添加换行符
      const target = event.target as HTMLTextAreaElement
      const cursorPosition = target.selectionStart
      const currentValue = inputValue.value

      // 在光标位置插入换行符
      inputValue.value = currentValue.substring(0, cursorPosition) + '\n' + currentValue.substring(cursorPosition)

      // 设置光标位置到换行符之后
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = cursorPosition + 1
      }, 0)

      return
    }

    // 处理Tab键 - 接受当前建议
    if (event.key === 'Tab' && showSuggestions.value && activeSuggestion.value) {
      event.preventDefault()
      acceptCurrentSuggestion()
      return
    }

    // 处理上下键 - 导航建议列表
    if (showSuggestions.value) {
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

      // 处理Enter键 - 当建议弹窗打开时，如果有建议项，则选择当前项
      if (event.key === 'Enter' && activeSuggestion.value) {
        event.preventDefault()
        acceptCurrentSuggestion()
        return
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
    const shouldSubmit = checkSubmitShortcut(event, props.submitType as SubmitTrigger)

    // 只有当满足提交条件且输入框有内容时才提交
    if (shouldSubmit && validateSubmission(inputValue.value)) {
      event.preventDefault()
      triggerSubmit()
    }
  }

  return {
    handleKeyPress,
    triggerSubmit,
  }
}
