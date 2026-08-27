<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector } from '@opentiny/tiny-robot'
import { modelSelectorDemoModels } from './demo-models'

const model = shallowRef<string | null>('qwen3.7-plus')

function setInvalidValue() {
  model.value = 'retired-model'
}

function restoreValue() {
  model.value = 'qwen3.7-plus'
}
</script>

<template>
  <div class="model-selector-controlled-demo">
    <div class="model-selector-controlled-demo__selector">
      <TrModelSelector v-model="model" :models="modelSelectorDemoModels" placeholder="当前值没有匹配模型" searchable />

      <div class="model-selector-controlled-demo__actions">
        <button type="button" @click="setInvalidValue">设置不存在的值</button>
        <button type="button" @click="restoreValue">恢复有效值</button>
      </div>
    </div>

    <p class="model-selector-controlled-demo__state" aria-live="polite">
      当前值：<code>{{ model }}</code>
    </p>
  </div>
</template>

<style scoped>
.model-selector-controlled-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-controlled-demo__selector {
  display: flex;
  gap: 8px;
}

.model-selector-controlled-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-selector-controlled-demo__actions button {
  padding: 5px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 12px;
}

.model-selector-controlled-demo__actions button:hover {
  border-color: var(--vp-c-brand-1);
}

.model-selector-controlled-demo__state {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
