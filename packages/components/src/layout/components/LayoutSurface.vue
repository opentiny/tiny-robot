<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { computed, ref, shallowRef, useAttrs, watch, type CSSProperties } from 'vue'
import type {
  LayoutFloatingDragDetail,
  LayoutFloatingOptions,
  LayoutFloatingResizeDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
  LayoutMode,
} from '../index.type'
import type { LayoutFloatingDragPosition, LayoutFloatingRect, LayoutResolvedFloating } from '../internal.type'
import {
  areFloatingGeometryEqual,
  clampFloatingRect,
  clampFloatingRectByHandle,
  DEFAULT_FLOATING_GAP,
  DEFAULT_FLOATING_HEIGHT,
  DEFAULT_FLOATING_WIDTH,
  resolveFloatingConstraints,
  resolveViewportBounds,
  resolveFloatingRect,
  resolveFloatingStateFromRect,
} from '../utils/surfaceGeometry'
import { resolveFloatingResizeRect } from '../utils/surfaceResize'
import FloatingDragBar from './FloatingDragBar.vue'
import FloatingResizeTriggers from './FloatingResizeTriggers.vue'

const FLOATING_RESIZE_HANDLES: LayoutFloatingResizeHandle[] = ['s', 'e', 'w', 'ne', 'nw', 'se', 'sw']

defineOptions({
  name: 'LayoutSurface',
  inheritAttrs: false,
})

interface LayoutSurfaceProps {
  mode: LayoutMode
  floatingState?: LayoutFloatingState
  floatingOptions?: LayoutFloatingOptions
}

const props = defineProps<LayoutSurfaceProps>()

const emit = defineEmits<{
  'update:floatingState': [value: LayoutFloatingState]
  'floating-drag-start': [detail: LayoutFloatingDragDetail]
  'floating-drag': [detail: LayoutFloatingDragDetail]
  'floating-drag-end': [detail: LayoutFloatingDragDetail]
  'floating-resize-start': [detail: LayoutFloatingResizeDetail]
  'floating-resize': [detail: LayoutFloatingResizeDetail]
  'floating-resize-end': [detail: LayoutFloatingResizeDetail]
}>()

const attrs = useAttrs()
const rootEl = ref<HTMLElement | null>(null)

const { width: viewportWidth, height: viewportHeight } = useWindowSize({
  type: 'visual',
  initialWidth: DEFAULT_FLOATING_WIDTH + DEFAULT_FLOATING_GAP * 2,
  initialHeight: DEFAULT_FLOATING_HEIGHT + DEFAULT_FLOATING_GAP * 2,
})
const floatingBounds = computed(() => resolveViewportBounds(viewportWidth.value, viewportHeight.value))

const isFloating = computed(() => props.mode === 'floating')
const resolvedFloating = computed<LayoutResolvedFloating | undefined>(() => {
  if (!isFloating.value || !props.floatingState) {
    return undefined
  }

  return {
    ...props.floatingOptions,
    ...props.floatingState,
  }
})
const floatingConstraints = computed(() => resolveFloatingConstraints(floatingBounds.value, resolvedFloating.value))
const floatingRect = computed(() => resolveFloatingRect(resolvedFloating.value, floatingBounds.value))
const isFloatingDraggable = computed(() => resolvedFloating.value?.draggable ?? true)
const isFloatingResizable = computed(() => resolvedFloating.value?.resizable === true)
const activeDragRect = shallowRef<LayoutFloatingRect | null>(null)
const activeResizeRect = shallowRef<LayoutFloatingRect | null>(null)
const isFloatingDragging = computed(() => activeDragRect.value !== null)
const isFloatingResizing = computed(() => activeResizeRect.value !== null)
const isFloatingInteracting = computed(() => isFloatingDragging.value || isFloatingResizing.value)
const canDragFloating = computed(() => isFloating.value && isFloatingDraggable.value && !isFloatingResizing.value)
const shouldShowFloatingDragBar = computed(() => isFloating.value && isFloatingDraggable.value)
const resizeHandles = computed<LayoutFloatingResizeHandle[]>(() => {
  if (!isFloating.value || !isFloatingResizable.value) {
    return []
  }

  return FLOATING_RESIZE_HANDLES
})

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

/**
 * 从 rect 反推出对外提交的 floatingState。
 * @param rect 矩形位置。
 * @returns 解析后的浮动状态。
 */
function createFloatingState(rect: LayoutFloatingRect): LayoutFloatingState {
  return resolveFloatingStateFromRect(rect, floatingBounds.value, resolvedFloating.value)
}

