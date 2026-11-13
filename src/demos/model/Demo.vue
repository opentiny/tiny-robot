<script setup lang="ts">
import {
  TrModelSelector,
  type ModelSelectorOption,
  type ModelSelectorTriggerTextContext,
} from '@opentiny/tiny-robot'
import { IconAi, IconThink } from '@opentiny/tiny-robot-svgs'

const reasoningOptions = [
  { value: 'balanced', label: '均衡' },
  { value: 'deep', label: '深度' },
]
const models: ModelSelectorOption[] = [
  { id: 'general', label: '通用助手', description: '问答、写作与日常协作', group: '通用模型', icon: IconAi },
  { id: 'fast', label: '轻量助手', description: '快速整理与简短回复', group: '通用模型', icon: IconAi },
  {
    id: 'reasoner',
    label: '推理助手',
    description: '分析问题与组织复杂任务',
    group: '推理模型',
    icon: IconThink,
    features: [{ key: 'reasoning', label: '思考强度', type: 'select', options: reasoningOptions }],
  },
]

function renderTriggerText({ model, featureValues }: ModelSelectorTriggerTextContext) {
  const effort = reasoningOptions.find((option) => option.value === featureValues.reasoning)
  return effort ? `${model.label} · ${effort.label}` : model.label
}
</script>

<template>
  <div class="model-scene">
    <TrModelSelector
      default-value="general"
      :models="models"
      :close-on-select="false"
      :render-trigger-text="renderTriggerText"
      placement="bottom-start"
      searchable
    />
  </div>
</template>
