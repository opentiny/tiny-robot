<script setup lang="ts">
import { computed } from 'vue'
import { toCssUnit } from '../shared/utils'
import { IconButtonProps } from './index.type'

const props = withDefaults(defineProps<IconButtonProps>(), {
  size: '24px',
  svgSize: '16px',
})

const size = computed(() => toCssUnit(props.size))
const svgSize = computed(() => toCssUnit(props.svgSize))
</script>

<template>
  <button :class="['tr-icon-button', { rounded: props.rounded }]" :style="{ width: size, height: size }">
    <component :is="props.icon" :style="{ width: svgSize, height: svgSize, fontSize: svgSize }" />
  </button>
</template>

<style lang="less">
:root {
  --tr-icon-button-bg: transparent;
  --tr-icon-button-hover-bg: var(--tr-container-bg-hover);
}
</style>

<style lang="less" scoped>
button.tr-icon-button {
  --tr-icon-button-border-radius: 8px;
  --tr-icon-button-border-radius-rounded: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--tr-icon-button-border-radius);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.3s;
  background-color: var(--tr-icon-button-bg);

  &:hover {
    background-color: var(--tr-icon-button-hover-bg);
  }

  &.rounded {
    border-radius: var(--tr-icon-button-border-radius-rounded);
  }
}
</style>
