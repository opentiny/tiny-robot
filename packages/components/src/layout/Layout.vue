<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import { ref, useAttrs } from 'vue'
import AsideContent from './components/AsideContent.vue'
import FloatingResizeTrigger from './components/FloatingResizeTrigger.vue'
import { createLayoutContext, provideLayoutContext } from './composables/useLayoutContext'
import { useLayoutFloating } from './composables/useLayoutFloating'
import { useLayoutRenderState } from './composables/useLayoutRenderState'
import { useLayoutRootState } from './composables/useLayoutRootState'
import type { LayoutAsideResizeEventDetail, LayoutEmits, LayoutProps } from './index.type'
import { emitAsideResizeEvent } from './utils/emitAsideEvents'

defineOptions({
  name: 'Layout',
  inheritAttrs: false,
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const attrs = useAttrs()

const { leftPanel, rightPanel, floating } = useLayoutRootState(props, emit)

const layoutRootRef = ref<HTMLElement | null>(null)
const dragBarRef = ref<HTMLElement | null>(null)
const layoutContext = createLayoutContext({
  rootEl: layoutRootRef,
  dragHandleEl: dragBarRef,
  left: leftPanel,
  right: rightPanel,
  floating,
})

provideLayoutContext(layoutContext)

const isAsideResizing = ref(false)

function onAsideResizeStart(detail: LayoutAsideResizeEventDetail): void {
  isAsideResizing.value = true
  emitAsideResizeEvent(emit, 'start', detail)
}

function onAsideResize(detail: LayoutAsideResizeEventDetail): void {
  emitAsideResizeEvent(emit, 'progress', detail)
}

function onAsideResizeEnd(detail: LayoutAsideResizeEventDetail): void {
  isAsideResizing.value = false
  emitAsideResizeEvent(emit, 'end', detail)
}

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
  context: layoutContext,
  isResizing: isAsideResizing,
})

const { isFloating, showDragBar, floatingClass, floatingStyle, dragBarClass, resizeHandles } = useLayoutFloating({
  context: layoutContext,
  onFloatingDragStart: (detail) => emit('floating-drag-start', detail),
  onFloatingDrag: (detail) => emit('floating-drag', detail),
  onFloatingDragEnd: (detail) => emit('floating-drag-end', detail),
  onFloatingResizeStart: (detail) => emit('floating-resize-start', detail),
  onFloatingResize: (detail) => emit('floating-resize', detail),
  onFloatingResizeEnd: (detail) => emit('floating-resize-end', detail),
})

onKeyDown('Escape', (event) => {
  if (event.defaultPrevented || !layoutContext.ui.isDrawerVisible.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  layoutContext.actions.closeDrawers()
})
</script>

<template>
  <Teleport to="body" :disabled="!isFloating">
    <div
      v-bind="attrs"
      ref="layoutRootRef"
      class="tr-layout"
      :class="[layoutClass, floatingClass]"
      :style="[layoutStyle, floatingStyle]"
    >
      <div v-if="showDragBar" ref="dragBarRef" class="tr-layout__drag-bar" :class="dragBarClass" />

      <div class="tr-layout__body">
        <AsideContent
          v-if="hasLeftAside"
          placement="left"
          @aside-resize-start="onAsideResizeStart"
          @aside-resize="onAsideResize"
          @aside-resize-end="onAsideResizeEnd"
        >
          <slot name="left-aside" v-bind="leftAsideSlotProps" />
        </AsideContent>

        <header v-if="hasHeader" class="tr-layout__header">
          <slot name="header" />
        </header>

        <main class="tr-layout__main">
          <slot name="main" />
        </main>

        <footer v-if="hasFooter" class="tr-layout__footer">
          <slot name="footer" />
        </footer>

        <AsideContent
          v-if="hasRightAside"
          placement="right"
          @aside-resize-start="onAsideResizeStart"
          @aside-resize="onAsideResize"
          @aside-resize-end="onAsideResizeEnd"
        >
          <slot name="right-aside" v-bind="rightAsideSlotProps" />
        </AsideContent>

        <div
          v-if="layoutContext.ui.isDrawerVisible.value"
          class="tr-layout__backdrop"
          aria-hidden="true"
          @pointerdown="layoutContext.actions.closeDrawers"
        />
      </div>

      <FloatingResizeTrigger
        v-for="resizeHandle in resizeHandles"
        :key="resizeHandle.handle"
        :handle="resizeHandle.handle"
        :active="resizeHandle.active"
        @pointerdown="resizeHandle.onPointerdown"
      />
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
.tr-layout {
  --left-width: 0px;
  --right-width: 0px;
  --left-collapsed-width: 0px;
  --right-collapsed-width: 0px;
  --tr-layout-aside-body-transition:
    width var(--transition-duration) var(--transition-easing),
    transform var(--transition-duration) var(--transition-easing);

  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  height: var(--tr-layout-height, 100vh);
  height: var(--tr-layout-height, 100dvh);
  isolation: isolate;
  overflow: visible;
  color: var(--tr-text-primary);

  &--floating {
    position: fixed;
    overflow: visible;
    border-radius: var(--tr-layout-floating-radius);
    box-shadow: var(--tr-layout-floating-shadow);
    z-index: var(--tr-layout-floating-z-index);
    outline: 1px solid var(--outline-color);
    outline-offset: -1px;
  }

  &--floating-dragging {
    :deep(.tr-layout__floating-resize-trigger) {
      pointer-events: none;
    }
  }

  &--floating-resizing {
    &,
    * {
      user-select: none;
    }

    .tr-layout__drag-bar--draggable {
      cursor: default;
      pointer-events: none;
    }
  }

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

  &__body,
  &__drag-bar,
  &__header,
  &__main,
  &__footer {
    min-width: 0;
    min-height: 0;
  }

  &__body {
    position: relative;
    display: grid;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    grid-template-columns:
      var(--left-width)
      minmax(var(--tr-layout-main-min-width, 320px), 1fr)
      var(--right-width);
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'left header right'
      'left main right'
      'left footer right';
    overflow: hidden;
    background: var(--tr-layout-bg);
    border-radius: inherit;
    transition: grid-template-columns var(--transition-duration) var(--transition-easing);
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
    touch-action: none;
    transform: translateX(-50%);
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

  &__header {
    grid-area: header;
    background: var(--tr-layout-header-bg);
  }

  &__main {
    grid-area: main;
    position: relative;
    overflow: hidden;
    background: var(--tr-layout-main-bg);
  }

  &__footer {
    grid-area: footer;
    background: var(--tr-layout-footer-bg);
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
