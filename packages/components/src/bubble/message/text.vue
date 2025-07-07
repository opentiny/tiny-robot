<script setup lang="ts">
const props = defineProps<{ content: string }>()
</script>

<template>
  <span class="tr-bubble__text">{{ props.content }}</span>
</template>

<style lang="less">
:root {
  --tr-bubble-text-font-size: 16px;
  --tr-bubble-text-line-height: 26px;
}
</style>

<style scoped lang="less">
.tr-bubble__text {
  display: block;
  font-size: var(--tr-bubble-text-font-size);
  line-height: var(--tr-bubble-text-line-height);
  word-break: break-word;
  white-space: pre-line;
}
</style>
