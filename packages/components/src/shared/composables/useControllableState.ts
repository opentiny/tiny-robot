import { computed, shallowRef, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'

interface UseControllableStateOptions<T> {
  value: MaybeRefOrGetter<T | undefined>
  defaultValue?: MaybeRefOrGetter<T | undefined>
  isControlled: MaybeRefOrGetter<boolean>
  onChange?: (nextValue: T) => void
}

interface UseControllableStateResult<T> {
  isControlled: ComputedRef<boolean>
  resolvedState: ComputedRef<T | undefined>
  commit: (nextValue: T, options?: { notify?: boolean }) => void
}

export function useControllableState<T>(options: UseControllableStateOptions<T>): UseControllableStateResult<T> {
  const internalState = shallowRef<T | undefined>(toValue(options.defaultValue))
  const isControlled = computed(() => toValue(options.isControlled))
  const resolvedState = computed(() => (isControlled.value ? toValue(options.value) : internalState.value))

  function commit(nextValue: T, commitOptions?: { notify?: boolean }): void {
    if (!isControlled.value) {
      internalState.value = nextValue
    }

    if (commitOptions?.notify !== false) {
      options.onChange?.(nextValue)
    }
  }

  return {
    isControlled,
    resolvedState,
    commit,
  }
}
