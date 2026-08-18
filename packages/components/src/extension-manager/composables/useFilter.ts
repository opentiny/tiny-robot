import { computed, reactive, toValue, watch } from 'vue'
import type { FilterState, UseFilterOptions, UseFilterResult } from '../filter.type'

const createFilterState = (): FilterState => reactive({ selectedTag: '', searchValue: '' })

const normalizeTags = <T extends { value: string }>(tags: readonly T[]) => {
  const seen = new Set<string>()
  const normalized: T[] = []

  for (const tag of tags) {
    if (!tag.value || seen.has(tag.value)) continue
    seen.add(tag.value)
    normalized.push(tag)
  }

  return normalized
}

const defaultGetItemTags = <T extends object>(item: T): readonly string[] => {
  const tags = (item as { tags?: unknown }).tags
  return Array.isArray(tags) && tags.every((tag): tag is string => typeof tag === 'string') ? tags : []
}

const defaultSearch = <T extends object>(item: T, query: string) => {
  const searchable = item as { name?: unknown; description?: unknown }
  const name = typeof searchable.name === 'string' ? searchable.name : ''
  const description = typeof searchable.description === 'string' ? searchable.description : ''
  return `${name} ${description}`.toLowerCase().includes(query)
}

export const useFilter = <T extends object>(options: UseFilterOptions<T>): UseFilterResult<T> => {
  const internalState = createFilterState()
  const currentState = computed(() => toValue(options.state) ?? internalState)

  const selectedTag = computed({
    get: () => currentState.value.selectedTag,
    set: (value: string) => {
      currentState.value.selectedTag = value
    },
  })
  const searchValue = computed({
    get: () => currentState.value.searchValue,
    set: (value: string) => {
      currentState.value.searchValue = value
    },
  })

  const normalizedTags = computed(() => normalizeTags(toValue(options.tags)))

  watch(
    normalizedTags,
    (tags) => {
      if (selectedTag.value && !tags.some((tag) => tag.value === selectedTag.value)) {
        selectedTag.value = ''
      }
    },
    { immediate: true },
  )

  const filteredItems = computed<readonly T[]>(() => {
    const query = searchValue.value.trim().toLowerCase()
    const getItemTags = options.rules?.getItemTags ?? defaultGetItemTags
    const search = options.rules?.search ?? defaultSearch

    return toValue(options.items).filter((item) => {
      const matchesTag = !selectedTag.value || getItemTags(item).includes(selectedTag.value)
      const matchesSearch = !query || search(item, query)
      return matchesTag && matchesSearch
    })
  })

  const controls = computed(() => ({
    tags: normalizedTags.value,
    selectedTag: selectedTag.value,
    searchValue: searchValue.value,
    'onUpdate:selectedTag': (value: string) => {
      selectedTag.value = value
    },
    'onUpdate:searchValue': (value: string) => {
      searchValue.value = value
    },
  }))

  return { filteredItems, selectedTag, searchValue, controls }
}
