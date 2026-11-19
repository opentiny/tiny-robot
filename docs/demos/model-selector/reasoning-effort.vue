<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorSnapshot,
  type ModelSelectorFeatureValues,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'

const low = { value: 'low', label: '低' }
const high = { value: 'high', label: '高' }
const models: ModelSelectorOption[] = [
  {
    id: 'a',
    label: '模型 A',
    features: [
      {
        key: 'reasoning',
        label: '思考强度',
        type: 'select',
        defaultValue: 'off',
        options: [{ value: 'off', label: '关闭' }, low, high, { value: 'extra-high', label: '超高' }],
      },
      { key: 'search', label: '联网搜索', type: 'switch' },
    ],
  },
  {
    id: 'b',
    label: '模型 B',
    features: [{ key: 'reasoning', label: '思考强度', type: 'select', defaultValue: 'low', options: [low, high] }],
  },
  {
    id: 'c',
    label: '模型 C',
    features: [
      {
        key: 'reasoning',
        label: '思考强度',
        type: 'select',
        options: [{ value: 'blocked', label: '暂不可用', disabled: true }, low, high],
      },
      { key: 'format', label: '输出格式', type: 'select', options: [] },
    ],
  },
]

const initialFeatureValues = { reasoning: 'extra-high', search: true }
const featureValues = shallowRef<ModelSelectorFeatureValues>(initialFeatureValues)
const demoVersion = shallowRef(0)
const panelHost = shallowRef<HTMLElement>()

function handleChange(current: ModelSelectorSnapshot) {
  featureValues.value = current.featureValues
}

function reset() {
  demoVersion.value += 1
  featureValues.value = initialFeatureValues
}
</script>

<template>
  <div class="model-selector-feature-demo-container">
    <div class="model-selector-feature-demo">
      <div class="model-selector-feature-demo__result">
        <div>当前模型的有效值 · featureValues</div>
        <pre aria-live="polite">{{ JSON.stringify(featureValues, null, 2) }}</pre>
      </div>
      <div class="model-selector-feature-demo__actions">
        <TrModelSelector
          :key="demoVersion"
          default-value="a"
          :models="models"
          :default-feature-values="initialFeatureValues"
          :close-on-select="false"
          :append-to="panelHost"
          @change="handleChange"
        />
        <button type="button" @click="reset">重置示例</button>
        <div ref="panelHost" class="model-selector-feature-demo__panel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-selector-feature-demo-container {
  container-type: inline-size;
}

.model-selector-feature-demo {
  display: flex;
  flex-flow: row-reverse wrap;
  align-items: flex-start;
  gap: 16px;
}

.model-selector-feature-demo__actions {
  display: flex;
  flex: 1 1 256px;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.model-selector-feature-demo__result {
  flex: 1 1 200px;
  min-width: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.model-selector-feature-demo__result pre {
  margin: 4px 0 0;
  padding: 8px 12px;
  overflow-wrap: anywhere;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  white-space: pre-wrap;
}

.model-selector-feature-demo__panel:empty {
  display: none;
}

.model-selector-feature-demo__panel {
  position: absolute;
}

@container (width < 472px) {
  .model-selector-feature-demo__panel {
    position: static;
    flex-basis: 100%;
    min-width: 0;
  }

  .model-selector-feature-demo__panel :deep(.tr-model-selector__dropdown-wrapper) {
    position: static;
    max-width: 100% !important;
  }

  .model-selector-feature-demo__panel :deep(.tr-model-selector__panel) {
    --tr-model-selector-available-height: min(480px, 75vh);
    --tr-model-selector-available-width: 100%;
  }
}
</style>
