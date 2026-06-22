<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { computed, shallowRef, useAttrs, watch, type CSSProperties } from 'vue'
import type {
  LayoutFloatingDragDetail,
  LayoutFloatingResizeDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
  LayoutMode,
} from '../index.type'
import type { LayoutFloatingDragPosition, LayoutFloatingRect, LayoutResolvedFloating } from '../internal.type'
import {
  areFloatingGeometryEqual,
  clampFloatingRect,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_WIDTH,
  normalizeFloatingRect,
  resolveFloatingSnapshot,
  toCommittedFloatingState,
} from '../utils/surfaceGeometry'
import FloatingDragBar from './FloatingDragBar.vue'
import FloatingResizeTriggers from './FloatingResizeTriggers.vue'

type FloatingInteraction = 'drag' | 'resize'

const FLOATING_RESIZE_HANDLES: LayoutFloatingResizeHandle[] = ['s', 'e', 'w', 'ne', 'nw', 'se', 'sw']

defineOptions({
  name: 'LayoutSurface',
  inheritAttrs: false,
})

interface LayoutSurfaceProps {
  mode: LayoutMode
  floatingState?: LayoutFloatingState
  resolvedFloating?: LayoutResolvedFloating
  surfaceClass?: Record<string, boolean>
  surfaceStyle?: Record<string, string>
}

const props = defineProps<LayoutSurfaceProps>()

const emit = defineEmits<{
  'floating-state-initialize': [value: LayoutFloatingState]
  'floating-state-change': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragDetail]
  'floating-drag': [detail: LayoutFloatingDragDetail]
  'floating-drag-end': [detail: LayoutFloatingDragDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeDetail]
  'floating-resize': [detail: LayoutFloatingResizeDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeDetail]
}>()

const attrs = useAttrs()

const { width: viewportWidth, height: viewportHeight } = useWindowSize({
  type: 'visual',
  initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
  initialHeight: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
})

const activeFloatingInteraction = shallowRef<FloatingInteraction | null>(null)

const isFloating = computed(() => props.mode === 'floating')
const floatingRect = computed(() => normalizeFloatingRect(props.resolvedFloating))
const isFloatingDraggable = computed(() => floatingRect.value.draggable ?? true)
const isFloatingResizable = computed(() => floatingRect.value.resizable === true)
const canDragFloating = computed(
  () => isFloating.value && isFloatingDraggable.value && activeFloatingInteraction.value !== 'resize',
)
const canStartFloatingResize = computed(
  () => isFloating.value && isFloatingResizable.value && activeFloatingInteraction.value === null,
)
const resizeHandles = computed<LayoutFloatingResizeHandle[]>(() => {
  if (!isFloating.value || !isFloatingResizable.value) {
    return []
  }

  return FLOATING_RESIZE_HANDLES
})
const floatingClass = computed(() => ({
  'tr-layout--floating': isFloating.value,
  'tr-layout--floating-dragging': activeFloatingInteraction.value === 'drag',
  'tr-layout--floating-resizing': activeFloatingInteraction.value === 'resize',
}))
const floatingStyle = computed<CSSProperties>(() => {
  if (!isFloating.value) {
    return {}
  }

  return {
    left: `${floatingRect.value.x}px`,
    top: `${floatingRect.value.y}px`,
    width: `${floatingRect.value.width}px`,
    height: `${floatingRect.value.height}px`,
  }
})

function toFloatingState(rect: LayoutFloatingRect, normalizeCenter = false): LayoutFloatingState {
  return toCommittedFloatingState(resolveFloatingSnapshot(rect, props.resolvedFloating), props.floatingState, {
    normalizeCenter,
  })
}

function toFloatingResizeDetail(
  handle: LayoutFloatingResizeHandle,
  rect: LayoutFloatingRect,
): LayoutFloatingResizeDetail {
  return {
    ...toFloatingState(rect, true),
    handle,
  }
}

