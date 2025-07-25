/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeElement, unrefElement } from '@vueuse/core'
import { computed, Fragment, ref, VNode, watch } from 'vue'

export function useSlotRefs(slot?: (...args: any[]) => VNode[], renderAll?: boolean) {
  const vnodes = computed(() => {
    const nodes = slot?.() || []

    let fragmentCount = 0

    const regenKey = (key: PropertyKey | null) => {
      // 如果 key 是 symbol，则保持 key 不变，symbol 是唯一的，不会重复
      if (typeof key === 'symbol') {
        return key
      }
      // 如果指定了 key，给 key 添加前缀，用来区分不同的 Fragment 节点；如果未指定 key，保持 key 不变
      return key === null || key === undefined ? key : `fg${fragmentCount}-${key}`
    }

    return nodes
      .map((node) => {
        if (node.type === Fragment && Array.isArray(node.children)) {
          for (const child of node.children) {
            if (child && typeof child === 'object' && 'key' in child) {
              child.key = regenKey(child.key)
            }
          }
          fragmentCount++
          return node.children
        }
        return node
      })
      .flat()
  })

  const length = computed(() => (renderAll ? vnodes.value.length : 1))
  const renderedVNodes = computed(() => vnodes.value.slice(0, length.value))

  const refs = ref<(HTMLElement | SVGElement | null)[]>([])

  const setRefs = (el: unknown, index: number) => {
    const resolvedEl = unrefElement(el as MaybeElement)
    if (resolvedEl instanceof Element) {
      refs.value[index] = resolvedEl
    }
  }

  watch(
    length,
    (len) => {
      refs.value.length = len
    },
    { flush: 'post' },
  )

  return {
    vnodes: renderedVNodes,
    ref: computed(() => refs.value.at(0)),
    refs,
    setRef: (el: unknown) => setRefs(el, 0),
    setRefs,
  }
}
