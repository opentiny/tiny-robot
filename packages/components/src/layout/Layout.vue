<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import { computed, ref, useAttrs } from 'vue'
import AsideContent from './components/AsideContent.vue'
import LayoutSurface from './components/LayoutSurface.vue'
import { provideLayoutContext } from './composables/useLayoutContext'
import { createLayoutState } from './composables/useLayoutRootState'
import type { LayoutAsideResizeDetail, LayoutEmits, LayoutProps, LayoutSlots } from './index.type'
import type { LayoutPanel } from './internal.type'
import { toPx } from './utils/cssLength'
import { emitAsideResizeEvent } from './utils/asideEventEmitters'
import { hasNonEmptySlotContent } from './utils/slots'

defineOptions({
  name: 'Layout',
  inheritAttrs: false,
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const attrs = useAttrs()
const slots = defineSlots<LayoutSlots>()

const { leftPanel, rightPanel, floating } = createLayoutState(props, emit)

function setDrawerOpen(panel: LayoutPanel, sibling: LayoutPanel, nextOpen: boolean): void {
  if (nextOpen && panel.isDrawer.value && sibling.isDrawer.value && sibling.isOpen.value) {
    sibling.setOpen(false)
  }

  panel.setOpen(nextOpen)
}

function toggleDrawer(panel: LayoutPanel, sibling: LayoutPanel): void {
  setDrawerOpen(panel, sibling, !panel.isOpen.value)
}

function toggleLeftDrawer(): void {
  toggleDrawer(leftPanel, rightPanel)
}

function toggleRightDrawer(): void {
  toggleDrawer(rightPanel, leftPanel)
}

const hasLeftAside = computed(() => hasNonEmptySlotContent(slots['left-aside']))
const hasHeader = computed(() => hasNonEmptySlotContent(slots.header))
const hasFooter = computed(() => hasNonEmptySlotContent(slots.footer))
const hasRightAside = computed(() => hasNonEmptySlotContent(slots['right-aside']))

const isDrawerVisible = computed(
  () =>
    (hasLeftAside.value && leftPanel.isDrawer.value && leftPanel.isOpen.value) ||
    (hasRightAside.value && rightPanel.isDrawer.value && rightPanel.isOpen.value),
)

function closeDrawers(): void {
  if (leftPanel.isDrawer.value && leftPanel.isOpen.value) {
    leftPanel.setOpen(false)
  }

  if (rightPanel.isDrawer.value && rightPanel.isOpen.value) {
    rightPanel.setOpen(false)
  }
}

const drawer = {
  left: leftPanel,
  right: rightPanel,
  isDrawerVisible,
  closeDrawers,
}

provideLayoutContext({
  left: {
    isOpen: leftPanel.isOpen,
    toggle: toggleLeftDrawer,
  },
  right: {
    isOpen: rightPanel.isOpen,
    toggle: toggleRightDrawer,
  },
})

const isAsideResizing = ref(false)

function onAsideResizeStart(detail: LayoutAsideResizeDetail): void {
  isAsideResizing.value = true
  emitAsideResizeEvent(emit, 'start', detail)
}

function onAsideResize(detail: LayoutAsideResizeDetail): void {
  emitAsideResizeEvent(emit, 'progress', detail)
}

function onAsideResizeEnd(detail: LayoutAsideResizeDetail): void {
  isAsideResizing.value = false
  emitAsideResizeEvent(emit, 'end', detail)
}

function setLeftAsideWidth(width: number): void {
  drawer.left.setWidth(width)
}

function setRightAsideWidth(width: number): void {
  drawer.right.setWidth(width)
}

function getDockedAsideWidth(panel: LayoutPanel): number {
  if (!panel.isDock.value || panel.isHidden.value) {
    return 0
  }

  return panel.isRail.value ? panel.collapsedWidth.value : panel.width.value
}

const leftDockWidth = computed(() => (hasLeftAside.value ? getDockedAsideWidth(drawer.left) : 0))
const rightDockWidth = computed(() => (hasRightAside.value ? getDockedAsideWidth(drawer.right) : 0))

const layoutStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  const leftDockWidth = toPx(drawer.left.width.value)
  const leftCollapsedWidth = toPx(drawer.left.collapsedWidth.value)
  const rightDockWidth = toPx(drawer.right.width.value)
  const rightCollapsedWidth = toPx(drawer.right.collapsedWidth.value)

  if (leftDockWidth) {
    style['--left-dock-width'] = leftDockWidth
  }

  if (leftCollapsedWidth) {
    style['--left-collapsed-width'] = leftCollapsedWidth
  }

  if (rightDockWidth) {
    style['--right-dock-width'] = rightDockWidth
  }

  if (rightCollapsedWidth) {
    style['--right-collapsed-width'] = rightCollapsedWidth
  }

  return style
})

