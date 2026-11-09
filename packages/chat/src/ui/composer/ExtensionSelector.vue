<script setup lang="ts">
import { IconPlugin } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<{ label: string; count?: number; disabled?: boolean }>(), {
  count: 0,
  disabled: false,
})

const emit = defineEmits<{ open: [] }>()

function handleOpen() {
  if (!props.disabled) emit('open')
}
</script>

<template>
  <div class="tr-chat-extension-selector">
    <button
      class="tr-chat-extension-selector__button"
      :class="{ 'tr-chat-extension-selector__button--active': count > 0 }"
      type="button"
      :disabled="disabled"
      :aria-label="label"
      :title="label"
      @click="handleOpen"
    >
      <IconPlugin :size="16" class="tr-chat-extension-selector__icon" />
      <span class="tr-chat-extension-selector__label">{{ label }}</span>
      <span v-if="count > 0" class="tr-chat-extension-selector__count">
        {{ count }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.tr-chat-extension-selector {
  display: inline-flex;
  align-items: center;
}

.tr-chat-extension-selector__button {
  position: relative;
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

.tr-chat-extension-selector__button:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-extension-selector__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tr-chat-extension-selector__button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-default-2);
}

.tr-chat-extension-selector__icon {
  flex-shrink: 0;
}

.tr-chat-extension-selector__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  color: #fff;
  background: var(--tr-color-brand, #1476ff);
  font-size: 10px;
}

@container chat-composer (max-width: 640px) {
  .tr-chat-extension-selector__button {
    justify-content: center;
    width: 32px;
    padding: 0;
  }

  .tr-chat-extension-selector__label {
    display: none;
  }

  .tr-chat-extension-selector__count {
    position: absolute;
    right: -4px;
    top: -4px;
  }
}
</style>
