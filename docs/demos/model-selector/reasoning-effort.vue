<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('reasoning-standard')
const reasoningEffort = shallowRef<string | null>('medium')

const models = [
  {
    value: 'reasoning-standard',
    label: '标准推理模型',
    description: '使用内置 Low、Medium、High 思考强度选项',
    reasoningEfforts: true,
  },
  {
    value: 'reasoning-custom',
    label: '自定义推理模型',
    description: '使用业务自定义的选项和值',
    reasoningEfforts: [
      { value: 'fast', label: '快速' },
      { value: 'balanced', label: '均衡' },
      { value: 'deep', label: '深度' },
      { value: 'max', label: '极致', disabled: true },
    ],
  },
  {
    value: 'general-model',
    label: '通用模型',
    description: '未声明思考强度',
  },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-effort-demo">
    <TrModelSelector
      v-model="model"
      v-model:reasoning-effort="reasoningEffort"
      :models="models"
      :close-on-select="false"
      reasoning-effort-label="思考强度"
    />
    <span aria-live="polite">当前值：{{ reasoningEffort ?? '未选择' }}</span>
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
