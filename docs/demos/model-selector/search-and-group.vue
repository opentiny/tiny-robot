<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconAi, IconAtom, IconThink } from '@opentiny/tiny-robot-svgs'

const model = shallowRef<string | null>('general-pro')

const models = [
  {
    value: 'general-pro',
    label: '通用模型 Pro',
    description: '适合问答、写作和代码生成',
    group: '通用模型',
    icon: IconAi,
  },
  {
    value: 'general-fast',
    label: '通用模型 Fast',
    description: '低延迟，适合高频交互',
    group: '通用模型',
    icon: IconAtom,
  },
  {
    value: 'reasoning-pro',
    label: '推理模型 Pro',
    description: '适合数学和复杂分析',
    group: '推理模型',
    icon: IconThink,
  },
  {
    value: 'reasoning-preview',
    label: '推理模型 Preview',
    description: '当前工作区暂不可用',
    group: '推理模型',
    disabled: true,
    icon: IconThink,
  },
] satisfies readonly ModelSelectorOption[]
</script>

<template>
  <div class="model-selector-search-demo">
    <TrModelSelector v-model="model" :models="models" searchable search-placeholder="搜索名称、能力或分组" />
  </div>
</template>

<style scoped>
.model-selector-search-demo {
  display: flex;
  min-height: 120px;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
</style>
