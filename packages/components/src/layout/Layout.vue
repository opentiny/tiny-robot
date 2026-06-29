<script setup lang="ts">
import { computed, ref } from 'vue'
import AsideContent from './components/AsideContent.vue'
import LayoutSurface from './components/LayoutSurface.vue'
import { provideLayoutContext } from './composables/useLayoutContext'
import { useLayoutAsideStates } from './composables/useLayoutAsideStates'
import type {
  LayoutAsideOpenDetail,
  LayoutAsideResizeDetail,
  LayoutEmits,
  LayoutProps,
  LayoutSlots,
  LayoutFloatingState,
} from './index.type'
import type { LayoutAsideState } from './internal.type'
import { emitAsideOpenChangeEvents, emitAsideResizeEvents } from './utils/asideEventEmitters'
import { toPx } from './utils/cssLength'
import { hasNonEmptySlotContent } from './utils/slots'
import { useControllableState } from '../shared/composables'
import { DEFAULT_FLOATING_HEIGHT, DEFAULT_FLOATING_OFFSET, DEFAULT_FLOATING_WIDTH } from './utils/surfaceGeometry'

defineOptions({
  name: 'Layout',
})

const props = defineProps<LayoutProps>()
const emit = defineEmits<LayoutEmits>()
const slots = defineSlots<LayoutSlots>()

const surfaceRef = ref<{ rootEl: HTMLElement | null } | null>(null)
const rootEl = computed<HTMLElement | null>(() => surfaceRef.value?.rootEl ?? null)
const hasLeftAside = computed(() => hasNonEmptySlotContent(slots['left-aside']))
const hasHeader = computed(() => hasNonEmptySlotContent(slots.header))
const hasFooter = computed(() => hasNonEmptySlotContent(slots.footer))
const hasRightAside = computed(() => hasNonEmptySlotContent(slots['right-aside']))

function onAsideOpenChange(detail: LayoutAsideOpenDetail): void {
  emitAsideOpenChangeEvents(emit, detail)
}

function onAsideExpandedWidthChange(detail: LayoutAsideResizeDetail): void {
  emitAsideResizeEvents(emit, 'resize', detail)
}

const { leftAsideState: leftPanel, rightAsideState: rightPanel } = useLayoutAsideStates({
  leftConfig: () => props.leftAside,
  rightConfig: () => props.rightAside,
  onOpenChange: onAsideOpenChange,
  onExpandedWidthChange: onAsideExpandedWidthChange,
})

function setDrawerOpen(
  panel: LayoutAsideState,
  sibling: LayoutAsideState,
  nextOpen: boolean,
  siblingPresent: boolean,
): void {
  if (nextOpen && panel.isDrawer.value && sibling.isDrawer.value && sibling.isOpen.value && siblingPresent) {
    sibling.setOpen(false)
  }

  panel.setOpen(nextOpen)
}

function toggleDrawer(panel: LayoutAsideState, sibling: LayoutAsideState, siblingPresent: boolean): void {
  setDrawerOpen(panel, sibling, !panel.isOpen.value, siblingPresent)
}

function toggleLeftDrawer(): void {
  toggleDrawer(leftPanel, rightPanel, hasRightAside.value)
}

function toggleRightDrawer(): void {
  toggleDrawer(rightPanel, leftPanel, hasLeftAside.value)
}

const isLeftDrawerVisible = computed(() => hasLeftAside.value && leftPanel.isDrawer.value && leftPanel.isOpen.value)

const isRightDrawerVisible = computed(() => hasRightAside.value && rightPanel.isDrawer.value && rightPanel.isOpen.value)

const isDrawerVisible = computed(() => isLeftDrawerVisible.value || isRightDrawerVisible.value)

function closeDrawers(): void {
  if (isLeftDrawerVisible.value) {
    leftPanel.setOpen(false)
  }

  if (isRightDrawerVisible.value) {
    rightPanel.setOpen(false)
  }
}

