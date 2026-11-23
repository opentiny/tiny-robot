import type { Ref } from 'vue'
import { unref } from 'vue'

export function useDeepClone<
  T extends {
    [x: string]: any
  },
>(value: T | Ref<T>): T {
  const innerValue = unref(value)
  if (value === null || value === undefined) {
    return value
  }
  if (
    typeof innerValue === 'boolean'
    || typeof innerValue === 'string'
    || typeof innerValue === 'number'
  ) {
    return innerValue
  }
  const data = Object.create(null)
  if (Array.isArray(innerValue)) {
    const arr = []
    for (let i = 0; i < innerValue.length; i += 1) {
      arr.push(useDeepClone(innerValue[i]))
    }
    return arr as unknown as T
  }
  const entries = Object.entries(innerValue)
  for (let i = 0; i < entries.length; i += 1) {
    const [key, v] = entries[i]
    if (typeof v !== 'object') {
      data[key] = v
    }
    if (typeof v === 'function') {
      data[key] = v
    }
    data[key] = useDeepClone(v)
  }
  return data
}
