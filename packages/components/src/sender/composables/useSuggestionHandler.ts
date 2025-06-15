import { ref, computed, watch, nextTick } from 'vue'
import type { SenderProps, SenderEmits } from '../index.type'

/**
 * 处理建议项文本高亮
 * @param suggestionText - 建议文本
 * @param inputText - 输入文本
 * @returns 包含文本片段和匹配状态的数组
 */
const highlightSuggestionText = (suggestionText: string, inputText: string) => {
  if (!inputText || !suggestionText) {
    return [{ text: suggestionText, isMatch: false }]
  }

  const lowerSuggestion = suggestionText.toLowerCase()
  const lowerInput = inputText.toLowerCase()

  // 查找所有匹配项
  const matches: { start: number; end: number }[] = []
  let searchIndex = 0

  while (searchIndex < lowerSuggestion.length) {
    const matchIndex = lowerSuggestion.indexOf(lowerInput, searchIndex)
    if (matchIndex === -1) break

    matches.push({
      start: matchIndex,
      end: matchIndex + inputText.length,
    })

    searchIndex = matchIndex + 1
  }

  if (matches.length === 0) {
    return [{ text: suggestionText, isMatch: false }]
  }

  // 合并重叠的匹配区间
  const mergedMatches: { start: number; end: number }[] = []
  for (const match of matches) {
    if (mergedMatches.length === 0) {
      mergedMatches.push(match)
    } else {
      const lastMatch = mergedMatches[mergedMatches.length - 1]
      if (match.start <= lastMatch.end) {
        // 合并重叠区间
        lastMatch.end = Math.max(lastMatch.end, match.end)
      } else {
        mergedMatches.push(match)
      }
    }
  }

  // 构建结果数组
  const parts = []
  let currentIndex = 0

  for (const match of mergedMatches) {
    // 匹配前的部分
    if (currentIndex < match.start) {
      parts.push({
        text: suggestionText.substring(currentIndex, match.start),
        isMatch: false,
      })
    }

    // 匹配的部分
    parts.push({
      text: suggestionText.substring(match.start, match.end),
      isMatch: true,
    })

    currentIndex = match.end
  }

  // 最后剩余的部分
  if (currentIndex < suggestionText.length) {
    parts.push({
      text: suggestionText.substring(currentIndex),
      isMatch: false,
    })
  }

  return parts
}

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
   * 键盘导航的高亮索引
   */
  const keyboardHighlightedIndex = ref(-1)

  /**
   * 鼠标悬停的高亮索引
   */
  const mouseHighlightedIndex = ref(-1)

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
   * 标志是否正在选择建议项
   */
  const isSelectingSuggestion = ref(false)

  /**
   * 最后交互类型：'keyboard' | 'mouse' | null
   */
  const lastInteractionType = ref<'keyboard' | 'mouse' | null>(null)

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
   * 根据最后交互类型决定使用哪个索引对应的建议项
   */
  const activeSuggestion = computed(() => {
    let index = -1

    // 根据最后交互类型决定使用哪个索引
    if (lastInteractionType.value === 'mouse' && mouseHighlightedIndex.value !== -1) {
      index = mouseHighlightedIndex.value
    } else if (lastInteractionType.value === 'keyboard' && keyboardHighlightedIndex.value !== -1) {
      index = keyboardHighlightedIndex.value
    }

    return filteredSuggestions.value[index] || null
  })

  /**
   * 判断指定索引的建议项是否应该高亮显示
   * @param index - 建议项索引
   * @returns 是否高亮
   */
  const isItemHighlighted = (index: number): boolean => {
    return index === keyboardHighlightedIndex.value || index === mouseHighlightedIndex.value
  }

  /**
   * 更新自动完成占位符
   * @param suggestionText - 可选的建议文本，如果没有提供则使用当前选中项
   */
  const updateCompletionPlaceholder = (suggestionText?: string) => {
    // 只有当激活交互时才显示占位符
    if (lastInteractionType.value === null) {
      completionPlaceholder.value = ''
      showTabHint.value = false
      return
    }

    const textToComplete = suggestionText || activeSuggestion.value
    if (textToComplete && inputValue.value && textToComplete.toLowerCase().startsWith(inputValue.value.toLowerCase())) {
      completionPlaceholder.value = textToComplete.substring(inputValue.value.length)
      showTabHint.value = true
    } else {
      completionPlaceholder.value = ''
      showTabHint.value = false
    }
  }

  /**
   * 重置联想建议相关状态
   */
  const resetSuggestionsState = () => {
    showSuggestionsPopup.value = false
    keyboardHighlightedIndex.value = -1
    mouseHighlightedIndex.value = -1
    lastInteractionType.value = null
    completionPlaceholder.value = ''
    showTabHint.value = false
  }

  /**
   * 显示联想建议并设置相关状态
   */
  const showSuggestionsState = () => {
    showSuggestionsPopup.value = true
    // 重置所有选中状态
    keyboardHighlightedIndex.value = -1
    mouseHighlightedIndex.value = -1
    lastInteractionType.value = null
    updateCompletionPlaceholder()
  }

  /**
   * 统一处理显示/隐藏联想弹窗的逻辑
   */
  const updateSuggestionsState = () => {
    // 如果正处于输入法状态或正在选择建议，直接返回
    if (isComposing.value || isSelectingSuggestion.value) return

    nextTick(() => {
      // 判断是否应该显示联想弹窗
      const shouldShowSuggestions =
        inputValue.value &&
        props.suggestions &&
        props.suggestions.length > 0 &&
        !props.template &&
        filteredSuggestions.value.length > 0

      if (shouldShowSuggestions) {
        showSuggestionsState()
      } else {
        resetSuggestionsState()
      }
    })
  }

  /**
   * 监听输入值变化，更新建议状态
   */
  watch(inputValue, updateSuggestionsState)

  /**
   * 监听建议数据变化，支持动态更新（如API请求完成后）
   */
  watch(() => props.suggestions, updateSuggestionsState)

  /**
   * 选择建议项
   * @param suggestion - 要选择的建议文本
   */
  const selectSuggestion = (suggestion: string) => {
    isSelectingSuggestion.value = true
    inputValue.value = suggestion
    emit('update:modelValue', suggestion)
    emit('suggestion-select', suggestion)
    closeSuggestionsPopup()
    // 在下一个事件循环中重置标志
    nextTick(() => {
      isSelectingSuggestion.value = false
    })
  }

  /**
   * 接受当前高亮的建议项
   * 如果存在活跃的建议项，则选择该项并关闭建议弹窗
   */
  const acceptCurrentSuggestion = () => {
    if (activeSuggestion.value) {
      selectSuggestion(activeSuggestion.value)
    }
  }

  /**
   * 关闭建议弹窗
   */
  const closeSuggestionsPopup = () => {
    resetSuggestionsState()
  }

  /**
   * 在建议列表中导航
   * @param direction - 导航方向：'up' | 'down'
   */
  const navigateSuggestions = (direction: 'up' | 'down') => {
    if (!showSuggestionsPopup.value || filteredSuggestions.value.length === 0) return

    lastInteractionType.value = 'keyboard'
    // 不清除鼠标高亮，让两种状态共存

    // 如果当前没有键盘选中项，根据方向选择第一个或最后一个
    if (keyboardHighlightedIndex.value === -1) {
      keyboardHighlightedIndex.value = direction === 'down' ? 0 : filteredSuggestions.value.length - 1
    } else {
      // 正常导航
      if (direction === 'down') {
        keyboardHighlightedIndex.value = (keyboardHighlightedIndex.value + 1) % filteredSuggestions.value.length
      } else {
        keyboardHighlightedIndex.value =
          (keyboardHighlightedIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length
      }
    }

    // 更新自动完成占位符，使用键盘选中的项
    const keyboardSelectedSuggestion = filteredSuggestions.value[keyboardHighlightedIndex.value]
    if (keyboardSelectedSuggestion) {
      updateCompletionPlaceholder(keyboardSelectedSuggestion)
    }

    // 滚动到可见区域
    const list = suggestionsListRef.value
    if (list) {
      const item = list.children[keyboardHighlightedIndex.value] as HTMLElement | null
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
    lastInteractionType.value = 'mouse'
    mouseHighlightedIndex.value = index
    updateCompletionPlaceholder(filteredSuggestions.value[index])
  }

  /**
   * 处理鼠标离开建议项
   */
  const handleSuggestionItemLeave = () => {
    mouseHighlightedIndex.value = -1
    // 如果有键盘选中项，切换到键盘交互类型并显示键盘选中项的占位符
    if (keyboardHighlightedIndex.value !== -1) {
      lastInteractionType.value = 'keyboard'
      const keyboardSelectedSuggestion = filteredSuggestions.value[keyboardHighlightedIndex.value]
      if (keyboardSelectedSuggestion) {
        updateCompletionPlaceholder(keyboardSelectedSuggestion)
      }
    } else {
      // 如果没有键盘选中项，清除交互类型和占位符
      lastInteractionType.value = null
      updateCompletionPlaceholder()
    }
  }

  /**
   * 处理点击外部事件，关闭建议弹窗
   */
  const handleClickOutside = () => {
    closeSuggestionsPopup()
  }

  return {
    showSuggestionsPopup,
    completionPlaceholder,
    showTabHint,
    suggestionsListRef,
    filteredSuggestions,
    activeSuggestion,
    isItemHighlighted,
    updateCompletionPlaceholder,
    updateSuggestionsState,
    selectSuggestion,
    acceptCurrentSuggestion,
    closeSuggestionsPopup,
    navigateSuggestions,
    handleSuggestionItemHover,
    handleSuggestionItemLeave,
    handleClickOutside,
    highlightSuggestionText,
  }
}
