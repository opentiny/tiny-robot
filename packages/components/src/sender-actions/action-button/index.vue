<script setup lang="ts">
import { computed } from 'vue'
import { TinyTooltip } from '@opentiny/vue'
import type { ActionButtonProps } from '../types/common'
import { normalizeTooltipContent } from '../utils/tooltip'

const props = withDefaults(defineProps<ActionButtonProps>(), {
  disabled: false,
  active: false,
  tooltipPlacement: 'top',
})

const tooltipRenderFn = computed(() => normalizeTooltipContent(props.tooltip))

const sizeStyle = computed(() => {
  if (props.size) {
    const finalSize = typeof props.size === 'number' ? `${props.size}px` : props.size
    return { fontSize: finalSize }
  }
  return {}
})
</script>

<template>
  <tiny-tooltip
    v-if="props.tooltip"
    :render-content="tooltipRenderFn"
    :placement="props.tooltipPlacement"
    effect="light"
    :visible-arrow="false"
    popper-class="tr-action-button-tooltip-popper"
  >
    <button
      :class="['tr-action-button', { active: props.active }]"
      :disabled="props.disabled"
      @focus.capture="(event: FocusEvent) => event.stopPropagation()"
    >
      <!-- 优先使用插槽，如果没有插槽则使用 icon prop -->
      <slot name="icon">
        <component :is="props.icon" :style="sizeStyle" />
      </slot>
    </button>
  </tiny-tooltip>

  <!-- 无 tooltip 时直接渲染按钮 -->
  <button v-else :class="['tr-action-button', { active: props.active }]" :disabled="props.disabled">
    <slot name="icon">
      <component :is="props.icon" :style="sizeStyle" />
    </slot>
  </button>
</template>

<style lang="less" scoped>
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

  :deep(svg) {
    font-size: var(--tr-sender-button-size);
  }

  &:hover:not(:disabled) {
    background-color: var(--tr-sender-button-hover-bg, rgba(0, 0, 0, 0.08));
  }

  &:active:not(:disabled) {
    background-color: var(--tr-sender-button-active-bg, rgba(0, 0, 0, 0.12));
  }

  &.active {
    background-color: var(--tr-sender-button-active-bg, rgba(0, 0, 0, 0.12));
    color: var(--tr-text-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
