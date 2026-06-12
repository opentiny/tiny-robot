<script setup lang="ts">
import { unrefElement } from '@vueuse/core'
import { computed, type ComponentPublicInstance } from 'vue'
import { useLayoutMainScrollbar } from './composables/useLayoutMainScrollbar'
import type { LayoutMainProps, LayoutMainScrollHost } from './internal.type'

defineOptions({
  name: 'LayoutMain',
})

const props = defineProps<LayoutMainProps>()

const resolveScrollHostElement = (scrollHost: LayoutMainScrollHost): HTMLElement | null => {
  const element = unrefElement(scrollHost as HTMLElement | ComponentPublicInstance | null | undefined)
  return element instanceof HTMLElement ? element : null
}

const scrollHostRef = computed<HTMLElement | null>(() => resolveScrollHostElement(props.scrollHost))

const { showScrollbar, rootClass, thumbStyle, setHovering, startThumbDrag } = useLayoutMainScrollbar({
  scrollHostRef,
})
</script>

<template>
  <div class="tr-layout-main" :class="rootClass" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)">
    <slot />

    <div v-if="showScrollbar" class="tr-layout-main__scrollbar" aria-hidden="true">
      <div class="tr-layout-main__scrollbar-thumb" :style="thumbStyle" @pointerdown="startThumbDrag" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-layout-main {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100%;
  height: 100%;
  overflow: hidden;

  :deep([data-tr-layout-scroll-host]) {
    width: 100%;
    height: 100%;
    min-height: 100%;
    box-sizing: border-box;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__scrollbar {
    position: absolute;
    top: var(--tr-layout-inner-padding-block);
    right: var(--scrollbar-inline-end);
    bottom: var(--tr-layout-inner-padding-block);
    width: var(--tr-layout-main-scrollbar-width);
    border-radius: 999px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 140ms ease;
  }

  &--scrollbar-visible &__scrollbar {
    opacity: 1;
  }

  &__scrollbar-thumb {
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

  &--dragging-thumb &__scrollbar-thumb {
    cursor: grabbing;
    background: var(--tr-layout-main-scrollbar-thumb-bg-active);
  }
}
</style>
