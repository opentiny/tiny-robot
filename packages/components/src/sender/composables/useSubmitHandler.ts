import { debounce } from 'lodash-es'
import type { Ref } from 'vue'
import type { SenderProps, SenderEmits } from '../types'

/**
 * 提交处理Hook
 * @param props - 组件属性
 * @param emit - 事件触发
 * @param inputValue - 输入值引用
 * @param isComposing - 输入法状态
 */
export function useSubmitHandler(
  props: SenderProps,
  emit: SenderEmits,
  inputValue: Ref<string>,
  isComposing: Ref<boolean>,
) {
  // 验证提交条件
  const validateSubmission = (value: string) => {
    return !props.disabled && !props.loading && value.trim().length > 0
  }

  // 实际提交逻辑
  const performSubmit = debounce((value: string) => {
    if (!validateSubmission(value)) return
    emit('submit', value.trim(), undefined) // 明确传递undefined
  }, props.debounceSubmit ?? 300)

  // 处理键盘事件
  const handleKeyPress = (event: KeyboardEvent) => {
    if (isComposing.value) return // 阻止输入法状态下的提交

    const isEnter = event.key === 'Enter'
    const modifiers = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey || event.metaKey,
    }

    // 根据提交类型判断
    const shouldSubmit = (() => {
      switch (props.submitType) {
        case 'enter':
          return isEnter && !modifiers.shift && !modifiers.ctrl
        case 'shiftEnter':
          return isEnter && modifiers.shift
        case 'ctrlEnter':
          return isEnter && modifiers.ctrl
        default:
          return false
      }
    })()

    if (shouldSubmit) {
      event.preventDefault()
      performSubmit(inputValue.value)
    }
  }

  // 手动触发提交
  const triggerSubmit = () => {
    performSubmit.cancel() // 取消挂起的防抖
    performSubmit(inputValue.value)
  }

  return {
    handleKeyPress,
    triggerSubmit,
    cancelSubmit: performSubmit.cancel,
  }
}