function commitFloatingRect(nextRect: LayoutFloatingRect): LayoutFloatingRect {
  const normalizedRect = clampFloatingRect(nextRect)

  if (areFloatingGeometryEqual(floatingRect.value, normalizedRect)) {
    return normalizedRect
  }

  emit('floating-state-change', toFloatingState(normalizedRect, true))

  return normalizedRect
}

function applyFloatingDragPosition(position: LayoutFloatingDragPosition): LayoutFloatingRect {
  return commitFloatingRect({
    ...floatingRect.value,
    x: position.x,
    y: position.y,
  })
}

function startFloatingInteraction(type: FloatingInteraction): void {
  activeFloatingInteraction.value = type
}

function endFloatingInteraction(type: FloatingInteraction): void {
  if (activeFloatingInteraction.value === type) {
    activeFloatingInteraction.value = null
  }
}

function syncFloatingRect(): void {
  if (!isFloating.value || activeFloatingInteraction.value !== null) {
    return
  }

  if (!props.floatingState) {
    emit('floating-state-initialize', toFloatingState(floatingRect.value))
  }

  commitFloatingRect(floatingRect.value)
}

function startFloatingDrag(rect: LayoutFloatingRect): void {
  startFloatingInteraction('drag')
  emit('floating-drag-start', toFloatingState(rect, true))
}

function moveFloatingDrag(position: LayoutFloatingDragPosition): void {
  const nextRect = applyFloatingDragPosition(position)

  emit('floating-drag', toFloatingState(nextRect, true))
}

function endFloatingDrag(position: LayoutFloatingDragPosition): void {
  const nextRect = applyFloatingDragPosition(position)

  emit('floating-drag-end', toFloatingState(nextRect, true))
  endFloatingInteraction('drag')
}

function startFloatingResize(handle: LayoutFloatingResizeHandle, rect: LayoutFloatingRect): void {
  startFloatingInteraction('resize')
  emit('floating-resize-start', toFloatingResizeDetail(handle, rect))
}

function moveFloatingResize(handle: LayoutFloatingResizeHandle, rect: LayoutFloatingRect): void {
  const nextRect = commitFloatingRect(rect)

  emit('floating-resize', toFloatingResizeDetail(handle, nextRect))
}

function endFloatingResize(handle: LayoutFloatingResizeHandle, rect: LayoutFloatingRect): void {
  const nextRect = commitFloatingRect(rect)

  emit('floating-resize-end', toFloatingResizeDetail(handle, nextRect))
  endFloatingInteraction('resize')
}

watch(
  [() => props.mode, () => props.resolvedFloating, viewportWidth, viewportHeight],
  () => {
    syncFloatingRect()
  },
  { immediate: true },
)
</script>

<template>
  <Teleport to="body" :disabled="!isFloating">
    <div
      v-bind="attrs"
      class="tr-layout"
      :class="[props.surfaceClass, floatingClass]"
      :style="[props.surfaceStyle, floatingStyle]"
    >
      <FloatingDragBar
        v-if="isFloating"
        :floating-rect="floatingRect"
        :can-drag="canDragFloating"
        @drag-start="startFloatingDrag"
        @drag="moveFloatingDrag"
        @drag-end="endFloatingDrag"
      />

      <slot />

      <FloatingResizeTriggers
        :handles="resizeHandles"
        :floating-rect="floatingRect"
        :can-start="canStartFloatingResize"
        @resize-start="startFloatingResize"
        @resize="moveFloatingResize"
        @resize-end="endFloatingResize"
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
  --tr-layout-body-transition: grid-template-columns var(--transition-duration) var(--transition-easing);
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

  &--resizing {
    --tr-layout-body-transition: none;
    --tr-layout-aside-body-transition: none;

    cursor: col-resize;
    transition: none;
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
}

:global(.tr-layout--floating-dragging .tr-layout__floating-resize-trigger) {
  pointer-events: none;
}

:global(.tr-layout--floating-resizing),
:global(.tr-layout--floating-resizing *),
:global(.tr-layout--resizing),
:global(.tr-layout--resizing *) {
  user-select: none;
}
</style>
