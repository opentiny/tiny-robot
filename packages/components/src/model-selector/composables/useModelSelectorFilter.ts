import { computed, shallowRef } from 'vue'
import type { ModelSelectorFilterMethod } from '../index.type'
import type { ModelSelectorOptionGroup, NormalizedModelSelectorOption } from '../internal.type'

interface UseModelSelectorFilterOptions {
  options: () => readonly NormalizedModelSelectorOption[]
  searchable: () => boolean
  filterMethod: () => ModelSelectorFilterMethod | undefined
}

export function useModelSelectorFilter(options: UseModelSelectorFilterOptions) {
  const query = shallowRef('')
  const normalizedQuery = computed(() => query.value.trim())

  const visibleOptions = computed(() => {
    const resolvedOptions = options.options()
    const keyword = normalizedQuery.value

    if (!options.searchable() || !keyword) {
      return resolvedOptions
    }

    const customFilter = options.filterMethod()

    if (customFilter) {
      return resolvedOptions.filter((option) => customFilter(keyword, option.raw))
    }

    const normalizedKeyword = keyword.toLocaleLowerCase()
    return resolvedOptions.filter((option) => option.searchText.includes(normalizedKeyword))
  })

  const groups = computed<ModelSelectorOptionGroup[]>(() => {
    const groupMap = new Map<string, ModelSelectorOptionGroup>()

    visibleOptions.value.forEach((option) => {
      const existingGroup = groupMap.get(option.groupKey)

      if (existingGroup) {
        existingGroup.items.push(option)
        return
      }

      groupMap.set(option.groupKey, {
        key: option.groupKey,
        index: groupMap.size,
        group: option.raw.group?.trim() ?? '',
        label: option.raw.group?.trim() ?? '',
        items: [option],
      })
    })

    return [...groupMap.values()]
  })

  const isEmpty = computed(() => visibleOptions.value.length === 0)

  function setQuery(value: string) {
    query.value = value
  }

  function clearQuery() {
    query.value = ''
  }

  return {
    query,
    visibleOptions,
    groups,
    isEmpty,
    setQuery,
    clearQuery,
  }
}
