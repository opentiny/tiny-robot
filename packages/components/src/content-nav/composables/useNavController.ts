import { computed, ref, watch } from 'vue'
import { defaultContentNavSearchMatcher, ensureContentNavSegments } from '../defaults'
import type { ContentNavControllerOptions, ContentNavFilteredItem } from '../internal.type'

export function useNavController(options: ContentNavControllerOptions) {
  const localExpanded = ref(false)
  const localSearchQuery = ref('')
  const keyboardHighlightedItemId = ref<string | undefined>(undefined)
  const isKeyboardNavigating = ref(false)

  const searchOptions = computed(() => options.searchOptions?.value)
  const isManualExpandTrigger = computed(() => options.expandTrigger.value === 'manual')
  const expanded = computed<boolean>(() =>
    isManualExpandTrigger.value ? (options.expanded.value ?? false) : localExpanded.value,
  )
  const searchQuery = computed(() => options.searchQuery?.value ?? localSearchQuery.value)
  const matcher = computed(() => searchOptions.value?.matcher ?? defaultContentNavSearchMatcher)

  const filteredItems = computed<ContentNavFilteredItem[]>(() => {
    const keyword = searchQuery.value.trim()

    return options.items.value
      .map((item) => {
        const segments = matcher.value(item, keyword)
        const hasMatchedSegments = Array.isArray(segments) && segments.length > 0
        if (keyword && !hasMatchedSegments) {
          return null
        }

        return {
          item,
          segments: ensureContentNavSegments(item, segments),
        }
      })
      .filter((entry): entry is ContentNavFilteredItem => entry !== null)
  })
  const activeHighlightedId = computed(
    () => filteredItems.value.find((entry) => entry.item.id === options.activeId.value)?.item.id,
  )
  const resolvedHighlightedId = computed(() => {
    if (
      isKeyboardNavigating.value &&
      keyboardHighlightedItemId.value &&
      filteredItems.value.some((entry) => entry.item.id === keyboardHighlightedItemId.value)
    ) {
      return keyboardHighlightedItemId.value
    }

    return activeHighlightedId.value ?? filteredItems.value[0]?.item.id
  })

  const highlightedIndex = computed(() => {
    if (!filteredItems.value.length) {
      return 0
    }

    const index = filteredItems.value.findIndex((entry) => entry.item.id === resolvedHighlightedId.value)
    return index === -1 ? 0 : index
  })
  const highlightedId = computed(() => resolvedHighlightedId.value)

  function resetKeyboardNavigation() {
    isKeyboardNavigating.value = false
    keyboardHighlightedItemId.value = undefined
  }

  function setExpanded(value: boolean) {
    if (!isManualExpandTrigger.value) {
      localExpanded.value = value
    }

    options.onUpdateExpanded?.(value)

    if (!value && searchOptions.value?.clearOnCollapse && searchQuery.value) {
      setSearchQuery('')
    }
  }

  function setSearchQuery(value: string) {
    if (options.searchQuery?.value === undefined) {
      localSearchQuery.value = value
    }

    options.onUpdateSearchQuery?.(value)
  }

  function clampHighlightedIndex(nextIndex: number) {
    if (!filteredItems.value.length) {
      resetKeyboardNavigation()
      return
    }

    const clampedIndex = Math.max(0, Math.min(nextIndex, filteredItems.value.length - 1))
    keyboardHighlightedItemId.value = filteredItems.value[clampedIndex]?.item.id
    isKeyboardNavigating.value = true
  }

  function getHighlightedItem() {
    return filteredItems.value[highlightedIndex.value]?.item
  }

  function handleNavigationKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      clampHighlightedIndex(highlightedIndex.value + 1)
      return true
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      clampHighlightedIndex(highlightedIndex.value - 1)
      return true
    }

    if (event.key === 'Home') {
      event.preventDefault()
      clampHighlightedIndex(0)
      return true
    }

    if (event.key === 'End') {
      event.preventDefault()
      clampHighlightedIndex(filteredItems.value.length - 1)
      return true
    }

    if (event.key === 'Escape') {
      if (isManualExpandTrigger.value) {
        return false
      }

      event.preventDefault()
      setExpanded(false)
      return true
    }

    return false
  }

  watch(
    filteredItems,
    (items) => {
      if (!items.length) {
        resetKeyboardNavigation()
        return
      }

      if (activeHighlightedId.value) {
        resetKeyboardNavigation()
        return
      }

      if (
        isKeyboardNavigating.value &&
        keyboardHighlightedItemId.value &&
        items.some((entry) => entry.item.id === keyboardHighlightedItemId.value)
      ) {
        return
      }

      resetKeyboardNavigation()
    },
    { immediate: true, flush: 'sync' },
  )

  watch(
    () => options.activeId.value,
    (value) => {
      if (!value) {
        return
      }

      resetKeyboardNavigation()
    },
    { immediate: true, flush: 'sync' },
  )

  return {
    expanded,
    searchQuery,
    filteredItems,
    highlightedIndex,
    highlightedId,
    setExpanded,
    setSearchQuery,
    getHighlightedItem,
    handleNavigationKeydown,
  }
}
