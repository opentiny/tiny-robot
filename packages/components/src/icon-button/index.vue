<script setup lang="ts">
import { IconButtonProps } from './index.type'
import { computed } from 'vue'

const props = withDefaults(defineProps<IconButtonProps>(), {
  size: '24px',
  svgSize: '16px',
})

const formatSize = (size: string | number) => {
  if (!isNaN(Number(size))) {
    return `${size}px`
  }

  return size as string
}

const size = computed(() => formatSize(props.size))
const svgSize = computed(() => formatSize(props.svgSize))
</script>

<template>
  <button class="tr-icon-button">
    <component :is="props.icon" />
  </button>
</template>
<style lang="less" scoped>
button.tr-icon-button {
  --tr-icon-button-bg: transparent;
  --tr-icon-button-hover-bg: rgba(0, 0, 0, 0.04);
  --tr-icon-button-active-bg: rgba(0, 0, 0, 0.15);
  --tr-icon-button-border-radius: 8px;

  width: v-bind('size');
  height: v-bind('size');
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

  &:active {
    background-color: var(--tr-icon-button-active-bg);
  }

  svg {
    font-size: v-bind('svgSize');
  }
}
</style>
