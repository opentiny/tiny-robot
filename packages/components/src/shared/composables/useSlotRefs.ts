/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeElement } from '@vueuse/core'
import { ComponentPublicInstance, computed, Fragment, ref, VNode, watch } from 'vue'

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

  // TODO 不使用 MaybeElement，直接在 resolveRef 中 unrefElement
  const refs = ref<MaybeElement[]>([])

  const resolveRef = (el: unknown) => {
    if (el && typeof el === 'object' && '$el' in el) {
      // Vue 组件实例
      return el as ComponentPublicInstance
    } else if (el instanceof HTMLElement || el instanceof SVGElement) {
      // 原生 HTMLElement 或者 SVGElement
      return el
    }
    console.warn('el must be an HTMLElement or SVGElement or Vue component instance. el:', el)
    return null
  }

  const setRef = (el: unknown) => {
    refs.value[0] = resolveRef(el)
  }

  const setRefs = (el: unknown, index: number) => {
    refs.value[index] = resolveRef(el)
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
    setRef,
    setRefs,
  }
}
