<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnchorOverlayProps } from '../internal.type'

defineOptions({ name: 'AnchorOverlay' })

const props = withDefaults(defineProps<AnchorOverlayProps>(), {
  floatingOffset: 0,
})

const hostEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)

const rootClass = computed(() => [
  'tr-anchor',
  `is-${props.placement}`,
  {
    'is-expanded': props.expanded,
  },
])

const floatingStyle = computed(() => ({
  transform: `translate3d(0, ${props.floatingOffset}px, 0)`,
  maxHeight: props.availableHeight === undefined ? '100%' : `${props.availableHeight}px`,
}))

defineExpose({
  hostEl,
  overlayEl,
  navEl,
})
</script>

<template>
  <div ref="hostEl" :class="rootClass">
    <div ref="overlayEl" class="tr-anchor__overlay" :style="floatingStyle" data-testid="anchor-overlay">
      <div v-if="$slots.search" class="tr-anchor__search-cap">
        <slot name="search" />
      </div>

      <div class="tr-anchor__surface">
        <nav ref="navEl" class="tr-anchor__panel" aria-label="Content navigation">
          <slot />
        </nav>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-anchor {
  --tr-anchor-surface-padding-inline: 8px;
  --tr-anchor-item-padding-inline: 11px;
  --tr-anchor-tooltip-gap: 10px;

  pointer-events: none;
  z-index: var(--tr-z-index-fixed);
  inline-size: var(--tr-anchor-width-collapsed);
  min-inline-size: var(--tr-anchor-width-collapsed);

  position: absolute;
  top: 0;
  bottom: 0;

  &.is-right {
    right: var(--tr-chat-anchor-inset-inline-end, 0px);
  }

  &.is-left {
    left: 0;
  }

  &__overlay {
    position: absolute;
    top: 0;
    inline-size: var(--tr-anchor-width-collapsed);
    width: var(--tr-anchor-width-collapsed);
    overflow: visible;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-radius: var(--tr-anchor-surface-radius);
    pointer-events: auto;
    transition:
      width var(--tr-anchor-transition-duration) ease,
      inline-size var(--tr-anchor-transition-duration) ease,
      background-color var(--tr-anchor-transition-duration) ease,
      box-shadow var(--tr-anchor-transition-duration) ease;
  }

  &.is-right &__overlay {
    right: 0;
  }

  &.is-left &__overlay {
    left: 0;
  }

  &.is-expanded &__overlay {
    inline-size: var(--tr-anchor-width-expanded);
    width: var(--tr-anchor-width-expanded);
    background: var(--tr-anchor-bg);
    box-shadow:
      inset 0 0 0 1px var(--tr-anchor-border),
      var(--tr-anchor-shadow);
  }

  &__surface {
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 8px 0;
  }

  &__search-cap {
    flex-shrink: 0;
    padding: 10px 10px 4px;
  }

  &__panel {
    position: relative;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    overflow-anchor: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tr-anchor__overlay {
    transition: none;
  }
}
</style>
