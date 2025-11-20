<script setup lang="ts">
import WordCounter from '../word-counter/index.vue'
import ClearButton from '../clear-button/index.vue'
import SubmitButton from '../submit-button/index.vue'
</script>

<template>
  <div class="tr-chat-input-default-right">
    <WordCounter />
    <div class="tr-chat-input-action-buttons">
      <ClearButton />
      <SubmitButton />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-default-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .tr-chat-input-action-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
