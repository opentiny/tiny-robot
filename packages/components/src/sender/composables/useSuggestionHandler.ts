import { ref, computed, watch, nextTick, ComputedRef } from 'vue'
import type { ISuggestionItem, SuggestionTextPart } from '../index.type'

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
 * 将预定义的高亮字符串数组转换为文本片段
 * @param content - 完整的建议文本
 * @param highlights - 需要高亮的文本片段数组
 * @returns 包含文本片段和匹配状态的数组
 */
const convertHighlightsArrayToTextParts = (content: string, highlights: string[]): SuggestionTextPart[] => {
  if (!highlights.length) {
    return [{ text: content, isMatch: false }]
  }

  // 创建一个标记数组，标记每个字符是否应该高亮
  const markedChars = new Array(content.length).fill(false)

  // 标记所有需要高亮的部分
  for (const highlight of highlights) {
    let startIndex = 0
    while (true) {
      const index = content.indexOf(highlight, startIndex)
      if (index === -1) break

      // 标记这段文本为高亮
      for (let i = 0; i < highlight.length; i++) {
        markedChars[index + i] = true
      }

      startIndex = index + 1
    }
  }

  // 将连续的相同标记状态的字符合并为片段
  const parts: SuggestionTextPart[] = []
  let currentPart: SuggestionTextPart | null = null

  for (let i = 0; i < content.length; i++) {
    const isMatch = markedChars[i]

    if (!currentPart || currentPart.isMatch !== isMatch) {
      currentPart = { text: content[i], isMatch }
      parts.push(currentPart)
    } else {
      currentPart.text += content[i]
    }
  }

  return parts
}

/**
 * 处理建议项的高亮
 * @param item - 建议项
 * @param inputText - 用户输入文本
 * @returns 包含文本片段和匹配状态的数组
 */
const processHighlights = (item: ISuggestionItem, inputText: string): SuggestionTextPart[] => {
  const { content, highlights } = item

  // 情况1：使用自定义高亮函数
  if (typeof highlights === 'function') {
    return highlights(content, inputText)
  }

  // 情况2：使用预定义的高亮片段
  if (Array.isArray(highlights)) {
    return convertHighlightsArrayToTextParts(content, highlights)
  }

  // 情况3：使用默认高亮函数
  return highlightSuggestionText(content, inputText)
}

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
   * 标志是否正在选择建议项
   */
  const isSelectingSuggestion = ref(false)

  /**
   * 最后交互类型：'keyboard' | 'mouse' | null
   */
  const lastInteractionType = ref<'keyboard' | 'mouse' | null>(null)

  /**
   * 计算当前高亮的建议项
   * 根据最后交互类型决定使用哪个索引对应的建议项
   */
  const activeSuggestion = computed(() => {
    if (!suggestions.value) return ''

    let index = -1

    // 根据最后交互类型决定使用哪个索引
    if (lastInteractionType.value === 'mouse' && mouseHighlightedIndex.value !== -1) {
      index = mouseHighlightedIndex.value
    } else if (lastInteractionType.value === 'keyboard' && keyboardHighlightedIndex.value !== -1) {
      index = keyboardHighlightedIndex.value
    }

    return suggestions.value[index]?.content || ''
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
        inputValue.value && suggestions.value && suggestions.value.length > 0 && !showTemplateEditor.value

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
  watch(() => suggestions.value, updateSuggestionsState)

  /**
   * 选择建议项
   * @param suggestion - 要选择的建议文本
   */
  const selectSuggestion = (suggestion: string) => {
    isSelectingSuggestion.value = true
    inputValue.value = suggestion
    onModelValueUpdate(suggestion)
    onSuggestionSelect(suggestion)
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
    if (!showSuggestionsPopup.value || !suggestions.value) return

    lastInteractionType.value = 'keyboard'
    // 不清除鼠标高亮，让两种状态共存

    // 如果当前没有键盘选中项，根据方向选择第一个或最后一个
    if (keyboardHighlightedIndex.value === -1) {
      keyboardHighlightedIndex.value = direction === 'down' ? 0 : suggestions.value.length - 1
    } else {
      // 正常导航
      if (direction === 'down') {
        keyboardHighlightedIndex.value = (keyboardHighlightedIndex.value + 1) % suggestions.value.length
      } else {
        keyboardHighlightedIndex.value =
          (keyboardHighlightedIndex.value - 1 + suggestions.value.length) % suggestions.value.length
      }
    }

    // 更新自动完成占位符，使用键盘选中的项
    const keyboardSelectedSuggestion = suggestions.value[keyboardHighlightedIndex.value]
    if (keyboardSelectedSuggestion) {
      updateCompletionPlaceholder(keyboardSelectedSuggestion.content)
    }
  }

  /**
   * 处理建议项悬停事件
   * @param index - 悬停项的索引
   */
  const handleSuggestionItemHover = (index: number) => {
    if (!suggestions.value) return

    lastInteractionType.value = 'mouse'
    mouseHighlightedIndex.value = index
    updateCompletionPlaceholder(suggestions.value[index].content)
  }

  /**
   * 处理鼠标离开建议项
   */
  const handleSuggestionItemLeave = () => {
    if (!suggestions.value) return

    mouseHighlightedIndex.value = -1
    // 如果有键盘选中项，切换到键盘交互类型并显示键盘选中项的占位符
    if (keyboardHighlightedIndex.value !== -1) {
      lastInteractionType.value = 'keyboard'
      const keyboardSelectedSuggestion = suggestions.value[keyboardHighlightedIndex.value]
      if (keyboardSelectedSuggestion) {
        updateCompletionPlaceholder(keyboardSelectedSuggestion.content)
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
    activeSuggestion,
    isItemHighlighted,
    keyboardHighlightedIndex,
    updateCompletionPlaceholder,
    updateSuggestionsState,
    selectSuggestion,
    acceptCurrentSuggestion,
    closeSuggestionsPopup,
    navigateSuggestions,
    handleSuggestionItemHover,
    handleSuggestionItemLeave,
    handleClickOutside,
    processHighlights,
  }
}
