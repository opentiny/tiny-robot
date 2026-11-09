<script setup lang="ts">
import type { BubbleBoxRendererProps } from '../index.type'

defineProps<BubbleBoxRendererProps>()
</script>

<template>
  <div class="tr-bubble__box" data-box-type="box">
    <slot />
  </div>
</template>

<style scoped lang="less">
.tr-bubble__box {
  display: flex;
  flex-direction: column;
  gap: var(--tr-bubble-box-content-gap, 8px);
  background-color: var(--tr-bubble-box-bg);
  padding: var(--tr-bubble-box-padding);
  border-radius: var(--tr-bubble-box-border-radius);
  box-shadow: var(--tr-bubble-box-shadow);
  border: var(--tr-bubble-box-border);
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

  &[data-box-type='image'] {
    gap: var(--tr-bubble-image-space-y);
    padding: var(--tr-bubble-box-image-padding);
    border: var(--tr-bubble-box-image-border);
  }
}
</style>
