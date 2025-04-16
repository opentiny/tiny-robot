import { ref, watch } from 'vue'
import { debounce } from 'lodash-es'
import type { SenderProps, SenderEmits } from '../index.type'

/**
 * 输入框值处理 Hook
 * 对输入框的值进行集中处理
 *
 * @param props 组件属性
 * @param emit  组件方法
 */
export function useInputHandler(props: SenderProps, emit: SenderEmits) {
  const inputValue = ref(props.defaultValue || '')
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

  // 双向绑定处理
  const handleChange = (value: string) => {
    inputValue.value = value
    emit('update:modelValue', value)
  }

  // 防抖提交
  const debouncedSubmit = debounce((value: string) => {
    if (!props.disabled && !props.loading && value.trim()) {
      emit('submit', value)
    }
  }, props.debounceSubmit)

  // 提交处理
  const handleSubmit = (event?: Event) => {
    event?.preventDefault()
    debouncedSubmit(inputValue.value)
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
