<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { usePointerDrag } from '../composables/usePointerDrag'
import type { LayoutFloatingResizeHandle } from '../index.type'
import { lockBodyDragInteraction } from '../utils/domInteraction'

defineOptions({
  name: 'FloatingResizeTrigger',
})

type ResizeCursorDirection = 'ns' | 'ew' | 'nesw' | 'nwse'

const HANDLE_RESIZE_CURSOR = {
  s: 'ns',
  e: 'ew',
  w: 'ew',
  ne: 'nesw',
  sw: 'nesw',
  nw: 'nwse',
  se: 'nwse',
} satisfies Record<LayoutFloatingResizeHandle, ResizeCursorDirection>

interface FloatingResizeTriggerProps {
  handle: LayoutFloatingResizeHandle
  active: boolean
}

const props = defineProps<FloatingResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'resize-start', handle: LayoutFloatingResizeHandle): void
  (event: 'resize', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
  (event: 'resize-end', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
}>()

interface FloatingResizeState {
  startX: number
  startY: number
  lastPointerX: number
  lastPointerY: number
  releaseBodyInteraction: () => void
}

const triggerRef = shallowRef<HTMLElement | null>(null)

const triggerClass = computed(() => [
  `tr-layout__floating-resize-trigger--${props.handle}`,
  `tr-layout__floating-resize-trigger--${resolveResizeDirection(props.handle)}`,
  {
    'is-active': props.active,
  },
])

usePointerDrag<FloatingResizeState>(triggerRef, {
  onStart: (event) => {
    const handleEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!handleEl) {
      return null
    }

    event.preventDefault()
    const bodyEl = handleEl.ownerDocument.body

    const state = {
      startX: event.clientX,
      startY: event.clientY,
      lastPointerX: event.clientX,
      lastPointerY: event.clientY,
      releaseBodyInteraction: lockBodyDragInteraction(bodyEl, `${resolveResizeDirection(props.handle)}-resize`),
    }

    emit('resize-start', props.handle)

    return state
  },
  onMove: (state, event) => {
    if (event.clientX === state.lastPointerX && event.clientY === state.lastPointerY) {
      return
    }

    emitResize(state, event.clientX, event.clientY)
  },
  onEnd: (state) => {
    state.releaseBodyInteraction()
    emitResizeEnd(state)
  },
})

function resolveResizeDirection(handle: LayoutFloatingResizeHandle): ResizeCursorDirection {
  return HANDLE_RESIZE_CURSOR[handle]
}

function resolveResizeDelta(state: FloatingResizeState, pointerX: number, pointerY: number): [number, number] {
  const deltaX = pointerX - state.startX
  const deltaY = pointerY - state.startY

  return [deltaX, deltaY]
}

function emitResize(state: FloatingResizeState, pointerX: number, pointerY: number): void {
  const [deltaX, deltaY] = resolveResizeDelta(state, pointerX, pointerY)

  state.lastPointerX = pointerX
  state.lastPointerY = pointerY

  emit('resize', props.handle, deltaX, deltaY)
}

function emitResizeEnd(state: FloatingResizeState): void {
  const [deltaX, deltaY] = resolveResizeDelta(state, state.lastPointerX, state.lastPointerY)

  emit('resize-end', props.handle, deltaX, deltaY)
}
</script>

<template>
  <div ref="triggerRef" class="tr-layout__floating-resize-trigger" :class="triggerClass" aria-hidden="true">
    <span class="tr-layout__floating-resize-trigger-indicator" aria-hidden="true" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout__floating-resize-trigger {
  position: absolute;
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;

  &--n,
  &--s {
    left: 12px;
    right: 12px;
    height: var(--hit-area-size);
  }

  &--e,
  &--w {
    top: 12px;
    bottom: 12px;
    width: var(--hit-area-size);
  }

  &--ne,
  &--nw,
  &--se,
  &--sw {
    width: calc(var(--hit-area-size) + 6px);
    height: calc(var(--hit-area-size) + 6px);
  }

  &--n {
    top: calc(var(--hit-area-size) / -2);
  }

  &--s {
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--e {
    right: calc(var(--hit-area-size) / -2);
  }

  &--w {
    left: calc(var(--hit-area-size) / -2);
  }

  &--ne {
    top: calc(var(--hit-area-size) / -2);
    right: calc(var(--hit-area-size) / -2);
  }

  &--nw {
    top: calc(var(--hit-area-size) / -2);
    left: calc(var(--hit-area-size) / -2);
  }

  &--se {
    right: calc(var(--hit-area-size) / -2);
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--sw {
    left: calc(var(--hit-area-size) / -2);
    bottom: calc(var(--hit-area-size) / -2);
  }

  &--ns {
    cursor: ns-resize;
  }

  &--ew {
    cursor: ew-resize;
  }

  &--nesw {
    cursor: nesw-resize;
  }

  &--nwse {
    cursor: nwse-resize;
  }

  &-indicator {
    position: relative;
    display: block;
    width: var(--indicator-width);
    height: var(--indicator-height);
    border-radius: 999px;
    background: var(--indicator-bg);
    border: 1px solid var(--indicator-border);
    opacity: var(--indicator-idle-opacity);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &--n .tr-layout__floating-resize-trigger-indicator,
  &--s .tr-layout__floating-resize-trigger-indicator {
    width: 28px;
    height: 6px;
  }

  &--e .tr-layout__floating-resize-trigger-indicator,
  &--w .tr-layout__floating-resize-trigger-indicator {
    width: 6px;
    height: 28px;
  }

  &--ne .tr-layout__floating-resize-trigger-indicator,
  &--nw .tr-layout__floating-resize-trigger-indicator,
  &--se .tr-layout__floating-resize-trigger-indicator,
  &--sw .tr-layout__floating-resize-trigger-indicator {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  &:hover {
    .tr-layout__floating-resize-trigger-indicator {
      opacity: var(--indicator-hover-opacity);
    }
  }

  &.is-active {
    .tr-layout__floating-resize-trigger-indicator {
      opacity: 1;
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
    }
  }
}
</style>
