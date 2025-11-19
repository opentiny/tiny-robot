<script setup lang="ts">
import type { BubbleBoxProps } from '../index.type'

const props = defineProps<BubbleBoxProps>()
</script>

<template>
  <div class="tr-bubble__box" :data-shape="props.shape" :data-placement="props.placement" data-box-type="box">
    <slot />
  </div>
</template>

<style>
:root {
  --tr-bubble-box-shape-rounded-radius: 16px;
  --tr-bubble-box-shape-corner-radius: 2px;
}
</style>

<style scoped lang="less">
.tr-bubble__box {
  background-color: var(--tr-bubble-box-bg, var(--tr-container-bg-default));
  padding: var(--tr-bubble-box-padding, 8px 16px);
  border-radius: var(--tr-bubble-box-border-radius, 16px);
  box-shadow: var(--tr-bubble-box-shadow, var(--tr-shadow-md));
  border: var(--tr-bubble-box-border, none);
  overflow: hidden;

  &[data-shape='rounded'] {
    border-radius: var(--tr-bubble-box-shape-rounded-radius);
  }

  &[data-shape='corner'] {
    border-radius: var(--tr-bubble-box-shape-rounded-radius);

    &[data-placement='start'] {
      border-top-left-radius: var(--tr-bubble-box-shape-corner-radius);
    }

    &[data-placement='end'] {
      border-top-right-radius: var(--tr-bubble-box-shape-corner-radius);
    }
  }
}
</style>
