<script setup lang="ts">
import { computed } from 'vue'
import { ActionButtonProps } from './index.type'

const props = withDefaults(defineProps<ActionButtonProps>(), {
  disabled: false,
  active: false,
  size: 32,
  tooltipPlacement: 'top',
})

const sizeStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: size, height: size }
})
</script>

<template>
  <button
    :class="['tr-chat-input-action-button', { active: props.active }]"
    :disabled="props.disabled"
    :style="sizeStyle"
    :title="props.tooltip"
  >
    <component :is="props.icon" />
  </button>
</template>

<style lang="less" scoped>
.tr-chat-input-action-button {
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
