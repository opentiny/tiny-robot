import { Ref } from 'vue'
import type { SenderProps, SenderEmits, SpeechState, SubmitTrigger } from '../index.type'

/**
 * 键盘处理Hook
 * 集中管理组件的键盘相关操作
 *
 * @param props - 组件属性
 * @param emit - 事件发射器
 * @param inputValue - 输入值
 * @param isComposing - 是否处于输入法组合状态
 * @param speechState - 语音识别状态
 * @param showSuggestions - 是否显示建议列表
 * @param toggleSpeech - 切换语音识别函数
 */
export function useKeyboardHandler(
  props: SenderProps,
  emit: SenderEmits,
  inputValue: Ref<string>,
  isComposing: Ref<boolean>,
  speechState: SpeechState,
  showSuggestions: Ref<boolean>,
  toggleSpeech: () => void,
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
    alert('提交成功')
    emit('submit', inputValue.value.trim())
  }

  /**
   * 检查是否为指定的提交快捷键
   * @param event 键盘事件
   * @param submitType 提交类型
   */
  const checkSubmitShortcut = (event: KeyboardEvent, submitType: SubmitTrigger): boolean => {
    const isEnter = event.key === 'Enter'
    if (!isEnter) return false

    switch (submitType) {
      case 'enter':
        console.log('enter')
        return !event.shiftKey && !event.ctrlKey && !event.metaKey
      case 'ctrlEnter':
        console.log('ctrlEnter')
        return (event.ctrlKey || event.metaKey) && !event.shiftKey
      case 'shiftEnter':
        console.log('shiftEnter')
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

    // 处理Esc键 - 关闭建议列表或停止语音录制
    if (event.key === 'Escape') {
      if (showSuggestions.value) {
        showSuggestions.value = false
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
