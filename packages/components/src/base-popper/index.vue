<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="tsx">
import { useElementBounding, useElementSize } from '@vueuse/core'
import { computed, CSSProperties, ref, TransitionProps, useAttrs, VNode, watch } from 'vue'
import { createTeleport, useSlotRefs, useTeleportTarget } from '../shared/composables'
import { toCssUnit } from '../shared/utils'
import Popper from './components/Popper.vue'

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
}>()

const { vnodes: triggerVNodes, ref: triggerRef, setRef } = useSlotRefs(slots.trigger)

const resolveEventHandlers = (events: TriggerEvents = {}) => {
  const result: TriggerEvents = {}

  for (const [key, value] of Object.entries(events)) {
    if (/^on[A-Z]/.test(key) && typeof value === 'function') {
      result[key as keyof TriggerEvents] = value
    }
  }

  return result
}

const popperInstance = ref<InstanceType<typeof Popper> | null>(null)
const popperRef = computed(() => popperInstance.value?.popperRef || null)

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
  type Side = 'top' | 'left'
  const styles: Pick<CSSProperties, Side> = {}

  const set = (side: Side, value: string) => {
    if (!preventOverflow) {
      styles[side] = value
      return
    }

    const isVertical = side === 'top'
    const size = toCssUnit(isVertical ? popperHeight.value : popperWidth.value)

    if (side === 'top') {
      styles[side] = `clamp(var(--tr-base-popper-min-top), ${value}, calc(var(--tr-base-popper-max-bottom) - ${size}))`
    } else if (side === 'left') {
      styles[side] = `clamp(var(--tr-base-popper-min-left), ${value}, calc(var(--tr-base-popper-max-right) - ${size}))`
    }
  }

  // 只用 top/left 定位
  if (placement.includes('top')) {
    set('top', toCssUnit(top.value - popperHeight.value - resolvedOffset.value.mainAxis))
  }
  if (placement.includes('bottom')) {
    // bottom 定位转换为 top 定位
    set('top', toCssUnit(bottom.value + resolvedOffset.value.mainAxis))
  }
  if (placement.includes('left')) {
    set('left', toCssUnit(left.value + resolvedOffset.value.crossAxis))
  }
  if (placement.includes('right')) {
    // right 定位转换为 left 定位
    set('left', toCssUnit(right.value - popperWidth.value + resolvedOffset.value.crossAxis))
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

const teleportTarget = useTeleportTarget(triggerRef, props.appendTo)

const attrs = useAttrs()

createTeleport(
  () => ({ to: teleportTarget.value }),
  () => (
    <Popper
      ref={popperInstance}
      show={props.show}
      transitionProps={props.transitionProps}
      style={popperStyles.value}
      {...attrs}
    >
      {slots.content?.()}
    </Popper>
  ),
)

defineExpose({
  triggerRef,
  popperRef,
  update,
})
</script>

<template>
  <component :is="triggerVNodes[0]" :ref="setRef" v-bind="resolveEventHandlers(props.triggerEvents)" />
</template>

<style lang="less">
:root {
  --tr-base-popper-min-top: 0px;
  --tr-base-popper-max-bottom: 100%;
  --tr-base-popper-min-left: 0px;
  --tr-base-popper-max-right: 100%;
}
</style>

<style lang="less" scoped>
.tr-base-popper {
  position: fixed;
}
</style>
