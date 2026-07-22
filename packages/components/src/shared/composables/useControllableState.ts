import { MaybeRefOrGetter } from '@vueuse/core'
import { computed, shallowRef, watch, toValue } from 'vue'

interface UseControllableStateOptions<T> {
  /**
   * undefined 表示非受控，即使显式传入 undefined，也视为非受控。
   * 组件生命周期内不能在 undefined 和非 undefined 之间切换。
   */
  value: MaybeRefOrGetter<T | undefined>

  /**
   * 仅在初始化为非受控模式时使用。
   */
  defaultValue: MaybeRefOrGetter<T>

  /**
   * 状态更新时触发。
   *
   * 受控模式下，调用方负责更新 value。
   */
  onChange?: (value: T) => void
}

export function useControllableState<T>(options: UseControllableStateOptions<T>) {
  const isControlled = toValue(options.value) !== undefined

  const internalState = shallowRef<T>(toValue(options.defaultValue))

  // 必须在 composable 被调用时创建，保留原始调用位置。
  const creationTrace = import.meta.env.DEV ? new Error('[useControllableState] call site') : undefined

  if (import.meta.env.DEV) {
    watch(
      () => toValue(options.value) !== undefined,
      (currentIsControlled) => {
        if (currentIsControlled === isControlled) {
          return
        }

        console.warn(
          `[useControllableState] A state cannot switch from ${isControlled ? 'controlled' : 'uncontrolled'} to ${
            currentIsControlled ? 'controlled' : 'uncontrolled'
          } during its lifetime.`,
          creationTrace,
        )
      },
      {
        flush: 'sync',
      },
    )
  }

  return computed<T>({
    get() {
      if (isControlled) {
        return toValue(options.value) as T
      }

      return internalState.value
    },

    set(nextValue) {
      if (!isControlled) {
        internalState.value = nextValue
      }

      options.onChange?.(nextValue)
    },
  })
}
