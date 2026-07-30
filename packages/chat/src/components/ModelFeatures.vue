<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { IconSearch, IconThink } from '@opentiny/tiny-robot-svgs'
import type { ChatModelRuntime } from '../types'

const props = defineProps<{
  model: ChatModelRuntime
}>()

const featureOptions = [
  { id: 'thinking', label: '深度思考', icon: IconThink },
  { id: 'search', label: '联网搜索', icon: IconSearch },
] as const

const pendingFeatureIds = shallowRef<ReadonlySet<string>>(new Set())
const selectedModel = computed(() =>
  props.model.options.value.find((model) => model.id === props.model.selectedId.value),
)

const visibleFeatures = computed(() =>
  featureOptions.filter((feature) => selectedModel.value?.capabilities?.[feature.id]),
)

function isPending(id: string) {
  return pendingFeatureIds.value.has(id)
}

function setFeaturePending(id: string, pending: boolean) {
  const next = new Set(pendingFeatureIds.value)

  if (pending) {
    next.add(id)
  } else {
    next.delete(id)
  }

  pendingFeatureIds.value = next
}

async function toggleFeature(id: string) {
  if (isPending(id)) {
    return
  }

  setFeaturePending(id, true)

  try {
    await props.model.setFeature(id, !props.model.features.value[id])
  } catch {
    // Runtime owns rollback; the default UI only clears its pending state.
  } finally {
    setFeaturePending(id, false)
  }
}
</script>

<template>
  <div v-if="visibleFeatures.length" class="tr-chat-model-features">
    <button
      v-for="feature in visibleFeatures"
      :key="feature.id"
      class="tr-chat-model-features__button"
      :class="{ 'tr-chat-model-features__button--active': model.features.value[feature.id] }"
      type="button"
      :disabled="isPending(feature.id)"
      @click="toggleFeature(feature.id)"
    >
      <component :is="feature.icon" :size="16" class="tr-chat-model-features__icon" />
      {{ feature.label }}
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
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.tr-chat-model-features__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tr-chat-model-features__button--active {
  border-color: var(--tr-border-color-hover);
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default-2);
}

.tr-chat-model-features__icon {
  flex-shrink: 0;
}
</style>
