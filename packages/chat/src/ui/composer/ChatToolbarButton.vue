<script setup lang="ts">
import type { ChatIcon } from '../../types'

const props = defineProps<{
  label: string
  icon?: ChatIcon
  active?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (!props.disabled) emit('click')
}
</script>

<template>
  <button
    class="tr-chat-toolbar-button"
    :class="{ 'tr-chat-toolbar-button--active': active }"
    type="button"
    :disabled="disabled"
    :aria-label="label"
    :aria-pressed="active"
    :title="label"
    @click="handleClick"
  >
    <component
      v-if="icon && typeof icon !== 'string'"
      :is="icon"
      :size="16"
      class="tr-chat-toolbar-button__icon"
      aria-hidden="true"
    />
    <img v-else-if="typeof icon === 'string'" :src="icon" class="tr-chat-toolbar-button__icon" alt="" />
    <span class="tr-chat-toolbar-button__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.tr-chat-toolbar-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--tr-border-color-disabled);
  border-radius: var(--tr-radius-full);
  color: var(--tr-text-secondary);
  background: var(--tr-container-bg-default);
  font: inherit;
  font-size: var(--tr-font-size-sm);
  line-height: 1;
  cursor: pointer;
}

.tr-chat-toolbar-button:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-toolbar-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tr-chat-toolbar-button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-default-2);
}

.tr-chat-toolbar-button__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@container chat-composer (max-width: 640px) {
  .tr-chat-toolbar-button:has(.tr-chat-toolbar-button__icon) {
    justify-content: center;
    width: 32px;
    padding: 0;
  }

  .tr-chat-toolbar-button:has(.tr-chat-toolbar-button__icon) .tr-chat-toolbar-button__label {
    display: none;
  }
}
</style>
