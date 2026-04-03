<template>
  <button class="history-trigger-btn" type="button" aria-label="打开历史会话抽屉" @click="emit('click')">
    <IconHistory style="font-size: 20px" />
  </button>
</template>

<script setup lang="ts">
import { IconHistory } from '@opentiny/tiny-robot-svgs'

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>

<style scoped>
.history-trigger-btn {
  display: none;
}

@media (max-width: 959px) {
  .history-trigger-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--tr-radius-full);
    background: var(--tr-container-bg-default);
    color: var(--tr-text-secondary);
    cursor: pointer;
  }

  .history-trigger-btn:hover {
    color: var(--tr-icon-color-hover);
    background: var(--tr-container-bg-hover);
  }
}
</style>
