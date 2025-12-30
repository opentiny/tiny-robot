<script setup lang="ts">
import { useMessageContent } from '../composables'
import { BubbleContentRendererProps } from '../index.type'

const props = defineProps<BubbleContentRendererProps>()

const content = useMessageContent(() => props.message, props.contentIndex)
</script>

<template>
  <p v-if="content" class="tr-bubble__text" data-type="text">
    {{ typeof content === 'string' ? content : content?.text }}
  </p>
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
  word-break: break-word;

  & + p.tr-bubble__text {
    margin-top: 0.5em;
  }
}
</style>
