import { computed, shallowRef } from 'vue'

export interface UseControllableComposerOptions {
  value: () => string | undefined
  defaultValue: () => string | undefined
  onUpdate: (value: string) => void
}
export function useControllableComposer(options: UseControllableComposerOptions) {
  const draft = shallowRef(options.defaultValue() ?? '')
  const isControlled = computed(() => options.value() !== undefined)
  const value = computed(() => (isControlled.value ? (options.value() ?? '') : draft.value))

  function setValue(nextValue: string) {
    if (!isControlled.value) {
      draft.value = nextValue
    }

    options.onUpdate(nextValue)
  }

  return {
    value,
    isControlled,
    setValue,
  }
}
