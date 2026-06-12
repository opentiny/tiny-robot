<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutPlacement } from '../index.type'

defineOptions({
  name: 'LayoutAsideResizeTrigger',
})

interface LayoutAsideResizeTriggerProps {
  placement: LayoutPlacement
  draggingPlacement?: LayoutPlacement | null
}

const props = defineProps<LayoutAsideResizeTriggerProps>()

const emit = defineEmits<{
  (event: 'pointerdown', value: PointerEvent): void
}>()

const isDragging = computed(() => props.draggingPlacement === props.placement)
</script>

<template>
  <div
    class="tr-layout__resize-trigger"
    :class="[`tr-layout__resize-trigger--${placement}`, { 'is-dragging': isDragging }]"
    aria-hidden="true"
    @pointerdown="emit('pointerdown', $event)"
  >
    <span class="tr-layout__resize-trigger-indicator" aria-hidden="true" />
  </div>
</template>

<style lang="less" scoped>
.tr-layout__resize-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--trigger-size);
  padding: 0;
  outline: 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: col-resize;
  z-index: 2;
  display: grid;
  place-items: center;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset-block: 0;
    left: 50%;
    width: 1px;
    background: var(--line-color);
    transform: translateX(-50%);
    transition: background-color 180ms ease;
    z-index: 0;
  }

  &--left {
    right: calc(var(--trigger-size) / -2);

    .tr-layout__resize-trigger-indicator {
      transform: translateX(calc(var(--indicator-idle-offset) * -1)) scale(0.92);
    }
  }

  &--right {
    left: calc(var(--trigger-size) / -2);
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
    transform: translateX(var(--indicator-idle-offset)) scale(0.92);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      background-color 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
    z-index: 1;
  }

  &:hover,
  &.is-dragging {
    .tr-layout__resize-trigger-indicator {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  &:hover::before,
  &.is-dragging::before {
    background: var(--line-hover-color);
  }

  &.is-dragging {
    &::before {
      background: var(--line-active-color);
    }

    .tr-layout__resize-trigger-indicator {
      background: var(--indicator-active-bg);
      border-color: var(--indicator-active-border);
      box-shadow: var(--indicator-active-shadow);
    }
  }
}
</style>
