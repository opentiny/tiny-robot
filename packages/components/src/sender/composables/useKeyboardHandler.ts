import { ref, Ref } from 'vue'
import type { SenderProps, SenderEmits, SpeechState, SubmitTrigger } from '../types'

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
  // 双击Space检测
  const lastSpaceKeyTime = ref(0)
  const DOUBLE_TAP_DELAY = 300 // 双击间隔时间(ms)

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
    emit('submit', inputValue.value.trim(), undefined)
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

    if (shouldSubmit) {
      event.preventDefault()
      triggerSubmit()
    }
  }

  /**
   * 处理键盘释放事件
   */
  const handleKeyUp = (event: KeyboardEvent) => {
    // 处理Space键双击激活语音输入
    if (event.code === 'Space' && props.allowedSpeech && !props.disabled && !isComposing.value) {
      const now = Date.now()
      if (now - lastSpaceKeyTime.value < DOUBLE_TAP_DELAY) {
        // 双击Space，触发语音输入
        event.preventDefault()
        toggleSpeech()
        lastSpaceKeyTime.value = 0 // 重置时间戳
      } else {
        lastSpaceKeyTime.value = now
      }
    }
  }

  return {
    handleKeyPress,
    handleKeyUp,
    triggerSubmit,
  }
}
