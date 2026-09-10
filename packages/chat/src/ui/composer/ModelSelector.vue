<script setup lang="ts">
import { computed } from 'vue'
import { TrModelSelector, type ModelSelectorOption, type ModelSelectorProps } from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels, ChatModelView } from '../../types'

const props = defineProps<{
  model: ChatModelView
  labels: ChatLabels
  appendTo?: ModelSelectorProps['appendTo']
}>()

const emit = defineEmits<{
  selectModel: [payload: { id: string | null }]
  updateReasoningEffort: [payload: { effort: string | null }]
}>()

const thinkingEnabled = computed(() => props.model.reasoning?.enabled === true)
const modelOptions = computed<ModelSelectorOption[]>(() =>
  (props.model.options ?? []).map((model) => ({
    value: model.id,
    label: model.label,
    icon: model.icon,
    reasoningEfforts: thinkingEnabled.value ? model.efforts : undefined,
  })),
)

const selectedModel = computed(() => props.model.options?.find((model) => model.id === props.model.selectedId))

function handleModelSelect(id: string | null) {
  if (props.model.selecting || id === props.model.selectedId) {
    return
  }

  emit('selectModel', { id })
}

function handleReasoningEffortChange(effort: string | null) {
  if (props.model.reasoningSelecting) {
    return
  }

  emit('updateReasoningEffort', { effort })
}
</script>

<template>
  <TrModelSelector
    v-if="modelOptions.length"
    class="tr-chat-model-selector"
    :models="modelOptions"
    :model-value="model.selectedId ?? null"
    :disabled="model.selecting || model.reasoningSelecting"
    :reasoning-effort="model.reasoning?.effort ?? null"
    :default-reasoning-effort="selectedModel?.defaultEffort ?? null"
    :append-to="props.appendTo"
    :placeholder="labels.selectModel"
    :search-placeholder="labels.searchModel"
    :empty-text="labels.modelEmptyText"
    :aria-label="labels.selectModel"
    @update:model-value="handleModelSelect"
    @update:reasoning-effort="handleReasoningEffortChange"
  >
    <template #trigger="{ option, label, open }">
      <span class="tr-chat-model-selector__trigger" :class="{ 'has-icon': option?.icon }">
        <span class="tr-chat-model-selector__trigger-main">
          <component
            :is="option?.icon"
            v-if="option?.icon"
            class="tr-chat-model-selector__icon"
            aria-hidden="true"
            focusable="false"
          />
          <span class="tr-chat-model-selector__label">{{ label }}</span>
        </span>
        <IconArrowDown
          class="tr-chat-model-selector__chevron"
          :class="{ 'is-open': open }"
          aria-hidden="true"
          focusable="false"
        />
      </span>
    </template>
  </TrModelSelector>
</template>

<style scoped>
.tr-chat-model-selector :deep(button.tr-model-selector__trigger) {
  height: 32px;
  min-height: 32px;
  padding: 0 10px;
  border-radius: var(--tr-radius-full);
  color: var(--tr-text-secondary);
  font-size: var(--tr-font-size-sm);
}

.tr-chat-model-selector__trigger,
.tr-chat-model-selector__trigger-main {
  display: inline-flex;
  align-items: center;
}

.tr-chat-model-selector__trigger {
  width: 100%;
  justify-content: space-between;
  gap: 8px;
}

.tr-chat-model-selector__trigger-main {
  min-width: 0;
  gap: 8px;
}

.tr-chat-model-selector__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.tr-chat-model-selector__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-chat-model-selector__chevron {
  flex: 0 0 auto;
  transition: transform 0.18s ease;
}

.tr-chat-model-selector__chevron.is-open {
  transform: rotate(180deg);
}

@container chat-composer (max-width: 640px) {
  .tr-chat-model-selector__trigger.has-icon .tr-chat-model-selector__label {
    display: none;
  }

  .tr-chat-model-selector__trigger.has-icon .tr-chat-model-selector__chevron {
    display: none;
  }

  .tr-chat-model-selector__trigger.has-icon .tr-chat-model-selector__trigger-main {
    gap: 0;
  }
}
</style>