provideLayoutContext({
  rootEl,
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
  emitAsideResizeEvents(emit, 'start', detail)
}

function onAsideResizeEnd(detail: LayoutAsideResizeDetail): void {
  isAsideResizing.value = false
  emitAsideResizeEvents(emit, 'end', detail)
}

function setLeftAsideWidth(width: number): void {
  leftPanel.setExpandedWidth(width)
}

function setRightAsideWidth(width: number): void {
  rightPanel.setExpandedWidth(width)
}

function getDockedAsideWidth(panel: LayoutAsideState, present: boolean): number {
  if (!present || !panel.isDock.value || panel.isHidden.value) {
    return 0
  }

  return panel.isRail.value ? panel.collapsedWidth.value : panel.expandedWidth.value
}

const DEFAULT_FLOATING_STATE: LayoutFloatingState = {
  placement: 'center',
  offsetX: DEFAULT_FLOATING_OFFSET,
  offsetY: DEFAULT_FLOATING_OFFSET,
  width: DEFAULT_FLOATING_WIDTH,
  height: DEFAULT_FLOATING_HEIGHT,
}

const floatingState = useControllableState<LayoutFloatingState>({
  value: () => props.floatingState,
  defaultValue: () => props.defaultFloatingState ?? DEFAULT_FLOATING_STATE,
  onChange: (nextState) => emit('update:floatingState', nextState),
})

const leftDockWidth = computed(() => getDockedAsideWidth(leftPanel, hasLeftAside.value))
const rightDockWidth = computed(() => getDockedAsideWidth(rightPanel, hasRightAside.value))

const surfaceClass = computed(() => ({
  'tr-layout--left-dock': hasLeftAside.value && leftPanel.isDock.value,
  'tr-layout--left-drawer': hasLeftAside.value && leftPanel.isDrawer.value,
  'tr-layout--left-expanded': hasLeftAside.value && leftPanel.isOpen.value,
  'tr-layout--left-rail': hasLeftAside.value && leftPanel.isRail.value,
  'tr-layout--right-dock': hasRightAside.value && rightPanel.isDock.value,
  'tr-layout--right-drawer': hasRightAside.value && rightPanel.isDrawer.value,
  'tr-layout--right-expanded': hasRightAside.value && rightPanel.isOpen.value,
  'tr-layout--right-rail': hasRightAside.value && rightPanel.isRail.value,
  'tr-layout--resizing': isAsideResizing.value,
}))

const surfaceStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  const leftDockWidthPx = toPx(leftPanel.expandedWidth.value)
  const leftCollapsedWidth = toPx(leftPanel.collapsedWidth.value)
  const rightDockWidthPx = toPx(rightPanel.expandedWidth.value)
  const rightCollapsedWidth = toPx(rightPanel.collapsedWidth.value)

  if (leftDockWidthPx) {
    style['--left-dock-width'] = leftDockWidthPx
  }

  if (leftCollapsedWidth) {
    style['--left-collapsed-width'] = leftCollapsedWidth
  }

  if (rightDockWidthPx) {
    style['--right-dock-width'] = rightDockWidthPx
  }

  if (rightCollapsedWidth) {
    style['--right-collapsed-width'] = rightCollapsedWidth
  }

  return style
})
</script>

<template>
  <LayoutSurface
    ref="surfaceRef"
    :mode="mode"
    :class="surfaceClass"
    :style="surfaceStyle"
    :floating-options="floatingOptions"
    v-model:floating-state="floatingState"
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
        :panel="leftPanel"
        :opposite-dock-width="rightDockWidth"
        @width-change="setLeftAsideWidth"
        @aside-resize-start="onAsideResizeStart"
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
        :panel="rightPanel"
        :opposite-dock-width="leftDockWidth"
        @width-change="setRightAsideWidth"
        @aside-resize-start="onAsideResizeStart"
        @aside-resize-end="onAsideResizeEnd"
      >
        <slot name="right-aside" />
      </AsideContent>

      <div v-if="isDrawerVisible" class="tr-layout__backdrop" aria-hidden="true" @pointerdown="closeDrawers" />
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
}
</style>
