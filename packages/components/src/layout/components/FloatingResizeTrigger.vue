<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutFloatingResizeHandle } from '../index.type'

defineOptions({
  name: 'FloatingResizeTrigger',
})

interface FloatingResizeTriggerProps {
  handle: LayoutFloatingResizeHandle
  active?: boolean
}

const props = defineProps<FloatingResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const cursorClass = computed(() => {
  if (props.handle === 's') {
    return 'tr-layout__floating-resize-trigger--ns'
  }

  if (props.handle === 'e' || props.handle === 'w') {
    return 'tr-layout__floating-resize-trigger--ew'
  }

  if (props.handle === 'ne' || props.handle === 'sw') {
    return 'tr-layout__floating-resize-trigger--nesw'
  }

  return 'tr-layout__floating-resize-trigger--nwse'
})
</script>

<template>
  <div
    class="tr-layout__floating-resize-trigger"
    :class="[`tr-layout__floating-resize-trigger--${handle}`, cursorClass, { 'is-active': active }]"
    aria-hidden="true"
    @pointerdown="emit('pointerdown', $event)"
  >
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