/**
 * 规范化 rect 并同步状态。
 * @param nextRect 下一个矩形位置。
 * @returns 更新后的矩形位置。
 */
function updateFloatingRect(nextRect: LayoutFloatingRect): LayoutFloatingRect {
  const normalizedRect = clampFloatingRect(nextRect, floatingBounds.value, floatingConstraints.value)

  if (areFloatingGeometryEqual(floatingRect.value, normalizedRect)) {
    return normalizedRect
  }

  emit('update:floatingState', createFloatingState(normalizedRect))

  return normalizedRect
}

/**
 * 只更新位置，尺寸继续沿用当前 rect。
 * @param position 当前拖拽位置。
 * @param sourceRect 拖拽前的 rect。
 * @returns 更新后的 rect。
 */
function updateFloatingDragRect(
  position: LayoutFloatingDragPosition,
  sourceRect: LayoutFloatingRect,
): LayoutFloatingRect {
  return updateFloatingRect({
    ...sourceRect,
    x: position.x,
    y: position.y,
  })
}

/**
 * 先计算 resize 结果，再做边界裁剪，最后统一提交。
 * @param handle 当前 resize 方向。
 * @param deltaX 水平位移。
 * @param deltaY 垂直位移。
 * @param sourceRect resize 起始 rect。
 * @returns 更新后的 rect。
 */
function updateFloatingResizeRect(
  handle: LayoutFloatingResizeHandle,
  deltaX: number,
  deltaY: number,
  sourceRect: LayoutFloatingRect,
): LayoutFloatingRect {
  const resizedRect = resolveFloatingResizeRect({
    handle,
    deltaX,
    deltaY,
    startRect: sourceRect,
  })
  const clampedRect = clampFloatingRectByHandle(resizedRect, handle, floatingBounds.value, floatingConstraints.value)

  return updateFloatingRect(clampedRect)
}

function startFloatingDrag(): void {
  activeDragRect.value = floatingRect.value
  emit('floating-drag-start', createFloatingState(activeDragRect.value))
}

function moveFloatingDrag(position: LayoutFloatingDragPosition): void {
  const sourceRect = activeDragRect.value ?? floatingRect.value
  const nextRect = updateFloatingDragRect(position, sourceRect)

  emit('floating-drag', createFloatingState(nextRect))
}

function endFloatingDrag(position: LayoutFloatingDragPosition): void {
  const sourceRect = activeDragRect.value ?? floatingRect.value
  const nextRect = updateFloatingDragRect(position, sourceRect)

  emit('floating-drag-end', createFloatingState(nextRect))
  activeDragRect.value = null
}

function startFloatingResize(handle: LayoutFloatingResizeHandle): void {
  activeResizeRect.value = floatingRect.value
  emit('floating-resize-start', {
    ...createFloatingState(floatingRect.value),
    handle,
  })
}

function moveFloatingResize(handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void {
  const sourceRect = activeResizeRect.value ?? floatingRect.value
  const nextRect = updateFloatingResizeRect(handle, deltaX, deltaY, sourceRect)

  emit('floating-resize', {
    ...createFloatingState(nextRect),
    handle,
  })
}

function endFloatingResize(handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void {
  const sourceRect = activeResizeRect.value ?? floatingRect.value
  const nextRect = updateFloatingResizeRect(handle, deltaX, deltaY, sourceRect)

  emit('floating-resize-end', {
    ...createFloatingState(nextRect),
    handle,
  })
  activeResizeRect.value = null
}

watch(
  [resolvedFloating, viewportWidth, viewportHeight],
  () => {
    if (!isFloating.value || isFloatingInteracting.value) {
      return
    }

    updateFloatingRect(floatingRect.value)
  },
  { immediate: true },
)

defineExpose({
  rootEl,
})
</script>

<template>
  <Teleport to="body" :disabled="!isFloating">
    <div
      ref="rootEl"
      v-bind="attrs"
      class="tr-layout"
      :class="{
        'tr-layout--floating': isFloating,
        'tr-layout--no-select': isFloatingInteracting,
      }"
      :style="floatingStyle"
    >
      <FloatingDragBar
        v-if="shouldShowFloatingDragBar"
        :x="floatingRect.x"
        :y="floatingRect.y"
        :can-drag="canDragFloating"
        @drag-start="startFloatingDrag"
        @drag="moveFloatingDrag"
        @drag-end="endFloatingDrag"
      />

      <slot />

      <FloatingResizeTriggers
        :handles="resizeHandles"
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

.tr-layout--no-select,
.tr-layout--no-select * {
  user-select: none;
}
</style>
