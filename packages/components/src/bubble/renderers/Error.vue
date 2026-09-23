<script setup lang="ts">
import { computed } from 'vue'
import type { BubbleErrorRendererProps } from '../index.type'

const props = defineProps<BubbleErrorRendererProps>()

const errorText = computed(() => {
  const error = props.message.state?.error

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return String(error)
})
</script>

<template>
  <div class="tr-bubble__error" role="alert">{{ errorText }}</div>
</template>

<style scoped lang="less">
.tr-bubble__error {
  box-sizing: border-box;
  max-width: var(--tr-bubble-max-width);
  min-width: 0;
  padding: 8px 12px;
  color: var(--tr-color-error);
  background-color: var(--tr-color-error-light);
  border: 1px solid var(--tr-color-error);
  border-radius: var(--tr-bubble-box-border-radius);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  user-select: text;
}
</style>
