<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-model')

const models = [
  { value: 'general-model', label: '通用模型', icon: IconAi },
  { value: 'reasoning-model', label: '推理模型', icon: IconThink },
  { value: 'lightweight-model', label: '轻量模型', icon: IconAtom },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-basic-demo">
    <TrModelSelector v-model="model" :models="models" />
    <span aria-live="polite">当前模型：{{ model }}</span>
  </div>
</template>

<style scoped>
.model-selector-basic-demo {
  display: flex;
  min-height: 96px;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-basic-demo span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
