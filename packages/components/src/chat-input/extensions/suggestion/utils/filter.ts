/**
 * 计算自动补全文本
 *
 * 检查选中项是否以输入内容开头，如果是则返回剩余部分
 *
 * @param selectedSuggestion - 选中的建议项内容
 * @param inputText - 用户输入的文本
 * @returns 补全信息
 *
 * @example
 * ```typescript
 * // 有补全文本
 * syncAutoComplete('ECS-云服务器', 'ECS')
 * // { text: '-云服务器', show: true, showTab: true }
 *
 * // 无补全文本（输入完整）
 * syncAutoComplete('ECS', 'ECS')
 * // { text: '', show: false, showTab: false }
 *
 * // 不匹配
 * syncAutoComplete('ECS-云服务器', 'CDN')
 * // { text: '', show: false, showTab: false }
 * ```
 */
export const syncAutoComplete = (
  selectedSuggestion: string,
  inputText: string,
): {
  text: string
  show: boolean
  showTab: boolean
} => {
  // 基础检查
  if (!selectedSuggestion || !inputText) {
    return { text: '', show: false, showTab: false }
  }

  // 检查前缀匹配（忽略大小写）
  const lowerSuggestion = selectedSuggestion.toLowerCase()
  const lowerInput = inputText.toLowerCase()

  if (!lowerSuggestion.startsWith(lowerInput)) {
    return { text: '', show: false, showTab: false }
  }

  // 提取剩余部分
  const suffix = selectedSuggestion.substring(inputText.length)

  // 判断是否显示
  const shouldShow = suffix.length > 0

  return {
    text: suffix,
    show: shouldShow,
    showTab: shouldShow,
  }
}
