<script setup lang="ts">
import { useScroll, useEventListener, useResizeObserver, useMutationObserver } from '@vueuse/core'
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { TrIconButton } from '@opentiny/tiny-robot'

const props = defineProps<{
  target: HTMLElement | null
  label: string
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

let syncFrame: number | undefined

function scheduleSyncDistance() {
  if (syncFrame !== undefined) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = undefined
    syncDistance()
  })
}

useEventListener(() => props.target, 'scroll', scheduleSyncDistance)
useEventListener(() => props.target, 'load', scheduleSyncDistance, { capture: true })
useEventListener(() => props.target, 'loadedmetadata', scheduleSyncDistance, { capture: true })
useResizeObserver(() => props.target, scheduleSyncDistance)
useMutationObserver(() => props.target, scheduleSyncDistance, { childList: true, subtree: true })

watch(
  () => props.target,
  () => scheduleSyncDistance(),
  { immediate: true },
)

onUnmounted(() => {
  if (syncFrame !== undefined) cancelAnimationFrame(syncFrame)
})

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
    :aria-label="props.label"
    @click="scrollToBottom"
  />
</template>

<style lang="less" scoped>
.tr-chat-scroll-to-bottom.tr-icon-button {
  color: var(--tr-text-secondary);
  background: var(--tr-chat-scroll-button-bg, var(--tr-container-bg-default));
  border: 1px solid var(--tr-chat-scroll-button-border-color, var(--tr-border-color-default));
  opacity: 0.95;
  transition:
    opacity 0.2s ease-in-out,
    background-color 0.2s ease-in-out;

  &:hover {
    color: var(--tr-text-primary);
    background: var(
      --tr-chat-scroll-button-hover-bg,
      color-mix(in srgb, var(--tr-text-primary) 8%, var(--tr-chat-scroll-button-bg, var(--tr-container-bg-default)))
    );
  }
}
</style>
