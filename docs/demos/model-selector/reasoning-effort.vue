<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrModelSelector,
  resolveModelFeatureValues,
  type ModelSelectorFeatureChange,
  type ModelSelectorFeatureValues,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('reasoning-standard')
const valuesByModel = shallowRef<Record<string, ModelSelectorFeatureValues>>({})
const featureValues = computed(() =>
  resolveModelFeatureValues(
    models.find((item) => item.value === model.value)?.fields,
    valuesByModel.value[model.value ?? ''],
  ),
)
function handleFeatureChange(change: ModelSelectorFeatureChange) {
  valuesByModel.value = {
    ...valuesByModel.value,
    [change.modelId]: { ...valuesByModel.value[change.modelId], [change.key]: change.value },
  }
}

const models = [
  {
    value: 'reasoning-standard',
    label: '标准推理模型',
    description: '使用一个选择字段控制关闭和强度',
    fields: [
      {
        key: 'reasoning',
        label: '思考强度',
        type: 'select',
        defaultValue: 'off',
        summary: true,
        options: [
          { value: 'off', label: '关闭', summary: false },
          { value: 'low', label: '低' },
          { value: 'medium', label: '中' },
          { value: 'high', label: '高' },
        ],
      },
      { key: 'search', label: '联网搜索', type: 'switch' },
    ],
  },
  {
    value: 'reasoning-custom',
    label: '自定义推理模型',
    description: '使用业务自定义的选项和值',
    fields: [
      {
        key: 'quality',
        label: '回答质量',
        type: 'select',
        defaultValue: 'balanced',
        summary: true,
        options: [
          { value: 'fast', label: '快速' },
          { value: 'balanced', label: '均衡' },
          { value: 'deep', label: '深度' },
          { value: 'max', label: '极致', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'general-model',
    label: '通用模型',
    description: '未声明思考强度',
    fields: [],
  },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-effort-demo">
    <TrModelSelector
      v-model="model"
      :feature-values="featureValues"
      :models="models"
      :close-on-select="false"
      @feature-change="handleFeatureChange"
    />
    <span aria-live="polite">当前值：{{ featureValues }}</span>
  </div>
</template>

<style scoped>
.model-selector-effort-demo {
  display: flex;
  min-height: 120px;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-effort-demo span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
