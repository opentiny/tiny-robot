<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import {
  IconBailian,
  IconClaude,
  IconDeepseek,
  IconGemini,
  IconModelscope,
  IconOllama,
  IconOpenai,
  IconOpenrouter,
} from '@opentiny/tiny-robot-svgs'

const models = shallowRef<ModelSelectorOption[]>([
  {
    value: 'gpt-4.1',
    label: 'GPT-4.1',
    description: '通用对话与代码任务',
    icon: IconOpenai,
    group: 'frontier',
    groupLabel: '旗舰模型',
    keywords: ['openai', 'gpt', '代码'],
    efforts: true,
  },
  {
    value: 'claude-3.7-sonnet',
    label: 'Claude 3.7 Sonnet',
    description: '长文本分析与复杂推理',
    icon: IconClaude,
    group: 'frontier',
    groupLabel: '旗舰模型',
    keywords: ['anthropic', 'claude', '长文本'],
    efforts: [
      { value: 'low', label: '快速' },
      { value: 'medium', label: '平衡' },
      { value: 'high', label: '深度', disabled: true },
    ],
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: '多模态理解与长上下文',
    icon: IconGemini,
    group: 'frontier',
    groupLabel: '旗舰模型',
    keywords: ['google', 'gemini', '多模态'],
  },
  {
    value: 'deepseek-r1',
    label: 'DeepSeek R1',
    description: '面向推理任务的开源模型',
    icon: IconDeepseek,
    group: 'open-models',
    groupLabel: '开放模型与平台',
    keywords: ['deepseek', '推理', '开源'],
  },
  {
    value: 'qwen-max',
    label: 'Qwen Max',
    description: '通义千问旗舰模型',
    icon: IconBailian,
    group: 'open-models',
    groupLabel: '开放模型与平台',
    keywords: ['百炼', 'qwen', '通义千问'],
  },
  {
    value: 'modelscope-qwen',
    label: 'ModelScope Qwen',
    description: '从魔搭社区接入的模型',
    icon: IconModelscope,
    group: 'open-models',
    groupLabel: '开放模型与平台',
    keywords: ['魔搭', 'modelscope', 'qwen'],
  },
  {
    value: 'openrouter-auto',
    label: 'OpenRouter Auto',
    description: '当前环境暂不可用',
    icon: IconOpenrouter,
    disabled: true,
    group: 'open-models',
    groupLabel: '开放模型与平台',
    keywords: ['openrouter', 'router', '路由'],
  },
  {
    value: 'ollama-llama-3.3',
    label: 'Llama 3.3 (Ollama)',
    description: '本地运行，不上传提示词',
    icon: IconOllama,
    group: 'local',
    groupLabel: '本地模型',
    keywords: ['ollama', 'llama', '本地'],
  },
])

const lastChanged = shallowRef<ModelSelectorOption | null>(null)

function handleChange(option: ModelSelectorOption) {
  lastChanged.value = option
}
</script>

<template>
  <div class="model-selector-basic-demo">
    <TrModelSelector
      :models="models"
      default-value="gpt-4.1"
      default-effort="medium"
      placeholder="选择模型"
      search-placeholder="搜索名称、厂商或能力"
      empty-text="没有匹配的模型"
      aria-label="选择模型"
      search-aria-label="搜索模型"
      list-aria-label="可用模型"
      effort-label="推理强度"
      effort-aria-label="选择推理强度"
      @change="handleChange"
    />

    <p class="model-selector-basic-demo__status" aria-live="polite">
      <template v-if="lastChanged">
        最近一次用户选择：<strong class="model-selector-basic-demo__selection">{{ lastChanged.label }}</strong>
      </template>
      <template v-else> 当前使用非受控默认模型与推理强度；只有用户切换模型时才会触发 <code>change</code>。 </template>
    </p>
  </div>
</template>

<style scoped>
.model-selector-basic-demo {
  display: flex;
  min-height: 96px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-basic-demo__status {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.model-selector-basic-demo__selection {
  color: var(--vp-c-text-1);
}
</style>
