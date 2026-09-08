import { computed, shallowRef, watch } from 'vue'
import type { ModelSelectorReasoningEffortOption } from '../index.type'

interface UseModelSelectorEffortOptions {
  value: () => string | null | undefined
  defaultValue: string | null
  efforts: () => readonly ModelSelectorReasoningEffortOption[]
  controlled: boolean
  onUpdateValue: (value: string | null) => void
}

export function useModelSelectorEffort(options: UseModelSelectorEffortOptions) {
  const isControlled = options.controlled
  const internalValue = shallowRef<string | null>(options.defaultValue)

  if (import.meta.env.DEV) {
    watch(
      () => options.value() !== undefined,
      (controlled) => {
        if (controlled !== isControlled) {
          console.warn(
            '[TrModelSelector] effort cannot switch between controlled and uncontrolled modes during the component lifetime.',
          )
        }
      },
      { flush: 'sync' },
    )
  }

  const value = computed<string | null>(() => {
    if (!isControlled) {
      return internalValue.value
    }

    return options.value() ?? null
  })

  const activeOption = computed(() => {
    return options.efforts().find((option) => option.value === value.value) ?? null
  })

  function setValue(nextValue: string | null) {
    if (Object.is(value.value, nextValue)) {
      return false
    }

    if (nextValue !== null) {
      const nextOption = options.efforts().find((option) => option.value === nextValue)

      if (!nextOption || nextOption.disabled) {
        return false
      }
    }

    if (!isControlled) {
      internalValue.value = nextValue
    }

    options.onUpdateValue(nextValue)
    return true
  }

  return {
    value,
    activeOption,
    setValue,
  }
}
