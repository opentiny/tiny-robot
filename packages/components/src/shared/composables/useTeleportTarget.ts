import { MaybeElementRef, unrefElement } from '@vueuse/core'
import { computed } from 'vue'

/**
 * 计算 Teleport 的目标节点，仅在 Shadow DOM 或 document.body 范围内查找 selector。
 * - 如果 reference 在 Shadow DOM 中，会在 ShadowRoot 中查找 selector。
 * - 否则在 document.body 内查找 selector（如果 selector 为 'body'，直接返回 document.body）。
 * - 如果查找失败，则返回查找的根节点（ShadowRoot 或 body）。
 */
export function useTeleportTarget(reference?: MaybeElementRef, selector?: string) {
  return computed(() => {
    const referentceEl = unrefElement(reference)
    const rootNode = referentceEl?.getRootNode?.()
    const inShadowDOM = rootNode instanceof ShadowRoot
    const searchRoot = inShadowDOM ? rootNode : document.body

    if (selector) {
      if (!inShadowDOM && selector === 'body') {
        // 特殊处理，直接返回 <body>
        return document.body
      }

      const target = searchRoot.querySelector(selector)
      if (target instanceof Node) return target
    }

    return searchRoot
  })
}
