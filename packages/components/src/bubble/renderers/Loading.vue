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
  animation: spin 1s linear infinite;

  svg {
    color: var(--tr-text-secondary);
    font-size: var(--tr-bubble-loading-size, 24px);
  }
}
</style>
