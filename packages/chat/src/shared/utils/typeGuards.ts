/**
 * 类型守卫和工具函数
 * 用于处理 Union type 的属性提取和类型转换
 */

/**
 * 从 Union type 的对象中安全地提取属性
 * 用于处理互斥的 Union type props
 *
 * @example
 * // 对于 Union type: { a: string } | { b: number }
 * const value = extractProp(props, 'a', 'string')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractProp<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue?: T[K],
): T[K] | undefined {
  return key in obj ? obj[key] : defaultValue
}

/**
 * 类型安全的条件属性提取
 * 用于 Union type 中的条件属性访问
 *
 * @example
 * // 对于 Union type: { responseProvider: Provider } | { responseProvider: Provider, storage: Storage }
 * const provider = conditionalProp(props, 'responseProvider')
 * const storage = conditionalProp(props, 'storage')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function conditionalProp<T extends Record<string, any>, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return key in obj ? (obj[key] as T[K]) : undefined
}
