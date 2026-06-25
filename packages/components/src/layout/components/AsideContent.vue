<script setup lang="ts">
import { ref, computed } from 'vue'
import AsideResizeTrigger from './AsideResizeTrigger.vue'
import type { LayoutAsideResizeDetail } from '../index.type'
import type { LayoutAsidePanel } from '../internal.type'

defineOptions({
  name: 'LayoutAsideContent',
})

interface LayoutAsideContentProps {
  panel: LayoutAsidePanel
  oppositeDockWidth: number
}

const asideRef = ref<HTMLElement | null>(null)
const props = defineProps<LayoutAsideContentProps>()

const emit = defineEmits<{
  (event: 'width-change', value: number): void
  (event: 'aside-resize-start', value: LayoutAsideResizeDetail): void
  (event: 'aside-resize', value: LayoutAsideResizeDetail): void
  (event: 'aside-resize-end', value: LayoutAsideResizeDetail): void
}>()

const asideClass = computed(() => [
  `tr-layout__aside--${props.panel.side}`,
  `tr-layout__aside--effect-${props.panel.collapseEffect.value}`,
  {
    'tr-layout__aside--dock': props.panel.isDock.value,
    'tr-layout__aside--drawer': props.panel.isDrawer.value,
    'tr-layout__aside--expanded': props.panel.isOpen.value,
    'tr-layout__aside--rail': props.panel.isRail.value,
    'tr-layout__aside--hidden': props.panel.isHidden.value,
  },
])
</script>

<template>
  <aside ref="asideRef" class="tr-layout__aside" :class="asideClass" :inert="props.panel.isHidden.value || undefined">
    <AsideResizeTrigger
      v-if="panel.canResize.value"
      :side="panel.side"
      :aside-el="asideRef"
      :min-width="panel.minWidth.value"
      :max-width="panel.maxWidth.value"
      :opposite-dock-width="oppositeDockWidth"
      @width-change="emit('width-change', $event)"
      @aside-resize-start="emit('aside-resize-start', $event)"
      @aside-resize="emit('aside-resize', $event)"
      @aside-resize-end="emit('aside-resize-end', $event)"
    />
    <div class="tr-layout__aside-mask">
      <div class="tr-layout__aside-body">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style lang="less" scoped>
.tr-layout__aside {
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: visible;

  &--left {
    --tr-layout-aside-expanded-width: var(--left-dock-width);
    --tr-layout-aside-collapsed-width: var(--left-collapsed-width);
    --tr-layout-aside-rail-overlay-transform: translateX(0);
    --tr-layout-aside-rail-slide-transform: translateX(
      calc(var(--tr-layout-aside-collapsed-width) - var(--tr-layout-aside-expanded-width))
    );
    --tr-layout-aside-hidden-transform: translateX(calc(-100% - var(--hidden-offset, 12px)));

    grid-area: left;
    background: var(--tr-layout-left-aside-bg);
    border-inline-end: 1px solid var(--tr-layout-divider-color);
  }

  &--right {
    --tr-layout-aside-expanded-width: var(--right-dock-width);
    --tr-layout-aside-collapsed-width: var(--right-collapsed-width);
    --tr-layout-aside-rail-overlay-transform: translateX(
      calc(var(--tr-layout-aside-collapsed-width) - var(--tr-layout-aside-expanded-width))
    );
    --tr-layout-aside-rail-slide-transform: translateX(0);
    --tr-layout-aside-hidden-transform: translateX(calc(100% + var(--hidden-offset, 12px)));

    grid-area: right;
    background: var(--tr-layout-right-aside-bg);
    border-inline-start: 1px solid var(--tr-layout-divider-color);
  }

  &--hidden {
    border-color: transparent;
  }

  &--dock {
    position: relative;
    z-index: 1;

    &.tr-layout__aside--rail {
      overflow: visible;
    }
  }

  &--drawer {
    position: absolute;
    grid-area: auto;
    top: 0;
    bottom: 0;
    z-index: var(--overlay-z-index);
    width: var(--tr-layout-drawer-width, var(--tr-layout-aside-expanded-width));
    max-width: 100%;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
    box-shadow: var(--tr-layout-panel-shadow);
    will-change: transform;
    transition:
      transform var(--transition-duration) var(--transition-easing),
      visibility var(--transition-duration) var(--transition-easing);

    &.tr-layout__aside--left {
      left: 0;
      transform: translateX(-100%);
    }

    &.tr-layout__aside--right {
      right: 0;
      transform: translateX(100%);
    }

    &.tr-layout__aside--expanded {
      visibility: visible;
      pointer-events: auto;
      transform: translateX(0);
    }
  }
}

.tr-layout__aside-mask {
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tr-layout__aside-body {
  min-width: 0;
  min-height: 0;
  width: var(--tr-layout-aside-expanded-width);
  height: 100%;
  transition: var(--tr-layout-aside-body-transition);
  will-change: width, transform;
}

.tr-layout__aside--drawer .tr-layout__aside-body {
  width: var(--tr-layout-drawer-width, var(--tr-layout-aside-expanded-width));
}

.tr-layout__aside--dock .tr-layout__aside-body {
  transform: translateX(0);
}

.tr-layout__aside--dock.tr-layout__aside--rail.tr-layout__aside--effect-overlay .tr-layout__aside-body {
  transform: var(--tr-layout-aside-rail-overlay-transform);
}

.tr-layout__aside--dock.tr-layout__aside--rail.tr-layout__aside--effect-slide .tr-layout__aside-body {
  transform: var(--tr-layout-aside-rail-slide-transform);
}

.tr-layout__aside--dock.tr-layout__aside--hidden .tr-layout__aside-body {
  transform: var(--tr-layout-aside-hidden-transform);
}
</style>
