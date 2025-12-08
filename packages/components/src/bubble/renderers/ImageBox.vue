<script setup lang="ts">
import type { BubbleBoxProps } from '../index.type'
import BubbleBox from './Box.vue'

const props = defineProps<BubbleBoxProps>()
</script>

<template>
  <BubbleBox class="tr-bubble__image-box" v-bind="props" data-box-type="image">
    <slot />
  </BubbleBox>
</template>

<style>
:root {
  --tr-bubble-box-image-border: 4px solid var(--tr-bubble-box-image-border-color);
}
</style>

<style scoped lang="less">
.tr-bubble__image-box {
  padding: var(--tr-bubble-box-image-padding);
  border: var(--tr-bubble-box-image-border);
}
</style>
