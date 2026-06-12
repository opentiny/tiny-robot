<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, type ComponentPublicInstance, type Ref } from 'vue'
import AsideContent from './components/AsideContent.vue'
import FloatingResizeTrigger from './components/FloatingResizeTrigger.vue'
import { createLayoutContext } from './composables/createLayoutContext'
import { useLayoutAsideInteractions } from './composables/useLayoutAsideInteractions'
import { provideLayoutContext } from './composables/useLayoutContext'
import { useLayoutFloatingSurface } from './composables/useLayoutFloatingSurface'
import { useLayoutRenderState } from './composables/useLayoutRenderState'
import { useLayoutRootState } from './composables/useLayoutRootState'
import type { LayoutEmits, LayoutProps } from './index.type'

defineOptions({
  name: 'Layout',
  inheritAttrs: false,
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const attrs = useAttrs()

const {
  resolvedMode,
  resolvedFloatingState,
  resolvedFloating,
  commitFloatingState,
  initializeFloatingState,
  leftAside,
  rightAside,
} = useLayoutRootState(props, emit)

const frameRef = ref<HTMLElement | null>(null)
const layoutRootRef = ref<HTMLElement | null>(null)
const frameDragHandleRef = ref<HTMLElement | null>(null)
const leftAsideRef = ref<HTMLElement | null>(null)
const rightAsideRef = ref<HTMLElement | null>(null)

function assignElementRef(target: Ref<HTMLElement | null>) {
  return (element: Element | ComponentPublicInstance | null) => {
    target.value = element instanceof HTMLElement ? element : null
  }
}

const leftAsideVNodeRef = assignElementRef(leftAsideRef)
const rightAsideVNodeRef = assignElementRef(rightAsideRef)

const layoutContext = createLayoutContext(leftAside, rightAside)

provideLayoutContext(layoutContext)

const slots = useSlots()
const { closeDrawers, left, right } = layoutContext
const isDrawerVisible = computed(() => layoutContext.isDrawerVisible)

const {
  isResizing: isAsideResizing,
  draggingPlacement,
  leftHandleProps,
  rightHandleProps,
} = useLayoutAsideInteractions({
  rootRef: layoutRootRef,
  leftAsideRef,
  rightAsideRef,
  left,
  right,
  isDrawerVisible,
  closeDrawers,
  onResizeStart: (detail) => emit('aside-resize-start', detail),
  onResize: (detail) => emit('aside-resize', detail),
  onResizeEnd: (detail) => emit('aside-resize-end', detail),
})

const {
  hasHeader,
  hasFooter,
  hasLeftAside,
  hasRightAside,
  leftAsideSlotProps,
  rightAsideSlotProps,
  layoutStyle,
  layoutClass,
} = useLayoutRenderState({
  slots,
  left,
  right,
  isResizing: isAsideResizing,
})

const { isFloating, showDragBar, frameClass, frameStyle, dragBarClass, resizeHandles } = useLayoutFloatingSurface({
  mode: resolvedMode,
  floatingState: resolvedFloatingState,
  floating: resolvedFloating,
  commitFloatingState,
  initializeFloatingState,
  frameRef,
  dragHandleRef: frameDragHandleRef,
  onFloatingDragStart: (detail) => emit('floating-drag-start', detail),
  onFloatingDrag: (detail) => emit('floating-drag', detail),
  onFloatingDragEnd: (detail) => emit('floating-drag-end', detail),
  onFloatingResizeStart: (detail) => emit('floating-resize-start', detail),
  onFloatingResize: (detail) => emit('floating-resize', detail),
  onFloatingResizeEnd: (detail) => emit('floating-resize-end', detail),
})
</script>

<template>
  <Teleport to="body" :disabled="!isFloating">
    <div v-bind="attrs" ref="frameRef" class="tr-layout-frame" :class="frameClass" :style="frameStyle">
      <div v-if="showDragBar" ref="frameDragHandleRef" class="tr-layout-frame__drag-bar" :class="dragBarClass" />

      <FloatingResizeTrigger
        v-for="resizeHandle in resizeHandles"
        :key="resizeHandle.handle"
        :handle="resizeHandle.handle"
        :active="resizeHandle.active"
        @pointerdown="resizeHandle.onPointerdown"
      />

      <div
        ref="layoutRootRef"
        class="tr-layout"
        :class="[layoutClass, { 'tr-layout--floating': isFloating }]"
        :style="layoutStyle"
      >
        <AsideContent
          v-if="hasLeftAside"
          :panel="left"
          :aside-ref="leftAsideVNodeRef"
          :dragging-placement="draggingPlacement"
          @resize-pointerdown="leftHandleProps.onPointerdown"
        >
          <slot name="left-aside" v-bind="leftAsideSlotProps" />
        </AsideContent>

        <header v-if="hasHeader" class="tr-layout__header-shell">
          <div class="tr-layout__header-inner">
            <slot name="header" />
          </div>
        </header>

        <main class="tr-layout__main-shell">
          <div class="tr-layout__main-inner">
            <slot name="main" />
          </div>
        </main>

        <footer v-if="hasFooter" class="tr-layout__footer-shell">
          <div class="tr-layout__footer-inner">
            <slot name="footer" />
          </div>
        </footer>

        <AsideContent
          v-if="hasRightAside"
          :panel="right"
          :aside-ref="rightAsideVNodeRef"
          :dragging-placement="draggingPlacement"
          @resize-pointerdown="rightHandleProps.onPointerdown"
        >
          <slot name="right-aside" v-bind="rightAsideSlotProps" />
        </AsideContent>

        <div v-if="isDrawerVisible" class="tr-layout__backdrop" aria-hidden="true" @pointerdown="closeDrawers" />
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
.tr-layout-frame {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  overflow: hidden;
  background: var(--tr-layout-bg);
  color: var(--tr-text-primary);

  > .tr-layout {
    height: 100%;
  }

  &--floating {
    position: fixed;
    overflow: visible;
    border: 1px solid var(--border-color);
    border-radius: var(--tr-layout-frame-radius);
    box-shadow: var(--tr-layout-frame-shadow);
    z-index: var(--tr-layout-frame-z-index);
    outline: 1px solid var(--outline-color);
    outline-offset: -1px;

    > .tr-layout {
      border-radius: inherit;
      padding-top: calc(var(--drag-hit-height) + var(--drag-bar-top));
    }
  }

  &--floating-dragging {
    :deep(.tr-layout-frame__resize-trigger) {
      pointer-events: none;
    }
  }

  &--floating-resizing {
    &,
    * {
      user-select: none;
    }

    .tr-layout-frame__drag-bar--draggable {
      cursor: default;
      pointer-events: none;
    }
  }

  &__drag-bar {
    position: absolute;
    top: var(--drag-bar-top);
    left: 50%;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--drag-hit-width);
    height: var(--drag-hit-height);
    transform: translateX(-50%);
    touch-action: none;
    user-select: none;

    &::before {
      content: '';
      position: absolute;
      inset: 1px 3px;
      border: 1px solid transparent;
      border-radius: 999px;
      transition:
        background-color 180ms ease,
        border-color 180ms ease,
        box-shadow 180ms ease;
    }

    &::after {
      content: '';
      width: var(--drag-pill-width);
      height: var(--drag-pill-height);
      border-radius: 999px;
      background: var(--drag-pill-bg);
      box-shadow: var(--drag-pill-shadow);
    }

    &--draggable {
      cursor: grab;

      &:hover::before {
        background: var(--drag-hover-bg);
        border-color: var(--drag-hover-border);
        box-shadow: var(--drag-hover-shadow);
      }
    }
  }

  &--floating-dragging &__drag-bar--draggable {
    cursor: grabbing;
  }
}

.tr-layout {
  --left-width: 0px;
  --right-width: 0px;
  --left-collapsed-width: 0px;
  --right-collapsed-width: 0px;
  --tr-layout-aside-body-transition:
    width var(--transition-duration) var(--transition-easing),
    transform var(--transition-duration) var(--transition-easing);

  position: relative;
  display: grid;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  grid-template-columns:
    var(--left-width)
    minmax(var(--tr-layout-main-min-width, 320px), 1fr)
    var(--right-width);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'left header right'
    'left main right'
    'left footer right';
  isolation: isolate;
  overflow: hidden;
  background: var(--tr-layout-bg);
  color: var(--tr-text-primary);
  transition: grid-template-columns var(--transition-duration) var(--transition-easing);

  &--resizing {
    --tr-layout-aside-body-transition: none;

    cursor: col-resize;
    transition: none;

    &,
    * {
      user-select: none;
    }
  }

  &--left-dock&--left-expanded {
    --left-width: var(--left-dock-width);
  }

  &--left-dock&--left-rail {
    --left-width: var(--left-collapsed-width);
  }

  &--right-dock&--right-expanded {
    --right-width: var(--right-dock-width);
  }

  &--right-dock&--right-rail {
    --right-width: var(--right-collapsed-width);
  }

  &__header-shell,
  &__main-shell,
  &__footer-shell {
    min-width: 0;
    min-height: 0;
  }

  &__header-shell {
    grid-area: header;
    background: var(--tr-layout-header-bg);
  }

  &__main-shell {
    grid-area: main;
    overflow: hidden;
    background: var(--tr-layout-main-bg);
  }

  &__footer-shell {
    grid-area: footer;
    background: var(--tr-layout-footer-bg);
  }

  &__header-inner,
  &__main-inner,
  &__footer-inner {
    box-sizing: border-box;
    max-width: var(--tr-layout-content-max-width, 960px);
    margin-inline: auto;
    padding-inline: var(--tr-layout-inner-padding-inline);
  }

  &__header-inner {
    padding-top: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-top));
    padding-bottom: var(--tr-layout-inner-padding-block);
  }

  &__main-inner {
    height: 100%;
    min-height: 100%;
  }

  &__footer-inner {
    padding-top: var(--tr-layout-inner-padding-block);
    padding-bottom: max(var(--tr-layout-inner-padding-block), env(safe-area-inset-bottom));
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    z-index: calc(var(--overlay-z-index) - 1);
    background: var(--tr-layout-overlay-bg);
    cursor: pointer;
  }
}
</style>
