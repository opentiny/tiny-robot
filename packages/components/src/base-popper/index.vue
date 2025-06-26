<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { MaybeElement, useElementBounding, useElementSize } from '@vueuse/core'
import {
  ComponentPublicInstance,
  computed,
  CSSProperties,
  Fragment,
  nextTick,
  ref,
  TransitionProps,
  VNode,
  watch,
} from 'vue'
import { useTeleportTarget } from '../shared/composables'
import { toCssUnit } from '../shared/utils'

defineOptions({
  inheritAttrs: false,
})

type TriggerEvents = Partial<Record<`on${Capitalize<string>}`, (...args: any[]) => void>>

const props = withDefaults(
  defineProps<{
    offset?: number | { mainAxis?: number; crossAxis?: number }
    placement?: 'top-center' | 'bottom-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    preventOverflow?: boolean
    renderAllTriggers?: boolean
    show?: boolean
    transitionProps?: TransitionProps
    triggerEvents?: TriggerEvents
  }>(),
  {
    placement: 'top-center',
  },
)

const slots = defineSlots<{
  trigger?: () => VNode | VNode[]
  content?: () => VNode | VNode[]
}>()

const triggerVNodes = computed(() => {
  const triggerSlot = slots.trigger?.()
  const vnodes = triggerSlot ? (Array.isArray(triggerSlot) ? triggerSlot : [triggerSlot]) : []

  // 如果第一个 vnode 是 Fragment 类型，并且 children 是数组，则返回 children（只渲染第一个 v-for Fragment）
  if (vnodes[0].type === Fragment && Array.isArray(vnodes[0].children)) {
    return vnodes[0].children
  }

  return vnodes
})
const triggerLength = computed(() => (props.renderAllTriggers ? triggerVNodes.value.length : 1))
const renderedTriggerVNodes = computed(() => triggerVNodes.value.slice(0, triggerLength.value))

const triggerRefs = ref<MaybeElement[]>([])
const triggerRef = computed(() => triggerRefs.value.at(0))

const getRef = (el: unknown) => {
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

const setRefs = (el: unknown, index: number) => {
  triggerRefs.value[index] = getRef(el)
}

watch(
  triggerLength,
  (len) => {
    triggerRefs.value.length = len
  },
  { flush: 'post' },
)

function createIndexedEventHandlers(events: TriggerEvents = {}, index: number) {
  const wrapped: TriggerEvents = {}

  for (const [key, value] of Object.entries(events)) {
    if (/^on[A-Z]/.test(key) && typeof value === 'function') {
      wrapped[key as keyof TriggerEvents] = (...args: any[]) => value(...args, index)
    }
  }

  return wrapped
}

const indexedEventHandlers = computed(() =>
  renderedTriggerVNodes.value.map((_, index) => createIndexedEventHandlers(props.triggerEvents, index)),
)

const popperRef = ref<HTMLDivElement | null>(null)

const resolvedOffset = computed(() => {
  if (typeof props.offset === 'number') {
    return { mainAxis: props.offset, crossAxis: 0 }
  }
  return {
    mainAxis: props.offset?.mainAxis ?? 0,
    crossAxis: props.offset?.crossAxis ?? 0,
  }
})

const { top, bottom, left, right, width, update } = useElementBounding(triggerRef)
const { width: popperWidth, height: popperHeight } = useElementSize(popperRef, undefined, { box: 'border-box' })

const popperStyles = computed<CSSProperties>(() => {
  const { placement, preventOverflow } = props
  type Side = 'top' | 'bottom' | 'left' | 'right'
  const styles: Pick<CSSProperties, Side> = {}

  const set = (side: Side, value: string) => {
    if (!preventOverflow) {
      styles[side] = value
      return
    }

    const isVertical = side === 'top' || side === 'bottom'
    const maxViewport = isVertical ? '100dvh' : '100dvw'
    const size = toCssUnit(isVertical ? popperHeight.value : popperWidth.value)

    styles[side] = `clamp(0px, ${value}, calc(${maxViewport} - ${size}))`
  }

  if (placement.includes('top')) {
    set('top', toCssUnit(top.value - popperHeight.value - resolvedOffset.value.mainAxis))
  }
  if (placement.includes('bottom')) {
    set('bottom', `calc(100% - ${toCssUnit(bottom.value + popperHeight.value + resolvedOffset.value.mainAxis)})`)
  }
  if (placement.includes('left')) {
    set('left', toCssUnit(left.value + resolvedOffset.value.crossAxis))
  }
  if (placement.includes('right')) {
    set('right', `calc(100% - ${toCssUnit(right.value + resolvedOffset.value.crossAxis)})`)
  }
  if (placement.includes('center')) {
    set('left', toCssUnit(left.value + width.value / 2 - popperWidth.value / 2 + resolvedOffset.value.crossAxis))
  }

  return styles
})

watch(
  () => props.show,
  (value) => {
    if (value) {
      nextTick(() => {
        update()
      })
    }
  },
)

const teleportTarget = useTeleportTarget(triggerRef)

defineExpose({
  triggerRef,
  triggerRefs,
  popperRef,
})
</script>

<template>
  <component
    v-for="(vnode, index) in renderedTriggerVNodes"
    :key="(vnode as VNode).key ?? index"
    :is="vnode"
    :ref="(el: unknown) => setRefs(el, index)"
    v-bind="indexedEventHandlers[index]"
  />
  <Transition v-bind="transitionProps">
    <Teleport v-if="show" :to="teleportTarget">
      <div class="tr-base-popper" ref="popperRef" :style="popperStyles" v-bind="$attrs">
        <slot name="content" />
      </div>
    </Teleport>
  </Transition>
</template>

<style lang="less" scoped>
.tr-base-popper {
  position: fixed;
}
</style>
