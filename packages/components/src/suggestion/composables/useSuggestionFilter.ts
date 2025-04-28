import { computed, Ref } from 'vue'
import type { SuggestionItem } from '../index.type'

/**
 * 过滤和搜索指令项列表
 * @param items 原始指令项列表
 * @param searchTerm 搜索关键词
 */
export function useSuggestionFilter(items: Ref<SuggestionItem[]>, searchTerm: Ref<string>) {
  /**
   * 根据搜索词过滤指令列表
   */
  const filteredItems = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return items.value

    return items.value.filter((item) => {
      // 搜索文本匹配
      if (item.text.toLowerCase().includes(term)) return true

      // 搜索描述匹配
      if (item.description?.toLowerCase().includes(term)) return true

      // 搜索关键词匹配
      if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(term))) return true

      return false
    })
  })

  return {
    filteredItems,
  }
}
