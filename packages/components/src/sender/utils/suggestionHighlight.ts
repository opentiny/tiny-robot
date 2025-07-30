import type { ISuggestionItem, SuggestionTextPart } from '../index.type'

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

  // 收集所有匹配区间
  const matches: { start: number; end: number }[] = []

  for (const highlight of highlights) {
    if (!highlight) continue

    let startIndex = 0
    const searchContent = content.toLowerCase()
    const searchHighlight = highlight.toLowerCase()

    while (true) {
      const index = searchContent.indexOf(searchHighlight, startIndex)
      if (index === -1) break

      matches.push({
        start: index,
        end: index + highlight.length,
      })

      startIndex = index + 1
    }
  }

  if (matches.length === 0) {
    return [{ text: content, isMatch: false }]
  }

  // 按起始位置排序
  matches.sort((a, b) => a.start - b.start)

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
        text: content.substring(currentIndex, match.start),
        isMatch: false,
      })
    }

    // 匹配的部分
    parts.push({
      text: content.substring(match.start, match.end),
      isMatch: true,
    })

    currentIndex = match.end
  }

  // 最后剩余的部分
  if (currentIndex < content.length) {
    parts.push({
      text: content.substring(currentIndex),
      isMatch: false,
    })
  }

  return parts
}

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

  return convertHighlightsArrayToTextParts(suggestionText, [inputText])
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
