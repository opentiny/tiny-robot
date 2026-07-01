<script setup lang="ts">
import { useScroll, useEventListener, useResizeObserver, useMutationObserver } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { TrIconButton } from '@opentiny/tiny-robot'

const props = defineProps<{
  target: HTMLElement | null
}>()

const distanceToBottom = shallowRef(0)
const { y, measure } = useScroll(() => props.target, {
  behavior: 'smooth',
  observe: true,
})
const isVisible = computed(() => distanceToBottom.value > 80)

function syncDistance() {
  const target = props.target
  distanceToBottom.value = target ? target.scrollHeight - target.clientHeight - target.scrollTop : 0
}

useEventListener(() => props.target, 'scroll', syncDistance)
useResizeObserver(() => props.target, syncDistance)
useMutationObserver(() => props.target, syncDistance, { childList: true, subtree: true })

watch(
  () => props.target,
  () => syncDistance(),
  { immediate: true },
)

function scrollToBottom() {
  measure()
  y.value = props.target?.scrollHeight ?? 0
}
</script>

<template>
  <TrIconButton
    v-if="isVisible"
    class="tr-chat-scroll-to-bottom"
    :icon="IconArrowDown"
    rounded
    size="36"
    svg-size="18"
    type="button"
    aria-label="滚动到底部"
    @click="scrollToBottom"
  />
</template>

<style lang="less" scoped>
.tr-chat-scroll-to-bottom {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  z-index: 10;
  transform: translateX(-50%);
  color: var(--tr-text-secondary);
  opacity: 0.95;
  transition: opacity 0.2s ease-in-out;

  &.tr-icon-button {
    background: var(--tr-chat-scroll-button-bg, #fff);
    border: 1px solid var(--tr-chat-scroll-button-border-color, rgba(23, 32, 51, 0.12));
  }

  &:hover {
    background: #f0f0f0 !important;
  }
}
</style>
