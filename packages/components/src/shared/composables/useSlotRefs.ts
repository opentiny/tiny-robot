/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeElement } from '@vueuse/core'
import { ComponentPublicInstance, computed, Fragment, ref, VNode, watch } from 'vue'

export function useSlotRefs(slot?: (...args: any[]) => VNode[], renderAll?: boolean) {
  const vnodes = computed(() => {
    const nodes = slot?.() || []

    // 如果 vnodes 中存在 Fragment 类型，并且 children 是数组，则返回 children。只渲染第一个是 Fragment 的节点
    const fragmentNode = nodes.find((node) => node.type === Fragment)
    if (fragmentNode && Array.isArray(fragmentNode.children)) {
      return fragmentNode.children
    }

    return nodes
  })

  const length = computed(() => (renderAll ? vnodes.value.length : 1))
  const renderedVNodes = computed(() => vnodes.value.slice(0, length.value))

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
