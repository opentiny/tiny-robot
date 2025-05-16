import { ref, computed, watch } from 'vue'
import type { SenderProps, SenderEmits } from '../index.type'

/**
 * 建议处理Hook
 * 管理输入建议功能，提供建议项过滤、导航和选择功能
 *
 * @param props - 组件属性
 * @param emit - 组件方法
 * @param inputValue - 输入值
 * @param isComposing - 是否处于输入法组合状态
 */
export function useSuggestionHandler(
  props: SenderProps,
  emit: SenderEmits,
  inputValue: ReturnType<typeof ref<string>>,
  isComposing: ReturnType<typeof ref<boolean>>,
) {
  // 状态变量
  /**
   * 控制是否显示建议弹窗
   */
  const showSuggestionsPopup = ref(false)

  /**
   * 当前高亮的建议项索引
   */
  const highlightedIndex = ref(-1)

  /**
   * 自动完成占位符文本
   */
  const completionPlaceholder = ref('')

  /**
   * 是否显示Tab提示
   */
  const showTabHint = ref(false)

  /**
   * 建议列表DOM引用
   */
  const suggestionsListRef = ref<HTMLElement | null>(null)

  /**
   * 计算经过过滤的建议列表
   * 基于当前输入过滤出匹配的建议项
   */
  const filteredSuggestions = computed(() => {
    if (!props.suggestions || !inputValue.value || props.template) return []
    const lowerInputValue = inputValue.value.toLowerCase()
    return props.suggestions.filter((item) => item.toLowerCase().includes(lowerInputValue))
  })

  /**
   * 计算当前高亮的建议项
   */
  const activeSuggestion = computed(() => {
    return filteredSuggestions.value[highlightedIndex.value] || null
  })

  /**
   * 更新自动完成占位符
   * @param suggestionText - 可选的建议文本，如果没有提供则使用第一个过滤结果
   */
  const updateCompletionPlaceholder = (suggestionText?: string) => {
    if (props.mode === 'multiple') {
      completionPlaceholder.value = ''
      return
    }
    const textToComplete =
      suggestionText || (filteredSuggestions.value.length > 0 ? filteredSuggestions.value[0] : null)
    if (textToComplete && inputValue.value && textToComplete.toLowerCase().startsWith(inputValue.value.toLowerCase())) {
      completionPlaceholder.value = textToComplete.substring(inputValue.value.length)
    } else {
      completionPlaceholder.value = ''
    }
  }

  /**
   * 监听输入值变化，更新建议状态
   */
  watch(inputValue, (newValue) => {
    if (isComposing.value) return

    if (newValue && props.suggestions && props.suggestions.length > 0 && !props.template) {
      showSuggestionsPopup.value = filteredSuggestions.value.length > 0
      if (showSuggestionsPopup.value) {
        highlightedIndex.value = 0
        updateCompletionPlaceholder()
        showTabHint.value = true
      } else {
        highlightedIndex.value = -1
        completionPlaceholder.value = ''
        showTabHint.value = false
      }
    } else {
      showSuggestionsPopup.value = false
      highlightedIndex.value = -1
      completionPlaceholder.value = ''
      showTabHint.value = false
    }
  })

  /**
   * 选择建议项
   * @param suggestion - 要选择的建议文本
   */
  const selectSuggestion = (suggestion: string) => {
    inputValue.value = suggestion
    emit('update:modelValue', suggestion)
    emit('suggestion-select', suggestion)
    closeSuggestionsPopup()
  }

  /**
   * 接受当前高亮的建议项
   * 如果存在活跃的建议项，则选择该项并关闭建议弹窗
   */
  const acceptCurrentSuggestion = () => {
    if (activeSuggestion.value) {
      selectSuggestion(activeSuggestion.value)
      closeSuggestionsPopup()
    }
  }

  /**
   * 关闭建议弹窗
   */
  const closeSuggestionsPopup = () => {
    showSuggestionsPopup.value = false
    showTabHint.value = false
    filteredSuggestions.value.length = 0
    completionPlaceholder.value = ''
    highlightedIndex.value = -1
  }

  /**
   * 在建议列表中导航
   * @param direction - 导航方向：'up' | 'down'
   */
  const navigateSuggestions = (direction: 'up' | 'down') => {
    if (!showSuggestionsPopup.value || filteredSuggestions.value.length === 0) return

    if (direction === 'down') {
      highlightedIndex.value = (highlightedIndex.value + 1) % filteredSuggestions.value.length
    } else {
      highlightedIndex.value =
        (highlightedIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length
    }
    if (activeSuggestion.value) {
      updateCompletionPlaceholder(activeSuggestion.value)
    }
    const list = suggestionsListRef.value
    if (list) {
      const item = list.children[highlightedIndex.value] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }
  }

  /**
   * 处理建议项悬停事件
   * @param index - 悬停项的索引
   */
  const handleSuggestionItemHover = (index: number) => {
    highlightedIndex.value = index
    updateCompletionPlaceholder(filteredSuggestions.value[index])
  }

  /**
   * 处理点击外部事件，关闭建议弹窗
   */
  const handleClickOutside = () => {
    closeSuggestionsPopup()
  }

  return {
    showSuggestionsPopup,
    highlightedIndex,
    completionPlaceholder,
    showTabHint,
    suggestionsListRef,
    filteredSuggestions,
    activeSuggestion,
    updateCompletionPlaceholder,
    selectSuggestion,
    acceptCurrentSuggestion,
    closeSuggestionsPopup,
    navigateSuggestions,
    handleSuggestionItemHover,
    handleClickOutside,
  }
}
