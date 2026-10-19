<script setup lang="ts">
import { IconPlugin } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels } from '../../types'

defineProps<{ labels: ChatLabels }>()

const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <div class="tr-chat-extension-selector">
    <button
      class="tr-chat-extension-selector__button"
      type="button"
      :aria-label="labels.extensions"
      :title="labels.extensions"
      @click="emit('open')"
    >
      <IconPlugin :size="16" class="tr-chat-extension-selector__icon" />
      <span class="tr-chat-extension-selector__label">{{ labels.extensions }}</span>
    </button>
  </div>
</template>

<style scoped>
.tr-chat-extension-selector {
  display: inline-flex;
  align-items: center;
}

.tr-chat-extension-selector__button {
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

.tr-chat-extension-selector__button:hover {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-extension-selector__icon {
  flex-shrink: 0;
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
}
</style>
