import { computed, nextTick, shallowRef, watch, type Ref } from 'vue'
import type { NormalizedModelSelectorOption } from '../internal.type'

interface UseModelSelectorNavigationOptions {
  enabled: () => boolean
  options: () => readonly NormalizedModelSelectorOption[]
  selectedValue: () => string | null
  containerEl: Ref<HTMLElement | null>
}

export function useModelSelectorNavigation(options: UseModelSelectorNavigationOptions) {
  const highlightedKey = shallowRef<string | null>(null)

  const highlightedOption = computed(() => {
    return options.options().find((option) => option.key === highlightedKey.value) ?? null
  })

  function getSelectableOptions() {
    return options.options().filter((option) => !option.disabled)
  }

  function setHighlightedKey(key: string | null) {
    if (key === null) {
      highlightedKey.value = null
      return
    }

    const option = options.options().find((item) => item.key === key)

    if (option && !option.disabled) {
      highlightedKey.value = option.key
    }
  }

  function resetHighlight() {
    highlightedKey.value = null
  }

  function highlightBoundary(boundary: 'first' | 'last') {
    const selectableOptions = getSelectableOptions()
    const option = boundary === 'first' ? selectableOptions[0] : selectableOptions[selectableOptions.length - 1]
    highlightedKey.value = option?.key ?? null
  }

  function highlightSelectedOrBoundary(boundary: 'first' | 'last' = 'first') {
    const selectedValue = options.selectedValue()
    const selectedOption = options.options().find((option) => option.value === selectedValue && !option.disabled)

    if (selectedOption) {
      highlightedKey.value = selectedOption.key
      return
    }

    highlightBoundary(boundary)
  }

  function moveHighlight(step: 1 | -1) {
    const selectableOptions = getSelectableOptions()

    if (selectableOptions.length === 0) {
      resetHighlight()
      return
    }

    const currentIndex = selectableOptions.findIndex((option) => option.key === highlightedKey.value)

    if (currentIndex < 0) {
      const boundaryIndex = step === 1 ? 0 : selectableOptions.length - 1
      highlightedKey.value = selectableOptions[boundaryIndex]?.key ?? null
      return
    }

    const nextIndex = (currentIndex + step + selectableOptions.length) % selectableOptions.length
    highlightedKey.value = selectableOptions[nextIndex]?.key ?? null
  }

  watch(
    () => [options.enabled(), options.options(), options.selectedValue()] as const,
    ([enabled, visibleOptions, selectedValue], previous) => {
      if (!enabled) {
        resetHighlight()
        return
      }

      const previousSelectedValue = previous?.[2]
      const selectedOption = visibleOptions.find((option) => option.value === selectedValue && !option.disabled)

      if (selectedValue !== previousSelectedValue && selectedOption) {
        highlightedKey.value = selectedOption.key
        return
      }

      const highlightedOptionStillVisible = highlightedKey.value
        ? visibleOptions.some((option) => option.key === highlightedKey.value && !option.disabled)
        : false

      if (!highlightedOptionStillVisible) {
        highlightSelectedOrBoundary('first')
      }
    },
    { immediate: true },
  )

  watch(highlightedKey, async (key) => {
    if (!key || !options.enabled()) {
      return
    }

    await nextTick()

    const container = options.containerEl.value
    const optionElement = Array.from(
      container?.querySelectorAll<HTMLElement>('[data-model-selector-option-key]') ?? [],
    ).find((element) => element.dataset.modelSelectorOptionKey === key)

    optionElement?.scrollIntoView({ block: 'nearest' })
  })

  return {
    highlightedKey,
    highlightedOption,
    setHighlightedKey,
    resetHighlight,
    highlightBoundary,
    highlightSelectedOrBoundary,
    moveHighlight,
  }
}
