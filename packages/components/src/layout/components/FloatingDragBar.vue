<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import type { LayoutFloatingDragPosition, LayoutFloatingRect } from '../internal.type'
import { getLayoutRootElement } from '../utils/layoutElements'
import { DEFAULT_FLOATING_GAP, DEFAULT_FLOATING_TOP } from '../utils/surfaceGeometry'

defineOptions({
  name: 'FloatingDragBar',
})

interface FloatingDragBarProps {
  floatingRect: LayoutFloatingRect
  canDrag: boolean
}

const props = defineProps<FloatingDragBarProps>()

const emit = defineEmits<{
  (event: 'drag-start', value: LayoutFloatingRect): void
  (event: 'drag', value: LayoutFloatingDragPosition): void
  (event: 'drag-end', value: LayoutFloatingDragPosition): void
}>()

const dragBarEl = shallowRef<HTMLElement | null>(null)
const dragStarted = shallowRef(false)

const rootEl = computed(() => getLayoutRootElement(dragBarEl.value))

const { x, y, isDragging } = useDraggable(rootEl, {
  handle: dragBarEl,
  initialValue: { x: DEFAULT_FLOATING_GAP, y: DEFAULT_FLOATING_TOP },
  preventDefault: true,
  buttons: [0],
  disabled: computed(() => !props.canDrag),
  onStart: () => {
    if (!props.canDrag || dragStarted.value) {
      return false
    }

    dragStarted.value = true
    setPosition(props.floatingRect.x, props.floatingRect.y)
    emit('drag-start', props.floatingRect)
  },
  onMove: (position) => {
    if (!dragStarted.value) {
      return
    }

    emit('drag', position)
  },
  onEnd: (position) => {
    if (!dragStarted.value) {
      return
    }

    dragStarted.value = false
    emit('drag-end', position)
  },
})

const dragBarClass = computed(() => ({
  'tr-layout__drag-bar--draggable': props.canDrag,
}))

function setPosition(nextX: number, nextY: number): void {
  x.value = nextX
  y.value = nextY
}

watch(
  () => [props.floatingRect.x, props.floatingRect.y] as const,
  ([nextX, nextY]) => {
    if (!isDragging.value) {
      setPosition(nextX, nextY)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div ref="dragBarEl" class="tr-layout__drag-bar" :class="dragBarClass" />
</template>

<style lang="less" scoped>
.tr-layout__drag-bar {
  position: absolute;
  top: var(--drag-bar-top);
  left: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
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

:global(.tr-layout--floating-dragging) .tr-layout__drag-bar--draggable {
  cursor: grabbing;
}

:global(.tr-layout--floating-resizing) .tr-layout__drag-bar--draggable {
  cursor: default;
  pointer-events: none;
}
</style>
