/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeElement } from '@vueuse/core'
import { ComponentPublicInstance, computed, Fragment, ref, VNode, watch } from 'vue'

export function useSlotRefs(slot?: (...args: any[]) => VNode[], renderAll?: boolean) {
  const vnodes = computed(() => {
    const nodes = slot?.() || []

    // TODO 支持多个 Fragment 的情况
    // 如果第一个 vnode 是 Fragment 类型，并且 children 是数组，则返回 children（只渲染第一个 v-for Fragment）
    const firstNode = nodes.at(0)
    if (firstNode?.type === Fragment && Array.isArray(firstNode.children)) {
      return firstNode.children
    }

    return nodes
  })

  const length = computed(() => (renderAll ? vnodes.value.length : 1))
  const renderedVNodes = computed(() => vnodes.value.slice(0, length.value))

  const refs = ref<MaybeElement[]>([])

  const resolveRef = (el: unknown) => {
    if ((el as ComponentPublicInstance)?.$el) {
      // Vue 组件实例
      return el as ComponentPublicInstance
    } else if (el instanceof HTMLElement || el instanceof SVGElement) {
      // 原生 HTMLElement 或者 SVGElement
      return el
    }
    console.warn('trigger must be an HTMLElement or SVGElement or Vue component instance')
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
