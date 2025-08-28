<script setup lang="ts">
const props = defineProps<{ content: string }>()
</script>

<template>
  <span class="tr-bubble__text">{{ props.content }}</span>
</template>

<style scoped lang="less">
.tr-bubble__text {
  color: var(--tr-text-primary);
  display: block;
  font-size: 14px;
  line-height: 24px;
  word-break: break-word;
  white-space: pre-line;
}
</style>
