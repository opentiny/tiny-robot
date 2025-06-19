<script setup lang="ts">
const props = defineProps<{ content: string }>()
</script>

<template>
  <span class="tr-bubble__text">{{ props.content }}</span>
</template>

<style scoped lang="less">
.tr-bubble__text {
  display: block;
  font-size: 14px;
  line-height: 24px;
  word-break: break-word;
  white-space: pre-line;
}
</style>
