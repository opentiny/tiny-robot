<script setup lang="ts">
import { IconClose } from '@opentiny/tiny-robot-svgs'

withDefaults(
  defineProps<{
    showClose?: boolean
  }>(),
  {
    showClose: true,
  },
)

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <section class="chat-right-aside">
    <header class="chat-right-aside__header">
      <slot name="title" />
      <button
        v-if="showClose"
        class="chat-right-aside__close"
        type="button"
        aria-label="关闭"
        title="关闭"
        @click="emit('close')"
      >
        <IconClose class="chat-right-aside__close-icon" />
      </button>
    </header>

    <div class="chat-right-aside__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.chat-right-aside {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
}

.chat-right-aside__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 12px 12px;
}

.chat-right-aside__close {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: var(--tr-text-secondary);
  background: transparent;
  cursor: pointer;
}

.chat-right-aside__close:hover {
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.chat-right-aside__close-icon {
  font-size: 18px;
}

.chat-right-aside__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
</style>
