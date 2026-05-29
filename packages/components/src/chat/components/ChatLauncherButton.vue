<script setup lang="ts">
import { IconAi } from '@opentiny/tiny-robot-svgs'
import type { Component } from 'vue'

defineProps<{
  show: boolean
  icon?: Component
  ariaLabel: string
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()
</script>

<template>
  <button v-if="!show" class="tr-chat-launcher-button" type="button" :aria-label="ariaLabel" @click="emit('open')">
    <component :is="icon || IconAi" class="tr-chat-launcher-button__icon" />
  </button>
</template>

<style scoped lang="less">
.tr-chat-launcher-button {
  position: fixed;
  right: var(--assistant-panel-offset, 24px);
  bottom: var(--assistant-panel-offset, 24px);
  z-index: var(--tr-z-index-drawer);
  width: var(--assistant-launcher-size, 56px);
  height: var(--assistant-launcher-size, 56px);
  border: 1px solid var(--assistant-launcher-border, var(--tr-border-color-disabled));
  border-radius: var(--tr-radius-full);
  background: var(--assistant-launcher-bg, var(--tr-container-bg-default));
  color: var(--assistant-launcher-color, var(--tr-color-primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--assistant-launcher-shadow, 0 16px 40px rgba(15, 23, 42, 0.14));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.tr-chat-launcher-button:hover {
  transform: translateY(-2px) scale(1.02);
}

.tr-chat-launcher-button__icon {
  font-size: 32px;
}

@media (max-width: 767px) {
  .tr-chat-launcher-button {
    right: 16px;
    bottom: 16px;
  }
}
</style>
