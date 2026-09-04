<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { value: 'general-model', label: '通用模型' },
  { value: 'reasoning-model', label: '推理模型' },
  { value: 'lightweight-model', label: '轻量模型' },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-trigger-demo">
    <TrModelSelector v-model="model" :models="models">
      <template #trigger="{ label, open }">
        <span class="model-selector-trigger-demo__content">
          <span class="model-selector-trigger-demo__badge" aria-hidden="true">AI</span>
          <span class="model-selector-trigger-demo__label">{{ label }}</span>
          <IconArrowDown
            class="model-selector-trigger-demo__arrow"
            :class="{ 'is-open': open }"
            aria-hidden="true"
            focusable="false"
          />
        </span>
      </template>
    </TrModelSelector>
  </div>
</template>

<style scoped>
.model-selector-trigger-demo {
  display: flex;
  min-height: 96px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-trigger-demo__content {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.model-selector-trigger-demo__badge {
  display: inline-grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 10px;
  font-weight: 700;
}

.model-selector-trigger-demo__label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-trigger-demo__arrow {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  transition: transform 0.18s ease;
}

.model-selector-trigger-demo__arrow.is-open {
  transform: rotate(180deg);
}

@media (max-width: 480px) {
  .model-selector-trigger-demo__label,
  .model-selector-trigger-demo__arrow {
    display: none;
  }
}
</style>
