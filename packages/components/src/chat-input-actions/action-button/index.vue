<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/dom'
import { useElementHover } from '@vueuse/core'
import type { ActionButtonProps } from './index.type'

const props = withDefaults(defineProps<ActionButtonProps>(), {
  disabled: false,
  active: false,
  size: 32,
  tooltipPlacement: 'top',
})

const buttonRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)

const isHovered = useElementHover(buttonRef)

const showTooltip = computed(() => isHovered.value && !!props.tooltip)

const tooltipStyles = ref<Record<string, string>>({})

const updatePosition = () => {
  if (buttonRef.value && tooltipRef.value) {
    computePosition(buttonRef.value, tooltipRef.value, {
      placement: props.tooltipPlacement,
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      tooltipStyles.value = {
        left: `${x}px`,
        top: `${y}px`,
      }
    })
  }
}

let cleanup: (() => void) | null = null

watchEffect((onCleanup) => {
  if (showTooltip.value && buttonRef.value && tooltipRef.value) {
    // 立即更新一次位置
    updatePosition()

    // 启动自动更新
    cleanup = autoUpdate(buttonRef.value, tooltipRef.value, updatePosition)
  }

  onCleanup(() => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  })
})

const sizeStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { fontSize: size }
})
</script>

<template>
  <div class="tr-action-button-wrapper">
    <button ref="buttonRef" :class="['tr-action-button', { active: props.active }]" :disabled="props.disabled">
      <component :is="props.icon" :style="sizeStyle" />
    </button>

    <Teleport to="body">
      <Transition name="tr-tooltip-fade">
        <div v-if="showTooltip" ref="tooltipRef" class="tr-action-button-tooltip" :style="tooltipStyles">
          {{ props.tooltip }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="less" scoped>
.tr-action-button-wrapper {
  position: relative;
  display: inline-flex;
}

.tr-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s;
  color: var(--tr-text-secondary);

  &:hover:not(:disabled) {
    background-color: var(--tr-chat-input-button-hover-bg, rgba(0, 0, 0, 0.08));
  }

  &:active:not(:disabled) {
    background-color: var(--tr-chat-input-button-active-bg, rgba(0, 0, 0, 0.12));
  }

  &.active {
    background-color: var(--tr-chat-input-button-active-bg, rgba(0, 0, 0, 0.12));
    color: var(--tr-text-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>

<style lang="less">
/* 全局样式，因为 tooltip 通过 Teleport 挂载到 body */
.tr-action-button-tooltip {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
}

/* Vue Transition 类名 */
.tr-tooltip-fade-enter-active,
.tr-tooltip-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tr-tooltip-fade-enter-from,
.tr-tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.tr-tooltip-fade-enter-to,
.tr-tooltip-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
