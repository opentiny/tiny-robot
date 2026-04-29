/* eslint-disable @typescript-eslint/no-explicit-any */
export class AbortError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AbortError'
  }
}

/**
 * @param signal AbortController 的信号对象
 * @returns 一个在信号中止时拒绝的 Promise
 */
export function createAbortPromise(signal: AbortSignal): { promise: Promise<never>; cleanup: () => void } {
  // 如果信号已经被中止，直接返回一个拒绝的 Promise，并提供空 cleanup
  if (signal.aborted) {
    return { promise: Promise.reject(new AbortError(String(signal.reason ?? 'Aborted'))), cleanup: () => {} }
  }

  let handler: (() => void) | null = null
  const promise = new Promise<never>((_, reject) => {
    handler = () => {
      reject(new AbortError(String(signal.reason ?? 'Aborted')))
    }
    signal.addEventListener('abort', handler, { once: true })
  })

  const cleanup = () => {
    if (handler) {
      signal.removeEventListener('abort', handler)
      handler = null
    }
  }

  return { promise, cleanup }
}

/**
 * 包装一个现有的 Promise，使其支持 AbortController 终止。
 * @param originalPromise 您的原始 Promise
 * @param signal AbortController 的信号
 * @returns 一个可被中止的新 Promise
 */
export function makeAbortable<T>(originalPromise: Promise<T>, signal: AbortSignal): Promise<T> {
  // 1. 创建带清理能力的中止 Promise
  const { promise: abortPromise, cleanup } = createAbortPromise(signal)

  // 2. 使用 Promise.race() 赛跑，并在结束后主动移除监听器
  return Promise.race([
    originalPromise, // 原始 Promise
    abortPromise, // 中止 Promise
  ]).finally(cleanup)
}

/**
 * 从对象中提取指定字段，返回一个新对象
 * @param obj 源对象
 * @param fields 要提取的字段数组
 * @returns 只包含指定字段的新对象
 */
export function pickFields<T extends Record<string, unknown>, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key in obj) {
    if (fields.includes(key as unknown as K)) {
      ;(result as Record<string, unknown>)[key] = obj[key]
    }
  }
  return result
}

/**
 * 从对象中排除指定字段，返回一个新对象
 * @param obj 源对象
 * @param fields 要排除的字段数组
 * @returns 排除指定字段的新对象
 */
export function omitFields<T extends Record<string, unknown>, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>
  for (const key in obj) {
    if (!fields.includes(key as unknown as K)) {
      ;(result as Record<string, unknown>)[key] = obj[key]
    }
  }
  return result
}

export async function* normalizeToAsyncGenerator<T>(
  result: Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>,
): AsyncGenerator<T> {
  // 情况 1：是 async generator 或 sync generator
  if (isAsyncGenerator(result)) {
    yield* result
    return
  }

  // 情况 2：可能是 Promise<AsyncGenerator> 或 Promise<T>
  const awaited = await result

  // 情况 2a：await 后是 generator
  if (isAsyncGenerator(awaited)) {
    yield* awaited
    return
  }

  // 情况 2b：await 后是具体值 T
  yield awaited
}

// 判断是否为 async generator
function isAsyncGenerator(obj: any): obj is AsyncGenerator<any> {
  return obj && typeof obj === 'object' && typeof obj[Symbol.asyncIterator] === 'function'
}

// Type definition for objects with index property
export type ObjectWithIndex = { index: number; [key: string]: any }

// Type guard to check if value is an object
const isObject = (value: any) => {
  return typeof value === 'object' && value !== null
}

const isObjectWithIndex = (value: any): value is ObjectWithIndex => {
  return isObject(value) && typeof value.index === 'number'
}

/**
 * Merge delta data from completion responses
 * Handles string concatenation, object merging, and array merging by index
 *
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged target object
 */
export const combineDeltaData = (target: Record<string, any>, source: Record<string, any>) => {
  for (const [sourceKey, sourceValue] of Object.entries(source)) {
    const targetValue = target[sourceKey]

    if (targetValue) {
      if (typeof targetValue === 'string' && typeof sourceValue === 'string') {
        // Both are strings, concatenate them
        // 如果 sourceKey 为 'type' 且 targetValue 有值时，暂时排除 type 字段
        if (!(sourceKey === 'type' && targetValue)) {
          target[sourceKey] = targetValue + sourceValue
        }
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        if (
          targetValue.every((item) => isObjectWithIndex(item)) &&
          sourceValue.every((item) => isObjectWithIndex(item))
        ) {
          // Both are arrays of objects with index property, merge by index
          const targetMap = new Map(targetValue.map((item) => [item.index, item]))
          const sourceMap = new Map(sourceValue.map((item) => [item.index, item]))

          // Merge the two Maps, recursively merge objects with same index
          for (const [index, sourceItem] of sourceMap) {
            if (targetMap.has(index)) {
              // Objects with same index, recursively merge
              const targetItem = targetMap.get(index)!
              targetMap.set(index, combineDeltaData(targetItem, sourceItem) as ObjectWithIndex)
            } else {
              // New index, add directly
              targetMap.set(index, sourceItem)
            }
          }

          // Convert Map back to array, assign to corresponding index positions
          const arrLen = Math.max(...Array.from(targetMap.keys()), -1) + 1

          const resultArray = arrLen > targetValue.length ? Array.from({ length: arrLen }) : targetValue

          for (const [index, item] of targetMap) {
            resultArray[index] = item
          }

          target[sourceKey] = resultArray
        } else {
          // Regular arrays, merge directly
          target[sourceKey] = [...targetValue, ...sourceValue]
        }
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        // Both are objects, recursively merge
        target[sourceKey] = combineDeltaData(targetValue, sourceValue)
      }
    } else {
      // Property doesn't exist, assign directly
      target[sourceKey] = sourceValue
    }
  }

  return target
}
