import { ref, computed, watch, ComputedRef } from 'vue'
import type { ISuggestionItem } from '../index.type'

/**
 * 建议处理Hook
 * 管理输入建议功能，提供建议项过滤、导航和选择功能
 *
 * @param suggestions - 建议项列表
 * @param inputValue - 输入值
 * @param isComposing - 是否处于输入法组合状态
 * @param showTemplateEditor - 是否显示模板编辑器
 * @param onModelValueUpdate - 更新模型值的回调
 * @param onSuggestionSelect - 选择建议项的回调
 */
export function useSuggestionHandler(
  suggestions: ComputedRef<ISuggestionItem[]>,
  inputValue: ReturnType<typeof ref<string>>,
  isComposing: ReturnType<typeof ref<boolean>>,
  showTemplateEditor: ComputedRef<boolean>,
  onModelValueUpdate: (value: string) => void,
  onSuggestionSelect: (value: string) => void,
) {
  const isPopupVisible = ref(false)
  const activeKeyboardIndex = ref(-1)
  const activeMouseIndex = ref(-1)
  const interactionMode = ref<'keyboard' | 'mouse' | null>(null)
  const autoCompleteText = ref('')
  const showTabIndicator = ref(false)

  // 获取当前高亮的建议项
  const activeSuggestion = computed(() => {
    if (!suggestions.value?.length) return ''

    const targetIndex = interactionMode.value === 'mouse' ? activeMouseIndex.value : activeKeyboardIndex.value

    return suggestions.value[targetIndex]?.content || ''
  })

  const setAutoComplete = (suffix: string) => {
    autoCompleteText.value = suffix
    showTabIndicator.value = true
  }

  const clearAutoComplete = () => {
    autoCompleteText.value = ''
    showTabIndicator.value = false
  }

  const syncAutoComplete = (suggestion?: string) => {
    const targetText = suggestion || activeSuggestion.value
    if (!targetText || !inputValue.value) {
      clearAutoComplete()
      return
    }

    const suffix = targetText.substring(inputValue.value.length)
    const isValidPrefix = targetText.toLowerCase().startsWith(inputValue.value.toLowerCase())

    if (isValidPrefix && suffix) {
      setAutoComplete(suffix)
    } else {
      clearAutoComplete()
    }
  }

  const clearSelection = () => {
    activeKeyboardIndex.value = -1
    activeMouseIndex.value = -1
    interactionMode.value = null
  }

  const openPopup = () => {
    isPopupVisible.value = true
    syncAutoComplete()
  }

  const closePopup = () => {
    isPopupVisible.value = false
    clearSelection()
    clearAutoComplete()
  }

  const shouldShowPopup = computed(() => {
    if (isComposing.value) return true
    return Boolean(inputValue.value && suggestions.value?.length > 0 && !showTemplateEditor.value)
  })

  const applySuggestion = (suggestion: string) => {
    closePopup()
    inputValue.value = suggestion
    onModelValueUpdate(suggestion)
    onSuggestionSelect(suggestion)
  }

  const confirmSelection = () => {
    if (activeSuggestion.value) {
      applySuggestion(activeSuggestion.value)
    }
  }

  // 键盘导航
  const navigateWithKeyboard = (direction: 'up' | 'down') => {
    if (!isPopupVisible.value || !suggestions.value) return

    interactionMode.value = 'keyboard'

    if (activeKeyboardIndex.value === -1) {
      activeKeyboardIndex.value = direction === 'down' ? 0 : suggestions.value.length - 1
    } else {
      if (direction === 'down') {
        activeKeyboardIndex.value = (activeKeyboardIndex.value + 1) % suggestions.value.length
      } else {
        activeKeyboardIndex.value =
          (activeKeyboardIndex.value - 1 + suggestions.value.length) % suggestions.value.length
      }
    }

    syncAutoComplete()
  }

  // 处理鼠标悬停
  const handleMouseEnter = (index: number) => {
    if (!suggestions.value) return

    interactionMode.value = 'mouse'
    activeMouseIndex.value = index
    syncAutoComplete()
  }

  const handleMouseLeave = () => {
    if (!suggestions.value) return

    activeMouseIndex.value = -1

    // 如果有键盘选中项，切换回键盘模式
    if (activeKeyboardIndex.value !== -1) {
      interactionMode.value = 'keyboard'
    } else {
      interactionMode.value = null
    }

    syncAutoComplete()
  }

  // 监听条件变化，控制弹窗
  watch(shouldShowPopup, (shouldShow) => {
    if (shouldShow) {
      if (!isPopupVisible.value) {
        openPopup()
      }
    } else {
      if (isPopupVisible.value) {
        closePopup()
      }
    }
  })

  return {
    // 弹窗控制
    isPopupVisible,
    openPopup,
    closePopup,

    // 自动完成占位符
    autoCompleteText,
    showTabIndicator,
    syncAutoComplete,

    // 选中控制层
    activeSuggestion,
    activeKeyboardIndex,
    activeMouseIndex,

    // 交互处理
    navigateWithKeyboard,
    handleMouseEnter,
    handleMouseLeave,

    // 业务操作
    applySuggestion,
    confirmSelection,
  }
}
