<script setup lang="ts">
import { TrModelSelector } from '@opentiny/tiny-robot'
import { modelSelectorDemoModels } from './demo-models'

const models = modelSelectorDemoModels.filter((option) => !option.disabled)

const variants = [
  { label: 'outline / small', variant: 'outline' as const, size: 'small' as const, value: 'deepseek-v4-flash' },
  { label: 'ghost / normal', variant: 'ghost' as const, size: 'normal' as const, value: 'qwen3.7-plus' },
  { label: 'muted / large', variant: 'muted' as const, size: 'large' as const, value: 'qwen3.7-max' },
]
</script>

<template>
  <div class="model-selector-variants-demo">
    <div v-for="item in variants" :key="item.label" class="model-selector-variants-demo__item">
      <span class="model-selector-variants-demo__label">{{ item.label }}</span>
      <TrModelSelector :models="models" :default-value="item.value" :variant="item.variant" :size="item.size" />
    </div>
  </div>
</template>

<style scoped>
.model-selector-variants-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-variants-demo__item {
  display: flex;
  min-width: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.model-selector-variants-demo__label {
  color: var(--vp-c-text-2);
  font-size: 12px;
}
</style>
