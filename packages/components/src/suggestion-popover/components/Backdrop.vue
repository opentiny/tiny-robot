<script setup lang="ts">
defineProps<{
  show?: boolean
}>()
</script>

<template>
  <div v-if="show" class="tr-question-popover__backdrop"></div>
</template>

<style lang="less" scoped>
.tr-question-popover__backdrop {
  position: fixed;
  z-index: var(--tr-z-index-popover-backdrop);
  inset: 0;
  background-color: var(--tr-suggestion-popover-backdrop-color);
}
</style>
