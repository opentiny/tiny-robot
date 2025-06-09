<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { computed, CSSProperties, ref, watch } from 'vue'
import { toCssUnit } from '../../shared/utils'

interface TooltipContentProps {
  show?: boolean
  content: string
  trigger?: HTMLElement | null
  disabled?: boolean
  placement?: 'top' | 'bottom'
  delayOpen?: number
  delayClose?: number
}

const props = defineProps<TooltipContentProps>()
const showModel = defineModel<TooltipContentProps['show']>('show', { default: false })
const showTooltip = ref(props.show)
const triggerRef = computed(() => props.trigger)
// TODO 似乎在shadow dom中无法监听变化
const { x, y, width, height } = useElementBounding(triggerRef)

const style = computed<CSSProperties>(() => {
  if (!props.trigger) return {}

  return {
    left: toCssUnit(x.value),
    top: props.placement === 'top' ? toCssUnit(y.value) : toCssUnit(y.value + height.value),
    width: toCssUnit(width.value),
  }
})

let delayTimer: NodeJS.Timeout | null = null

watch(
  () => [showModel.value, props.delayOpen, props.delayClose] as const,
  ([show, delayOpen, delayClose]) => {
    if (show) {
      // 如果 delayOpen 为 0，则立即显示
      if ((delayOpen ?? 0) <= 0) {
        showTooltip.value = true
        return
      }

      if (delayTimer) {
        clearTimeout(delayTimer)
      }

      delayTimer = setTimeout(() => {
        showTooltip.value = true
      }, delayOpen)
    } else {
      // 如果 delayClose 为 0，则立即隐藏
      if ((delayClose ?? 0) <= 0) {
        showTooltip.value = false
        return
      }

      if (delayTimer) {
        clearTimeout(delayTimer)
      }

      delayTimer = setTimeout(() => {
        showTooltip.value = false
      }, delayClose)
    }
  },
)

const handleMouseleave = (event: MouseEvent) => {
  if (triggerRef.value?.contains(event.relatedTarget as Node)) {
    return
  }

  showModel.value = false
}
</script>

<template>
  <Transition name="tr-tooltip">
    <div
      v-if="!props.disabled && showTooltip"
      class="tr-tooltip"
      :class="`placement-${props.placement}`"
      role="tooltip"
      :style="style"
      @mouseleave="handleMouseleave"
    >
      <div class="tr-tooltip-arrow"></div>
      <span class="tr-tooltip-content">{{ props.content }}</span>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-tooltip {
  --tr-tooltip-bg: rgb(255, 255, 255);
  --tr-tooltip-text: rgb(25, 25, 25);
  --tr-tooltip-shadow: 0 2px 12px rgba(0, 0, 0, 0.16);
  --tr-tooltip-radius: 12px;
  --tr-tooltip-padding: 16px;
  --tr-tooltip-font-size: 14px;
  --tr-tooltip-line-height: 22px;
  --tr-tooltip-arrow-size: 8px;
  --tr-tooltip-offset: 10px;

  position: fixed;
  z-index: var(--tr-z-index-tooltip);

  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-to,
  &-leave-from {
    opacity: 1;
  }

  .tr-tooltip-content {
    display: block;
    padding: var(--tr-tooltip-padding);
    color: var(--tr-tooltip-text);
    font-size: var(--tr-tooltip-font-size);
    line-height: var(--tr-tooltip-line-height);
    word-break: break-word;
    background-color: var(--tr-tooltip-bg);
    border-radius: var(--tr-tooltip-radius);
    box-shadow: var(--tr-tooltip-shadow);
  }

  .tr-tooltip-arrow {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -100%);
    width: 0;
    height: 0;
    border-left: var(--tr-tooltip-arrow-size) solid transparent;
    border-right: var(--tr-tooltip-arrow-size) solid transparent;
  }

  &.placement-top {
    padding-bottom: var(--tr-tooltip-offset);
    transform: translateY(-100%);

    .tr-tooltip-arrow {
      top: calc(100% - var(--tr-tooltip-offset) + var(--tr-tooltip-arrow-size));
      border-top: var(--tr-tooltip-arrow-size) solid var(--tr-tooltip-bg);
    }
  }

  &.placement-bottom {
    padding-top: var(--tr-tooltip-offset);

    .tr-tooltip-arrow {
      top: calc(0 - var(--tr-tooltip-arrow-size));
      border-bottom: var(--tr-tooltip-arrow-size) solid var(--tr-tooltip-bg);
    }
  }
}
</style>
