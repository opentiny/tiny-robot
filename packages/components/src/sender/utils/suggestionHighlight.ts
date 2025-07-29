import type { ISuggestionItem, SuggestionTextPart } from '../index.type'

/**
 * 处理建议项文本高亮
 * @param suggestionText - 建议文本
 * @param inputText - 输入文本
 * @returns 包含文本片段和匹配状态的数组
 */
export const highlightSuggestionText = (suggestionText: string, inputText: string): SuggestionTextPart[] => {
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
  const parts: SuggestionTextPart[] = []
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
export const convertHighlightsArrayToTextParts = (content: string, highlights: string[]): SuggestionTextPart[] => {
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
export const processHighlights = (item: ISuggestionItem, inputText: string): SuggestionTextPart[] => {
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
