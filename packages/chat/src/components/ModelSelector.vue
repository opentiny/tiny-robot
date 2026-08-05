<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrDropdownMenu, type DropdownMenuItem } from '@opentiny/tiny-robot'
import { IconAtom } from '@opentiny/tiny-robot-svgs'
import type { ChatUIModelControls } from '../types'

const props = defineProps<{
  model: ChatUIModelControls
}>()

const pending = shallowRef(false)

const modelOptions = computed(() => props.model.options.value)
const selectedModel = computed(() => modelOptions.value.find((model) => model.id === props.model.selectedId.value))
const menuItems = computed<DropdownMenuItem[]>(() =>
  modelOptions.value.map((model) => ({
    id: model.id,
    text: model.label,
  })),
)

async function handleModelSelect(item: DropdownMenuItem) {
  if (pending.value || item.id === props.model.selectedId.value) {
    return
  }

  pending.value = true

  try {
    await props.model.select(item.id)
  } catch {
    // Runtime owns rollback; the default UI only clears its pending state.
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <TrDropdownMenu v-if="modelOptions.length" :items="menuItems" trigger="click" @item-click="handleModelSelect">
    <template #trigger>
      <button
        class="tr-chat-model-selector__button"
        type="button"
        :disabled="pending"
        :aria-label="selectedModel?.label || '选择模型'"
        :title="selectedModel?.label || '选择模型'"
      >
        <IconAtom :size="16" class="tr-chat-model-selector__icon" />
        <span class="tr-chat-model-selector__label">{{ selectedModel?.label || '选择模型' }}</span>
      </button>
    </template>
  </TrDropdownMenu>
</template>

<style scoped>
.tr-chat-model-selector__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 180px;
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

.tr-chat-model-selector__button:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.tr-chat-model-selector__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tr-chat-model-selector__icon {
  flex-shrink: 0;
}

.tr-chat-model-selector__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 959px) {
  .tr-chat-model-selector__button {
    justify-content: center;
    width: 32px;
    padding: 0;
  }

  .tr-chat-model-selector__label {
    display: none;
  }
}
</style>
