<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import type { ContentNavOverlayProps } from '../internal.type'

defineOptions({ name: 'ContentNavOverlay' })

const props = withDefaults(defineProps<ContentNavOverlayProps>(), {
  floatingOffset: 0,
})

const hostEl = ref<HTMLElement | null>(null)
const overlayEl = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)
const slots = useSlots()

const rootClass = computed(() => [
  'tr-content-nav',
  `is-${props.placement}`,
  {
    'is-expanded': props.expanded,
    'has-search-cap': Boolean(slots.search),
  },
])

const floatingStyle = computed(() => ({
  transform: `translate3d(0, ${props.floatingOffset}px, 0)`,
}))

defineExpose({
  hostEl,
  overlayEl,
  navEl,
})
</script>

<template>
  <div ref="hostEl" :class="rootClass" :style="floatingStyle">
    <div ref="overlayEl" class="tr-content-nav__overlay" data-testid="content-nav-overlay">
      <div v-if="$slots.search" class="tr-content-nav__search-cap">
        <slot name="search" />
      </div>

      <div class="tr-content-nav__surface">
        <nav ref="navEl" class="tr-content-nav__panel" aria-label="Content navigation">
          <slot />
        </nav>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-content-nav {
  pointer-events: none;
  z-index: var(--tr-z-index-fixed);
  inline-size: var(--tr-content-nav-width-collapsed);
  min-inline-size: var(--tr-content-nav-width-collapsed);

  position: absolute;
  top: 0;
  bottom: 0;

  &.is-right {
    right: 0;
  }

  &.is-left {
    left: 0;
  }

  &__overlay {
    position: absolute;
    top: 0;
    inline-size: var(--tr-content-nav-width-collapsed);
    width: var(--tr-content-nav-width-collapsed);
    overflow: visible;
    box-sizing: border-box;
    pointer-events: auto;
    transition:
      width 0.22s ease,
      inline-size 0.22s ease,
      transform 0.22s ease;
  }

  &.is-right &__overlay {
    right: 0;
  }

  &.is-left &__overlay {
    left: 0;
  }

  &.is-expanded &__overlay {
    inline-size: var(--tr-content-nav-width-expanded);
    width: var(--tr-content-nav-width-expanded);
  }

  &__surface {
    width: 100%;
    overflow: visible;
    border: 1px solid transparent;
    border-radius: var(--tr-content-nav-surface-radius);
    box-sizing: border-box;
    transition:
      background-color 0.22s ease,
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }

  &.is-expanded &__surface {
    background: var(--tr-content-nav-bg);
    border: 1px solid var(--tr-content-nav-border);
    box-shadow: var(--tr-content-nav-shadow);
  }

  &.is-expanded.has-search-cap &__surface {
    border-radius: 0 0 var(--tr-content-nav-surface-radius) var(--tr-content-nav-surface-radius);
  }

  &__search-cap {
    position: absolute;
    inset-inline: 0;
    bottom: calc(100% - 1px);
    padding: 10px 10px 8px;
    background: var(--tr-content-nav-bg);
    border: 1px solid var(--tr-content-nav-border);
    border-bottom: 0;
    border-radius: var(--tr-content-nav-surface-radius) var(--tr-content-nav-surface-radius) 0 0;
    box-sizing: border-box;
  }

  &__panel {
    position: relative;
  }
}
</style>
