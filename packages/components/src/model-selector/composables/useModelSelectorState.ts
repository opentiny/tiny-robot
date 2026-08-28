import { computed, shallowRef, watch } from 'vue'

interface UseModelSelectorStateOptions {
  value: () => string | null | undefined
  defaultValue: string | null
  valueControlled: boolean
  open: () => boolean | undefined
  defaultOpen: boolean
  openControlled: boolean
  onUpdateValue: (value: string | null) => void
  onUpdateOpen: (open: boolean) => void
}

export function useModelSelectorState(options: UseModelSelectorStateOptions) {
  const isValueControlled = options.valueControlled
  const isOpenControlled = options.openControlled
  const internalValue = shallowRef<string | null>(options.defaultValue)
  const internalOpen = shallowRef(options.defaultOpen)

  if (import.meta.env.DEV) {
    watch(
      () => options.value() !== undefined,
      (controlled) => {
        if (controlled !== isValueControlled) {
          console.warn(
            '[TrModelSelector] modelValue cannot switch between controlled and uncontrolled modes during the component lifetime.',
          )
        }
      },
      { flush: 'sync' },
    )

    watch(
      () => options.open() !== undefined,
      (controlled) => {
        if (controlled !== isOpenControlled) {
          console.warn(
            '[TrModelSelector] open cannot switch between controlled and uncontrolled modes during the component lifetime.',
          )
        }
      },
      { flush: 'sync' },
    )
  }

  const value = computed<string | null>(() => {
    if (!isValueControlled) {
      return internalValue.value
    }

    return options.value() ?? null
  })

  const open = computed(() => {
    if (!isOpenControlled) {
      return internalOpen.value
    }

    return Boolean(options.open())
  })

  function setValue(nextValue: string | null) {
    if (Object.is(value.value, nextValue)) {
      return false
    }

    if (!isValueControlled) {
      internalValue.value = nextValue
    }

    options.onUpdateValue(nextValue)
    return true
  }

  function setOpen(nextOpen: boolean) {
    if (open.value === nextOpen) {
      return false
    }

    if (!isOpenControlled) {
      internalOpen.value = nextOpen
    }

    options.onUpdateOpen(nextOpen)
    return true
  }

  return {
    value,
    open,
    setValue,
    setOpen,
  }
}
