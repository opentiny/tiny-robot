<script setup lang="ts">
import { computed } from 'vue'
import { BubbleRendererMessage, ChatMessageItem } from '../index.type'

const props = defineProps<BubbleRendererMessage<string | ChatMessageItem | undefined>>()

const content = computed(() => {
  if (typeof props.content === 'string') {
    return props.content
  }

  return props.content?.text
})
</script>

<template>
  <p class="tr-bubble__text" data-type="text">{{ content }}</p>
</template>

<style scoped lang="less">
.tr-bubble__text {
  font-size: var(--tr-bubble-text-font-size, inherit);
  line-height: var(--tr-bubble-text-line-height, 1.5);
  color: var(--tr-bubble-text-color, var(--tr-text-primary));
}

p.tr-bubble__text {
  margin: 0;
  white-space: pre-wrap;

  & + p.tr-bubble__text {
    margin-top: 1em;
  }
}
</style>
