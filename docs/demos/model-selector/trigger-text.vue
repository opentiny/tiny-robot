<script setup lang="ts">
import { TrModelSelector, type ModelSelectorOption, type ModelSelectorTriggerTextContext } from '@opentiny/tiny-robot'

const models: ModelSelectorOption[] = [
  {
    id: 'general-model',
    label: '通用模型',
    features: [{ key: 'search', label: '联网搜索', type: 'switch' }],
  },
]

function renderTriggerText({ model, featureValues }: ModelSelectorTriggerTextContext) {
  return featureValues.search ? `${model.label} · 联网` : model.label
}
</script>

<template>
  <TrModelSelector default-value="general-model" :models="models" :render-trigger-text="renderTriggerText" />
</template>
