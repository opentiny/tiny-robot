<script setup lang="ts">
import { IconLoading } from '@opentiny/tiny-robot-svgs'
import { BubbleRendererMessage } from '../index.type'

defineProps<BubbleRendererMessage>()
</script>

<template>
  <div class="tr-bubble__loading" data-type="loading">
    <IconLoading />
  </div>
</template>

<style scoped lang="less">
.tr-bubble__loading {
  display: flex;

  svg {
    color: var(--tr-bubble-loading-color);
    font-size: var(--tr-bubble-loading-size);
    animation: spin 1s linear infinite;
  }
}
</style>
