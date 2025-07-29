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

  // 获取当前高亮的建议项
  const activeSuggestion = computed(() => {
    if (!suggestions.value?.length) return ''

    const index = interactionMode.value === 'mouse' ? activeMouseIndex.value : activeKeyboardIndex.value

    return suggestions.value[index]?.content || ''
  })

  // 判断指定索引的建议项是否应该高亮显示
  const isItemHighlighted = (index: number): boolean => {
    return index === activeKeyboardIndex.value || index === activeMouseIndex.value
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
    // 如果正处于输入法状态，直接返回
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

  /**
   * 使用键盘导航建议项
   * @param direction - 导航方向：'up' | 'down'
   */
  const navigateWithKeyboard = (direction: 'up' | 'down') => {
    if (!isPopupVisible.value || !suggestions.value) return

    interactionMode.value = 'keyboard'

    // 如果当前没有键盘选中项，根据方向选择第一个或最后一个
    if (activeKeyboardIndex.value === -1) {
      activeKeyboardIndex.value = direction === 'down' ? 0 : suggestions.value.length - 1
    } else {
      // 正常导航
      if (direction === 'down') {
        activeKeyboardIndex.value = (activeKeyboardIndex.value + 1) % suggestions.value.length
      } else {
        activeKeyboardIndex.value =
          (activeKeyboardIndex.value - 1 + suggestions.value.length) % suggestions.value.length
      }
    }

    // 更新自动完成占位符，使用键盘选中的项
    const keyboardSelectedSuggestion = suggestions.value[activeKeyboardIndex.value]
    if (keyboardSelectedSuggestion) {
      syncAutoComplete(keyboardSelectedSuggestion.content)
    }
  }

  /**
   * 处理鼠标进入建议项
   * @param index - 目标项的索引
   */
  const handleMouseEnter = (index: number) => {
    if (!suggestions.value) return

    interactionMode.value = 'mouse'
    activeMouseIndex.value = index
    syncAutoComplete(suggestions.value[index].content)
  }

  /**
   * 处理鼠标离开建议项
   */
  const handleMouseLeave = () => {
    if (!suggestions.value) return

    activeMouseIndex.value = -1
    // 如果有键盘选中项，切换到键盘交互类型并显示键盘选中项的占位符
    if (activeKeyboardIndex.value !== -1) {
      interactionMode.value = 'keyboard'
      const keyboardSelectedSuggestion = suggestions.value[activeKeyboardIndex.value]
      if (keyboardSelectedSuggestion) {
        syncAutoComplete(keyboardSelectedSuggestion.content)
      }
    } else {
      // 如果没有键盘选中项，清除交互类型和占位符
      interactionMode.value = null
      syncAutoComplete()
    }
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
    isItemHighlighted,
    activeKeyboardIndex,

    // 交互处理
    navigateWithKeyboard,
    handleMouseEnter,
    handleMouseLeave,

    // 业务操作
    applySuggestion,
    confirmSelection,
  }
}
