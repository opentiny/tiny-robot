<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import AsideResizeTrigger from './AsideResizeTrigger.vue'
import { useLayoutContext } from '../composables/useLayoutContext'
import { useLayoutAsideResize } from '../composables/useLayoutAsideResize'
import type { LayoutAsideResizeEventDetail, LayoutPlacement } from '../index.type'

defineOptions({
  name: 'LayoutAsideContent',
})

interface LayoutAsideContentProps {
  placement: LayoutPlacement
}

const props = defineProps<LayoutAsideContentProps>()

const emit = defineEmits<{
  (event: 'aside-resize-start', value: LayoutAsideResizeEventDetail): void
  (event: 'aside-resize', value: LayoutAsideResizeEventDetail): void
  (event: 'aside-resize-end', value: LayoutAsideResizeEventDetail): void
}>()

const layout = useLayoutContext()
const panel = computed(() => (props.placement === 'left' ? layout.left : layout.right))

const asideClass = computed(() => [
  `tr-layout__aside--${panel.value.state.placement}`,
  `tr-layout__aside--effect-${panel.value.state.collapseEffect.value}`,
  {
    'tr-layout__aside--dock': panel.value.state.isDock.value,
    'tr-layout__aside--drawer': panel.value.state.isDrawer.value,
    'tr-layout__aside--expanded': panel.value.state.isOpen.value,
    'tr-layout__aside--rail': panel.value.state.isRail.value,
    'tr-layout__aside--hidden': panel.value.state.isHidden.value,
  },
])

function setAsideElement(element: Element | ComponentPublicInstance | null): void {
  panel.value.el.value = element instanceof HTMLElement ? element : null
}

const { draggingPlacement, startResize } = useLayoutAsideResize({
  context: layout,
  panel: panel.value,
  onResizeStart: (detail) => emit('aside-resize-start', detail),
  onResize: (detail) => emit('aside-resize', detail),
  onResizeEnd: (detail) => emit('aside-resize-end', detail),
})
</script>

<template>
  <aside
    :ref="setAsideElement"
    class="tr-layout__aside"
    :class="asideClass"
    :inert="panel.state.isHidden.value || undefined"
  >
    <AsideResizeTrigger
      v-if="panel.state.canResize.value"
      :placement="props.placement"
      :dragging-placement="draggingPlacement"
      @pointerdown="startResize"
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
