<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    value: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '推荐',
  },
  {
    value: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推荐',
  },
  {
    value: 'lightweight-model',
    label: '轻量模型',
    description: '低延迟，适合高频交互',
    group: '其他',
  },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-slots-demo">
    <TrModelSelector
      v-model="model"
      :models="models"
      searchable
      search-placeholder="搜索模型"
      panel-class="model-selector-custom-panel"
    >
      <template #header="{ query }">
        <div class="model-selector-slots-demo__header">
          <strong>选择工作模型</strong>
          <small>{{ query ? `正在搜索：${query}` : '根据当前任务选择合适的模型' }}</small>
        </div>
      </template>

      <template #item="{ option, selected }">
        <span class="model-selector-slots-demo__item">
          <span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.description }}</small>
          </span>
          <span v-if="selected" class="model-selector-slots-demo__selected">当前</span>
        </span>
      </template>

      <template #empty="{ query }">
        <span class="model-selector-slots-demo__empty"> 没有找到“{{ query }}”，请尝试其他关键词。 </span>
      </template>

      <template #footer="{ option, close }">
        <div class="model-selector-slots-demo__footer">
          <small>已选择：{{ option?.label ?? '暂无' }}</small>
          <button type="button" @click="close">完成</button>
        </div>
      </template>
    </TrModelSelector>
  </div>
</template>

<style scoped>
.model-selector-slots-demo {
  display: flex;
  min-height: 120px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-slots-demo__header,
.model-selector-slots-demo__item > span:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.model-selector-slots-demo__header small,
.model-selector-slots-demo__item small,
.model-selector-slots-demo__footer small,
.model-selector-slots-demo__empty {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.model-selector-slots-demo__item,
.model-selector-slots-demo__footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.model-selector-slots-demo__item strong,
.model-selector-slots-demo__item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-slots-demo__selected {
  flex: 0 0 auto;
  color: var(--vp-c-brand-1);
  font-size: 12px;
}

.model-selector-slots-demo__footer button {
  min-height: 28px;
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}
</style>
