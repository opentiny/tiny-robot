/**
 * 建议项过滤工具
 *
 * 提供模糊匹配、数量限制等功能
 */

import type { SuggestionItem } from '../types'

/**
 * 最多显示的建议项数量
 */
const MAX_SUGGESTIONS = 50

/**
 * 过滤建议项
 *
 * 支持模糊匹配（忽略大小写），可匹配 content 和 label
 *
 * @param suggestions - 建议项列表
 * @param query - 查询文本
 * @param maxResults - 最多返回的结果数（默认 50）
 * @returns 过滤后的建议项
 *
 * @example
 * ```typescript
 * const suggestions = [
 *   { content: 'ECS-云服务器卡顿问题' },
 *   { content: 'ECS-备份弹性云服务器' },
 *   { content: 'CDN-权限管理' }
 * ]
 *
 * // 模糊匹配
 * filterSuggestions(suggestions, 'ECS')
 * // [
 * //   { content: 'ECS-云服务器卡顿问题' },
 * //   { content: 'ECS-备份弹性云服务器' }
 * // ]
 *
 * // 空查询返回所有
 * filterSuggestions(suggestions, '')
 * // 返回所有建议项（最多 50 条）
 * ```
 */
export const filterSuggestions = (
  suggestions: SuggestionItem[],
  query: string,
  maxResults = MAX_SUGGESTIONS,
): SuggestionItem[] => {
  // 空查询返回所有（限制数量）
  if (!query) {
    return suggestions.slice(0, maxResults)
  }

  const lowerQuery = query.toLowerCase()

  return suggestions
    .filter((item) => {
      // 匹配 content
      const content = item.content.toLowerCase()
      if (content.includes(lowerQuery)) {
        return true
      }

      // 匹配 label
      const label = item.label?.toLowerCase() || ''
      if (label.includes(lowerQuery)) {
        return true
      }

      return false
    })
    .slice(0, maxResults)
}

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
