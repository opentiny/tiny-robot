<script setup lang="ts">
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const models = [
  { value: 'general-model', label: '通用模型' },
  { value: 'reasoning-model', label: '推理模型' },
] satisfies readonly ModelSelectorOption[]

const sizes = [
  { label: 'small', value: 'small' as const },
  { label: 'normal', value: 'normal' as const },
  { label: 'large', value: 'large' as const },
]

const variants = [
  { label: 'outline', value: 'outline' as const },
  { label: 'ghost', value: 'ghost' as const },
  { label: 'muted', value: 'muted' as const },
]
</script>

<template>
  <div class="model-selector-variants-demo">
    <section class="model-selector-variants-demo__group">
      <h4>尺寸</h4>
      <div class="model-selector-variants-demo__list">
        <div v-for="size in sizes" :key="size.value" class="model-selector-variants-demo__item">
          <span>{{ size.label }}</span>
          <TrModelSelector :models="models" default-value="general-model" :size="size.value" />
        </div>
      </div>
    </section>

    <section class="model-selector-variants-demo__group">
      <h4>外观</h4>
      <div class="model-selector-variants-demo__list">
        <div v-for="variant in variants" :key="variant.value" class="model-selector-variants-demo__item">
          <span>{{ variant.label }}</span>
          <TrModelSelector :models="models" default-value="general-model" :variant="variant.value" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.model-selector-variants-demo {
  display: grid;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-variants-demo__group {
  display: grid;
  gap: 12px;
}

.model-selector-variants-demo__group h4 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.model-selector-variants-demo__list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
}

.model-selector-variants-demo__item {
  display: flex;
  min-width: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.model-selector-variants-demo__item > span {
  color: var(--vp-c-text-2);
  font-size: 12px;
}
</style>
