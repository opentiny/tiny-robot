<script setup lang="ts">
import TinyTooltip from '@opentiny/vue-tooltip'
import { computed, defineComponent, isVNode, VNode } from 'vue'
import { IconButtonProps } from './index.type'

const props = withDefaults(defineProps<IconButtonProps>(), {
  size: '24px',
  svgSize: '16px',
})

const resolvedIcon = computed(() => {
  if (isVNode(props.icon)) {
    return defineComponent(() => {
      return () => props.icon as VNode
    })
  }

  return props.icon
})
</script>

<template>
  <tiny-tooltip v-if="tooltip" :content="tooltip" effect="dark" placement="top" :open-delay="500">
    <button class="tr-icon-button">
      <component :is="resolvedIcon" />
    </button>
  </tiny-tooltip>
  <button v-else class="tr-icon-button">
    <component :is="resolvedIcon" />
  </button>
</template>
<style lang="less" scoped>
button.tr-icon-button {
  --tr-icon-button-bg: transparent;
  --tr-icon-button-hover-bg: rgba(0, 0, 0, 0.04);
  --tr-icon-button-active-bg: rgba(0, 0, 0, 0.15);
  --tr-icon-button-border-radius: 8px;

  width: v-bind('props.size');
  height: v-bind('props.size');
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
    font-size: v-bind('props.svgSize');
  }
}
</style>
