<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useElementBounding, useElementSize } from '@vueuse/core'
import { computed, CSSProperties, isVNode, ref, TransitionProps, VNode, watch } from 'vue'
import { useSlotRefs, useTeleportTarget } from '../shared/composables'
import { toCssUnit } from '../shared/utils'

defineOptions({
  inheritAttrs: false,
})

type TriggerEvents = Partial<Record<`on${Capitalize<string>}`, (...args: any[]) => void>>

const props = withDefaults(
  defineProps<{
    appendTo?: string | HTMLElement
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
  trigger?: () => VNode[]
  content?: () => VNode[]
  backdrop?: () => VNode[]
}>()

const {
  vnodes: triggerVNodes,
  refs: triggerRefs,
  ref: triggerRef,
  setRefs,
} = useSlotRefs(slots.trigger, props.renderAllTriggers)

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
  triggerVNodes.value.map((_, index) => createIndexedEventHandlers(props.triggerEvents, index)),
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
      update()
    }
  },
  { flush: 'post' },
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
    v-for="(vnode, index) in triggerVNodes"
    :key="isVNode(vnode) ? vnode.key : index"
    :is="vnode"
    :ref="(el: unknown) => setRefs(el, index)"
    v-bind="indexedEventHandlers[index]"
  />
  <!-- TODO 临时方案 -->
  <slot name="backdrop" />
  <!-- TODO 使用 Teleport 包裹 Transition -->
  <Transition v-bind="transitionProps">
    <Teleport v-if="show" :to="props.appendTo || teleportTarget">
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
