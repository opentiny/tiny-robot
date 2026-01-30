/* eslint-disable @typescript-eslint/no-explicit-any */
import { toRaw } from 'vue'
import { ChatMessage } from '../types'

/**
 * 递归解包 Proxy 对象，将 Vue 响应式对象转换为普通对象
 * 同时移除不可序列化的内容（函数、Symbol 等）
 *
 * @param value - 要解包的值
 * @param visited - 用于检测循环引用和共享引用的 WeakMap，映射原始对象到其克隆对象
 * @returns 解包后的普通对象
 */
export function unwrapProxy<T>(value: T, visited: WeakMap<object, any> = new WeakMap()): T {
  // 处理 null 和 undefined
  if (value === null || value === undefined) {
    return value
  }

  // 处理基本类型
  if (typeof value !== 'object') {
    return value
  }

  try {
    // 使用 Vue 的 toRaw 解包响应式对象
    const rawValue: any = toRaw(value)

    // 如果已经处理过该对象，返回之前创建的克隆对象（处理循环引用和共享引用）
    if (visited.has(rawValue)) {
      return visited.get(rawValue)
    }

    // 处理数组
    if (Array.isArray(rawValue)) {
      // 先创建空数组并存储到 visited，避免循环引用问题
      const arr: any[] = []
      visited.set(rawValue, arr)
      // 然后填充数组内容
      arr.push(...rawValue.map((item: any) => unwrapProxy(item, visited)))
      return arr as T
    }

    // 处理 Date 对象
    if (rawValue instanceof Date) {
      return rawValue as T
    }

    // 处理 RegExp 对象
    if (rawValue instanceof RegExp) {
      return rawValue as T
    }

    // 处理 ArrayBuffer、Blob 等二进制对象（IndexedDB 支持）
    if (rawValue instanceof ArrayBuffer || rawValue instanceof Blob) {
      return rawValue as T
    }

    // 处理普通对象
    // 先创建空对象并存储到 visited，避免循环引用问题
    const result: any = {}
    visited.set(rawValue, result)

    // 使用 Object.keys 而不是 for...in，确保只处理自有属性
    for (const key of Object.keys(rawValue)) {
      const descriptor = Object.getOwnPropertyDescriptor(rawValue, key)
      if (!descriptor) {
        continue
      }

      // 跳过 getter/setter 属性
      if (descriptor.get || descriptor.set) {
        continue
      }

      const propValue = rawValue[key]

      // 跳过函数
      if (typeof propValue === 'function') {
        continue
      }

      // 跳过 Symbol 值
      if (typeof propValue === 'symbol') {
        continue
      }

      // 递归处理嵌套对象
      result[key] = unwrapProxy(propValue, visited)
    }

    return result as T
  } catch (error) {
    // 如果解包过程中出错，返回空对象或空数组
    console.warn('unwrapProxy error:', error)
    return (Array.isArray(value) ? [] : {}) as T
  }
}

// 兼容旧格式
export const transformMessages = (messages: ChatMessage[]) => {
  return messages.map((message) => {
    const { renderContent, ...restMessage } = message
    if (!Array.isArray(renderContent)) {
      return message
    }

    // 将message.renderContent type 为 collapsible-text 转换成 message.reasoning_content，如果有多个，则拼接；将 type 为 markdown 的转换成 message.content，如果有多个则拼接
    const collapsibleTextItems = renderContent.filter((item) => item.type === 'collapsible-text')
    const textItems = renderContent.filter((item) => item.type === 'markdown' || item.type === 'text')

    if (collapsibleTextItems.length > 0) {
      restMessage.reasoning_content = collapsibleTextItems.map((item) => item.content).join('')
    }

    if (textItems.length > 0) {
      restMessage.content = textItems.map((item) => item.content).join('')
    }

    return restMessage
  })
}
