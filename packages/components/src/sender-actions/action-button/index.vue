<script setup lang="ts">
import { computed } from 'vue'
import { TinyTooltip } from '@opentiny/vue'
import type { ActionButtonProps } from '../types/common'
import { normalizeTooltipContent } from '../utils/tooltip'
import { toCssUnit } from '../../shared/utils'

const props = withDefaults(defineProps<ActionButtonProps>(), {
  disabled: false,
  active: false,
  tooltipPlacement: 'top',
})

const ACTION_BUTTON_SIZE_MAP = {
  normal: {
    button: '32px',
    padding: '4px',
  },
  small: {
    button: '28px',
    padding: '3px',
  },
} as const

const tooltipRenderFn = computed(() => normalizeTooltipContent(props.tooltip))

const resolveButtonStyle = (size: ActionButtonProps['size']) => {
  if (size === 'small') {
    return {
      '--tr-action-button-size': ACTION_BUTTON_SIZE_MAP.small.button,
      '--tr-action-button-padding': ACTION_BUTTON_SIZE_MAP.small.padding,
    }
  }

  if (size === 'normal') {
    return {
      '--tr-action-button-size': ACTION_BUTTON_SIZE_MAP.normal.button,
      '--tr-action-button-padding': ACTION_BUTTON_SIZE_MAP.normal.padding,
    }
  }

  const finalSize = toCssUnit(size)

  return {
    '--tr-action-button-size': finalSize,
  }
}

const buttonStyle = computed(() => {
  if (props.size) {
    return resolveButtonStyle(props.size)
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
      :style="buttonStyle"
      :disabled="props.disabled"
      @focus.capture="(event: FocusEvent) => event.stopPropagation()"
    >
      <!-- 优先使用插槽，如果没有插槽则使用 icon prop -->
      <slot name="icon">
        <component :is="props.icon" />
      </slot>
    </button>
  </tiny-tooltip>

  <!-- 无 tooltip 时直接渲染按钮 -->
  <button
    v-else
    :class="['tr-action-button', { active: props.active }]"
    :style="buttonStyle"
    :disabled="props.disabled"
  >
    <slot name="icon">
      <component :is="props.icon" />
    </slot>
  </button>
</template>

<style lang="less" scoped>
.tr-action-button {
  --tr-action-button-size: var(--tr-sender-action-button-size, var(--tr-sender-button-size, 32px));
  --tr-action-button-padding: var(--tr-sender-action-button-padding, 4px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--tr-action-button-size);
  height: var(--tr-action-button-size);
  box-sizing: border-box;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  padding: var(--tr-action-button-padding);
  transition: background-color 0.2s;
  color: var(--tr-text-secondary);

  :deep(svg) {
    width: calc(var(--tr-action-button-size) - (var(--tr-action-button-padding) * 2));
    height: calc(var(--tr-action-button-size) - (var(--tr-action-button-padding) * 2));
    font-size: calc(var(--tr-action-button-size) - (var(--tr-action-button-padding) * 2));
    display: block;
    flex-shrink: 0;
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

<style lang="less">
@import '../styles/tooltip.less';

.tiny-tooltip.tiny-tooltip__popper.tr-action-button-tooltip-popper {
  .tr-sender-tooltip-light-popper-mixin();
}
</style>
