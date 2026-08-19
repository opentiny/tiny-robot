<script setup lang="ts">
import { computed } from 'vue'
import { IconSearch, IconThink } from '@opentiny/tiny-robot-svgs'
import { CHAT_BUILT_IN_MODEL_FEATURES } from '../../types/runtime'
import type { ChatBuiltInModelFeature, ChatLabels, ChatModelView } from '../../types'

const props = defineProps<{
  model: ChatModelView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  updateFeature: [payload: { id: ChatBuiltInModelFeature; enabled: boolean }]
}>()

const featureLabels: Record<ChatBuiltInModelFeature, keyof ChatLabels> = {
  thinking: 'thinkingFeature',
  search: 'searchFeature',
}
const featureIcons: Record<ChatBuiltInModelFeature, typeof IconThink> = {
  thinking: IconThink,
  search: IconSearch,
}

const featureOptions = computed(() =>
  CHAT_BUILT_IN_MODEL_FEATURES.map((id) => ({
    id,
    label: props.labels[featureLabels[id]],
    icon: featureIcons[id],
  })),
)

const pendingFeatureIds = computed(() => new Set(props.model.pendingFeatureIds ?? []))
const selectedModel = computed(() => props.model.options?.find((model) => model.id === props.model.selectedId))

const visibleFeatures = computed(() =>
  featureOptions.value.filter((feature) => selectedModel.value?.capabilities?.[feature.id]),
)

function isPending(id: ChatBuiltInModelFeature) {
  return pendingFeatureIds.value.has(id)
}

function toggleFeature(id: ChatBuiltInModelFeature) {
  if (isPending(id)) {
    return
  }

  emit('updateFeature', { id, enabled: !props.model.features?.[id] })
}
</script>

<template>
  <div v-if="visibleFeatures.length" class="tr-chat-model-features">
    <button
      v-for="feature in visibleFeatures"
      :key="feature.id"
      class="tr-chat-model-features__button"
      :class="{ 'tr-chat-model-features__button--active': model.features?.[feature.id] }"
      type="button"
      :disabled="isPending(feature.id)"
      :aria-label="feature.label"
      :title="feature.label"
      @click="toggleFeature(feature.id)"
    >
      <component :is="feature.icon" :size="16" class="tr-chat-model-features__icon" />
      <span class="tr-chat-model-features__label">{{ feature.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.tr-chat-model-features {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tr-chat-model-features__button {
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

.tr-chat-model-features__button:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-hover);
}

.tr-chat-model-features__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tr-chat-model-features__button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-border-color-hover);
  background: var(--tr-container-bg-default-2);
}

.tr-chat-model-features__icon {
  flex-shrink: 0;
}

@container (max-width: 959px) {
  .tr-chat-model-features__button {
    justify-content: center;
    width: 32px;
    padding: 0;
  }

  .tr-chat-model-features__label {
    display: none;
  }
}
</style>
