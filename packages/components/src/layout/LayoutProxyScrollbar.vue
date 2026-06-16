<script setup lang="ts">
import { unrefElement } from '@vueuse/core'
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { useLayoutProxyScrollbar } from './composables/useLayoutProxyScrollbar'
import type { LayoutProxyScrollbarProps, LayoutScrollTarget } from './internal.type'

defineOptions({
  name: 'LayoutProxyScrollbar',
})

const props = defineProps<LayoutProxyScrollbarProps>()
const scrollbarRef = ref<HTMLElement | null>(null)

const resolveScrollTargetElement = (scrollTarget: LayoutScrollTarget): HTMLElement | null => {
  const element = unrefElement(scrollTarget as HTMLElement | ComponentPublicInstance | null | undefined)
  return element instanceof HTMLElement ? element : null
}

const scrollTargetRef = computed<HTMLElement | null>(() => resolveScrollTargetElement(props.scrollTarget))

const { isScrollable, rootClass, thumbStyle, setTrackHovering, startThumbDrag } = useLayoutProxyScrollbar({
  scrollTargetRef,
  containerRef: scrollbarRef,
})
</script>

<template>
  <div
    v-if="isScrollable"
    ref="scrollbarRef"
    class="tr-layout-proxy-scrollbar"
    :class="rootClass"
    aria-hidden="true"
    @mouseenter="setTrackHovering(true)"
    @mouseleave="setTrackHovering(false)"
  >
    <div class="tr-layout-proxy-scrollbar__thumb" :style="thumbStyle" @pointerdown="startThumbDrag" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout-proxy-scrollbar {
  position: absolute;
  top: var(--scrollbar-block-inset);
  right: var(--scrollbar-inline-end);
  bottom: var(--scrollbar-block-inset);
  width: var(--tr-layout-main-scrollbar-width);
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 140ms ease;
  z-index: 2;

  &--visible {
    opacity: 1;
    pointer-events: auto;
  }

  &__thumb {
    position: absolute;
    left: var(--scrollbar-thumb-inset);
    right: var(--scrollbar-thumb-inset);
    min-height: 36px;
    border-radius: 999px;
    background: var(--tr-layout-main-scrollbar-thumb-bg);
    cursor: grab;
    pointer-events: auto;
    transition: background-color 140ms ease;

    &:hover {
      background: var(--tr-layout-main-scrollbar-thumb-bg-hover);
    }
  }

  &--dragging-thumb &__thumb {
    cursor: grabbing;
    background: var(--tr-layout-main-scrollbar-thumb-bg-active);
  }
}
</style>