const layoutClass = computed(() => ({
  'tr-layout--left-dock': hasLeftAside.value && drawer.left.isDock.value,
  'tr-layout--left-drawer': hasLeftAside.value && drawer.left.isDrawer.value,
  'tr-layout--left-expanded': hasLeftAside.value && drawer.left.isOpen.value,
  'tr-layout--left-rail': hasLeftAside.value && drawer.left.isRail.value,
  'tr-layout--right-dock': hasRightAside.value && drawer.right.isDock.value,
  'tr-layout--right-drawer': hasRightAside.value && drawer.right.isDrawer.value,
  'tr-layout--right-expanded': hasRightAside.value && drawer.right.isOpen.value,
  'tr-layout--right-rail': hasRightAside.value && drawer.right.isRail.value,
  'tr-layout--resizing': isAsideResizing.value,
}))

const layoutMode = floating.state.mode
const floatingStateValue = floating.state.value
const floatingValue = floating.state.resolved

onKeyDown('Escape', (event) => {
  if (event.defaultPrevented || !drawer.isDrawerVisible.value) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  drawer.closeDrawers()
})
</script>

<template>
  <LayoutSurface
    v-bind="attrs"
    :mode="layoutMode"
    :floating-state="floatingStateValue"
    :resolved-floating="floatingValue"
    :surface-class="layoutClass"
    :surface-style="layoutStyle"
    @floating-state-initialize="floating.actions.initialize"
    @floating-state-change="floating.actions.commit"
    @floating-drag-start="emit('floating-drag-start', $event)"
    @floating-drag="emit('floating-drag', $event)"
    @floating-drag-end="emit('floating-drag-end', $event)"
    @floating-resize-start="emit('floating-resize-start', $event)"
    @floating-resize="emit('floating-resize', $event)"
    @floating-resize-end="emit('floating-resize-end', $event)"
  >
    <div class="tr-layout__body">
      <AsideContent
        v-if="hasLeftAside"
        side="left"
        :opposite-dock-width="rightDockWidth"
        :collapse-effect="drawer.left.collapseEffect.value"
        :is-dock="drawer.left.isDock.value"
        :is-drawer="drawer.left.isDrawer.value"
        :is-open="drawer.left.isOpen.value"
        :is-rail="drawer.left.isRail.value"
        :is-hidden="drawer.left.isHidden.value"
        :can-resize="drawer.left.canResize.value"
        :min-width="drawer.left.minWidth.value"
        :max-width="drawer.left.maxWidth.value"
        @width-change="setLeftAsideWidth"
        @aside-resize-start="onAsideResizeStart"
        @aside-resize="onAsideResize"
        @aside-resize-end="onAsideResizeEnd"
      >
        <slot name="left-aside" />
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
        side="right"
        :opposite-dock-width="leftDockWidth"
        :collapse-effect="drawer.right.collapseEffect.value"
        :is-dock="drawer.right.isDock.value"
        :is-drawer="drawer.right.isDrawer.value"
        :is-open="drawer.right.isOpen.value"
        :is-rail="drawer.right.isRail.value"
        :is-hidden="drawer.right.isHidden.value"
        :can-resize="drawer.right.canResize.value"
        :min-width="drawer.right.minWidth.value"
        :max-width="drawer.right.maxWidth.value"
        @width-change="setRightAsideWidth"
        @aside-resize-start="onAsideResizeStart"
        @aside-resize="onAsideResize"
        @aside-resize-end="onAsideResizeEnd"
      >
        <slot name="right-aside" />
      </AsideContent>

      <div
        v-if="drawer.isDrawerVisible.value"
        class="tr-layout__backdrop"
        aria-hidden="true"
        @pointerdown="drawer.closeDrawers"
      />
    </div>
  </LayoutSurface>
</template>

<style lang="less" scoped>
.tr-layout__body,
.tr-layout__header,
.tr-layout__main,
.tr-layout__footer {
  min-width: 0;
  min-height: 0;
}

.tr-layout__body {
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
  transition: var(
    --tr-layout-body-transition,
    grid-template-columns var(--transition-duration) var(--transition-easing)
  );
}

.tr-layout__header {
  grid-area: header;
  background: var(--tr-layout-header-bg);
}

.tr-layout__main {
  grid-area: main;
  position: relative;
  overflow: hidden;
  background: var(--tr-layout-main-bg);
}

.tr-layout__footer {
  grid-area: footer;
  background: var(--tr-layout-footer-bg);
}

.tr-layout__backdrop {
  position: absolute;
  inset: 0;
  z-index: calc(var(--overlay-z-index) - 1);
  background: var(--tr-layout-overlay-bg);
  cursor: pointer;
}
</style>
