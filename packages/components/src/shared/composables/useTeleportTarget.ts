import { MaybeElementRef, unrefElement } from '@vueuse/core'
import { computed } from 'vue'

/**
 * 计算 Teleport 的目标节点，仅在 Shadow DOM 或 document.body 范围内查找 target。
 * - target 可以为 HTMLElement 或选择器字符串。
 * - 如果 target 为 HTMLElement，直接返回该元素。
 * - 如果 target 为字符串：
 *   - 如果 reference 在 Shadow DOM 中，会在 ShadowRoot 中查找 target。
 *   - 否则在 document.body 内查找 target（如果 target 为 'body'，直接返回 document.body）。
 *   - 如果查找失败，则返回查找的根节点（ShadowRoot 或 body）。
 */
export function useTeleportTarget(
  reference?: MaybeElementRef,
  target?: string | HTMLElement,
  options: { fallback?: 'root' | 'body' } = {},
) {
  return computed(() => {
    const referentceEl = unrefElement(reference)
    const rootNode = referentceEl?.getRootNode?.()
    const inShadowDOM = rootNode instanceof ShadowRoot
    const searchRoot = inShadowDOM ? rootNode : document.body
    const fallbackTarget = options.fallback === 'body' ? document.body : searchRoot

    if (target instanceof HTMLElement) {
      return target.isConnected ? target : fallbackTarget
    }

    const selector = target

    if (selector) {
      if (selector === 'body' && (!inShadowDOM || options.fallback === 'body')) {
        // 特殊处理，直接返回 <body>
        return document.body
      }

      try {
        const found = searchRoot.querySelector(selector)
        if (found instanceof Node) return found
      } catch {
        return fallbackTarget
      }
    }

    return fallbackTarget
  })
}
