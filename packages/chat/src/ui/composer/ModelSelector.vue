<script setup lang="ts">
import { computed } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import type { ChatLabels, ChatModelView } from '../../types'

const props = defineProps<{
  model: ChatModelView
  labels: ChatLabels
}>()

const emit = defineEmits<{
  selectModel: [payload: { id: string | null }]
}>()

const modelOptions = computed<ModelSelectorOption[]>(() =>
  (props.model.options ?? []).map((model) => ({
    value: model.id,
    label: model.label,
    icon: model.icon,
  })),
)

function handleModelSelect(id: string | null) {
  if (props.model.selecting || id === props.model.selectedId) {
    return
  }

  emit('selectModel', { id })
}
</script>

<template>
  <TrModelSelector
    v-if="modelOptions.length"
    class="tr-chat-model-selector"
    :models="modelOptions"
    :model-value="model.selectedId ?? null"
    :disabled="model.selecting"
    append-to=".tr-chat-ui"
    :placeholder="labels.selectModel"
    :aria-label="labels.selectModel"
    @update:model-value="handleModelSelect"
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

@container (max-width: 959px) {
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
