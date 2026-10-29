<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { computed, shallowRef } from 'vue'
import { useLayoutContext } from '../composables/useLayoutContext'
import type { LayoutFloatingDragPosition } from '../internal.type'

defineOptions({
  name: 'FloatingDragBar',
})

interface FloatingDragBarProps {
  x: number
  y: number
  canDrag: boolean
}

const props = defineProps<FloatingDragBarProps>()

const emit = defineEmits<{
  (event: 'drag-start', value: LayoutFloatingDragPosition): void
  (event: 'drag', value: LayoutFloatingDragPosition): void
  (event: 'drag-end', value: LayoutFloatingDragPosition): void
}>()

const dragBarEl = shallowRef<HTMLElement | null>(null)

const { rootEl } = useLayoutContext()
const isDraggable = computed(() => props.canDrag)

const { isDragging } = useDraggable(rootEl, {
  handle: dragBarEl,
  initialValue: { x: props.x, y: props.y },
  preventDefault: true,
  buttons: [0],
  disabled: computed(() => !isDraggable.value),
  onStart: (position) => {
    emit('drag-start', position)
  },
  onMove: (position) => {
    emit('drag', position)
  },
  onEnd: (position) => {
    emit('drag-end', position)
  },
})

const dragBarClass = computed(() => ({
  'tr-layout__drag-bar--draggable': isDraggable.value,
  'tr-layout__drag-bar--dragging': isDragging.value,
}))
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

  &--dragging {
    cursor: grabbing;
  }
}
</style>
