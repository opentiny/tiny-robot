import { ref, watch } from 'vue'
import type { SenderProps, SenderEmits } from '../index.type'

/**
 * 输入框值处理 Hook
 * 对输入框的值进行集中处理
 *
 * @param props 组件属性
 * @param emit  组件方法
 */
export function useInputHandler(props: SenderProps, emit: SenderEmits) {
  const inputValue = ref(props.modelValue || props.defaultValue || '')
  const inputWrapper = ref<HTMLElement | null>(null)

  // 同步外部值变化
  watch(
    () => props.modelValue,
    (val) => {
      if (val !== undefined && val !== inputValue.value) {
        inputValue.value = val
      }
    },
  )

  // 监听内部值变化，触发update:modelValue事件
  watch(
    () => inputValue.value,
    (val) => {
      emit('update:modelValue', val)
    },
  )

  // 双向绑定处理
  const handleChange = (value: string) => {
    inputValue.value = value
    emit('update:modelValue', value)
  }

  // 提交处理
  const handleSubmit = (event?: Event) => {
    event?.preventDefault()

    const submitValue = inputValue.value

    if (!props.disabled && !props.loading && submitValue.trim()) {
      emit('submit', submitValue)
    }
  }

  // 清空输入
  const handleClear = () => {
    inputValue.value = ''
    emit('update:modelValue', '')
    emit('clear')
  }

  // 输入法状态
  const isComposing = ref(false)

  // 清除输入
  const clearInput = () => {
    handleClear()
  }

  return {
    inputValue,
    inputWrapper,
    isComposing,
    handleChange,
    handleSubmit,
    handleClear,
    clearInput,
  }
}
