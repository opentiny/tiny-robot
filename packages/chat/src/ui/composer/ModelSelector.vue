<script setup lang="ts">
import { computed } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorOption,
  type ModelSelectorProps,
  type ModelSelectorSnapshot,
} from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels, ChatModelFeatureValueChangePayload, ChatModelView } from '../../types'

const props = defineProps<{
  model: ChatModelView
  labels: ChatLabels
  appendTo?: ModelSelectorProps['appendTo']
  disabled?: boolean
}>()

const emit = defineEmits<{
  selectModel: [payload: { id: string | null }]
  featureValueChange: [payload: ChatModelFeatureValueChangePayload]
}>()

const modelOptions = computed<ModelSelectorOption[]>(() =>
  (props.model.options ?? []).map((model) => ({
    id: model.id,
    label: model.label,
    description: model.description,
    icon: model.icon,
    disabled: model.disabled,
    group: model.group,
    features: (model.features ?? []).map((field) => ({
      ...field,
      disabled:
        field.disabled || props.model.featureValuesDisabled || props.model.pendingFeatureKeys?.includes(field.key),
    })),
  })),
)

const disabled = computed(() => props.disabled === true || props.model.selecting)

function handleModelSelect(id: string | null) {
  if (disabled.value || id === props.model.selectedId) {
    return
  }

  emit('selectModel', { id })
}

function handleChange(current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot) {
  const { modelId, featureValues } = current
  if (disabled.value || modelId === null || modelId !== previous.modelId) return

  for (const [featureKey, next] of Object.entries(featureValues)) {
    const previousValue = previous.featureValues[featureKey]
    if (next !== undefined && next !== previousValue) {
      emit('featureValueChange', { modelId, featureKey, previous: previousValue, next, featureValues })
    }
  }
}
</script>

<template>
  <TrModelSelector
    v-if="modelOptions.length"
    class="tr-chat-model-selector"
    :models="modelOptions"
    :model-value="model.selectedId ?? null"
    :disabled="disabled"
    :feature-values="model.featureValues"
    :render-trigger-text="model.renderTriggerText"
    :append-to="props.appendTo"
    :placeholder="labels.selectModel"
    :search-placeholder="labels.searchModel"
    :empty-text="labels.modelEmptyText"
    @update:model-value="handleModelSelect"
    @change="handleChange"
  >
    <template #trigger="{ option, text, open }">
      <span class="tr-chat-model-selector__trigger" :class="{ 'has-icon': option?.icon }">
        <span class="tr-chat-model-selector__trigger-main">
          <component
            v-if="option?.icon && typeof option.icon !== 'string'"
            :is="option.icon"
            class="tr-chat-model-selector__icon"
            aria-hidden="true"
            focusable="false"
          />
          <img
            v-else-if="typeof option?.icon === 'string'"
            :src="option.icon"
            class="tr-chat-model-selector__icon"
            alt=""
          />
          <span class="tr-chat-model-selector__label">{{ text }}</span>
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
.tr-chat-model-selector {
  display: block;
  width: min(180px, 100%);
  min-width: 0;
  flex: 0 1 180px;
}

.tr-chat-model-selector :deep(.tr-model-selector__anchor) {
  display: block;
  width: 100%;
  min-width: 0;
}

.tr-chat-model-selector :deep(button.tr-model-selector__trigger) {
  width: 100%;
  max-width: none;
  min-width: 0;
}

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
  overflow: hidden;
  gap: 8px;
}

.tr-chat-model-selector__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.tr-chat-model-selector__label {
  min-width: 0;
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
  .tr-chat-model-selector {
    width: auto;
    max-width: min(180px, 100%);
    flex: 0 1 auto;
  }

  .tr-chat-model-selector :deep(button.tr-model-selector__trigger) {
    width: auto;
    max-width: 100%;
  }

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
