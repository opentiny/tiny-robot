<script setup lang="ts">
import { computed } from 'vue'
import { BubbleContentRendererProps } from '../index.type'

const props = defineProps<BubbleContentRendererProps>()

const content = computed(() => {
  if (typeof props.message.content === 'string') {
    return props.message.content
  }

  return props.message.content?.[props.contentIndex ?? 0].text
})
</script>

<template>
  <p v-if="content" class="tr-bubble__text" data-type="text">{{ content }}</p>
</template>

<style scoped lang="less">
.tr-bubble__text {
  font-size: var(--tr-bubble-text-font-size);
  line-height: var(--tr-bubble-text-line-height);
  color: var(--tr-bubble-text-color);
}

p.tr-bubble__text {
  margin: 0;
  white-space: pre-wrap;

  & + p.tr-bubble__text {
    margin-top: 1em;
  }
}
</style>
