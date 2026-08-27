<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorReasoningEffortOption,
  type ModelSelectorFilterMethod,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek } from '@opentiny/tiny-robot-svgs'

const providerBases = {
  deepseek: {
    icon: IconDeepseek,
    group: 'deepseek-v4',
    groupLabel: 'DeepSeek V4',
  },
  qwen: {
    icon: IconBailian,
    group: 'qwen',
    groupLabel: 'Qwen',
  },
} as const

const modelRows = [
  {
    provider: 'deepseek',
    value: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    description: '预览版 · 1M 上下文 · 最大输出 384K',
    keywords: ['preview', '推理', 'reasoning', 'agent', '代码'],
    reasoningEfforts: [
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'deepseek',
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    description: 'V4-Flash-0731 Public Beta · 1M 上下文 · 最大输出 384K',
    keywords: ['推理', 'reasoning', '低成本'],
    reasoningEfforts: [
      ['low', 'Low'],
      ['high', 'High'],
      ['max', 'Max'],
    ],
  },
  {
    provider: 'qwen',
    value: 'qwen3.8-max-preview',
    label: 'Qwen3.8 Max Preview',
    description: '需 Token Plan（本示例禁用） · 推理与视觉理解 · 1M 上下文',
    disabled: true,
    keywords: ['百炼', '通义千问', 'qwencloud', 'dashscope'],
    reasoningEfforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-max',
    label: 'Qwen3.7 Max',
    description: '纯文本旗舰 · 1M 上下文 · 最大输出 131K',
    keywords: ['百炼', '通义千问', 'dashscope', '推理', 'reasoning', 'agent', '代码'],
    reasoningEfforts: undefined,
  },
  {
    provider: 'qwen',
    value: 'qwen3.7-plus',
    label: 'Qwen3.7 Plus',
    description: '图像、文本与视频输入 · 1M 上下文 · 最大输出 131K',
    keywords: ['百炼', '通义千问', 'dashscope', '多模态', '推理', 'reasoning'],
    reasoningEfforts: undefined,
  },
] as const

const models = modelRows.map(({ provider, reasoningEfforts, ...row }) => ({
  ...row,
  ...providerBases[provider],
  ...(reasoningEfforts
    ? {
        reasoningEfforts: reasoningEfforts.map(([value, label]) => ({
          value,
          label,
        })) satisfies readonly ModelSelectorReasoningEffortOption[],
      }
    : {}),
})) satisfies readonly ModelSelectorOption[]

const model = shallowRef<string | null>('deepseek-v4-flash')
const reasoningEffort = shallowRef<string | null>('high')

const filterMethod: ModelSelectorFilterMethod = (query, option) => {
  const searchText = [
    option.label,
    option.value,
    option.description,
    option.group,
    option.groupLabel,
    ...(option.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()

  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .every((keyword) => searchText.includes(keyword))
}
</script>

<template>
  <div class="model-selector-slots-demo">
    <h3 class="model-selector-slots-demo__title">完整插槽组合</h3>
    <TrModelSelector
      v-model="model"
      v-model:reasoning-effort="reasoningEffort"
      :models="models"
      :filter-method="filterMethod"
      searchable
      variant="muted"
      size="large"
      placeholder="选择工作模型"
      search-placeholder="例如：推理 数学"
      content-class="model-selector-slots-panel"
      :content-style="{ maxHeight: '420px' }"
    >
      <template #trigger="{ option, label, open, reasoningEffortOption }">
        <span class="model-selector-slots-demo__trigger">
          <component
            :is="option?.icon"
            v-if="option?.icon"
            class="model-selector-slots-demo__trigger-icon"
            aria-hidden="true"
            focusable="false"
          />
          <span class="model-selector-slots-demo__trigger-copy">
            <span class="model-selector-slots-demo__trigger-meta">
              工作模型{{ reasoningEffortOption ? ` · ${reasoningEffortOption.label}` : '' }}
            </span>
            <span class="model-selector-slots-demo__trigger-label">{{ label }}</span>
          </span>
          <span class="model-selector-slots-demo__trigger-state" aria-hidden="true">
            {{ open ? '收起' : '切换' }}
          </span>
        </span>
      </template>

      <template #panel-header="{ query, close }">
        <div class="model-selector-slots-demo__panel-heading">
          <span class="model-selector-slots-demo__panel-copy">
            <strong>选择工作模型</strong>
            <small class="model-selector-slots-demo__panel-hint">
              {{ query ? `正在筛选：${query}` : '可以按厂商、能力或关键词搜索' }}
            </small>
          </span>
          <button type="button" class="model-selector-slots-demo__close" @click="close">关闭</button>
        </div>
      </template>

      <template #group-label="{ label, models: groupModels }">
        <span class="model-selector-slots-demo__group-label">
          <span>{{ label }}</span>
          <span>{{ groupModels.length }} 项</span>
        </span>
      </template>

      <template #item="{ option, selected, highlighted, disabled }">
        <span class="model-selector-slots-demo__item">
          <span class="model-selector-slots-demo__item-main">
            <component
              :is="option.icon"
              v-if="option.icon"
              class="model-selector-slots-demo__item-icon"
              aria-hidden="true"
              focusable="false"
            />
            <span class="model-selector-slots-demo__item-copy">
              <span class="model-selector-slots-demo__item-label">{{ option.label }}</span>
              <span class="model-selector-slots-demo__item-description">{{ option.description }}</span>
            </span>
          </span>
          <span class="model-selector-slots-demo__item-state" aria-hidden="true">
            {{ disabled ? '不可用' : selected ? '当前' : highlighted ? 'Enter 选择' : '' }}
          </span>
        </span>
      </template>

      <template #empty="{ query }">
        <span class="model-selector-slots-demo__empty">
          <strong>没有找到“{{ query }}”</strong>
          <small class="model-selector-slots-demo__empty-hint">尝试厂商名、模型名或能力关键词。</small>
        </span>
      </template>

      <template
        #footer="{
          close,
          reasoningEfforts,
          reasoningEffort: activeReasoningEffort,
          reasoningEffortOption,
          setReasoningEffort,
        }"
      >
        <div class="model-selector-slots-demo__footer">
          <div class="model-selector-slots-demo__effort">
            <span class="model-selector-slots-demo__effort-label">
              Reasoning effort{{ reasoningEffortOption ? ` · ${reasoningEffortOption.label}` : '' }}
            </span>
            <div
              v-if="reasoningEfforts.length > 0"
              class="model-selector-slots-demo__effort-options"
              role="group"
              aria-label="推理强度"
            >
              <button
                v-for="option in reasoningEfforts"
                :key="option.value"
                type="button"
                class="model-selector-slots-demo__effort-option"
                :class="{ 'is-active': activeReasoningEffort === option.value }"
                :aria-pressed="activeReasoningEffort === option.value"
                :disabled="option.disabled"
                @click="setReasoningEffort(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <span v-else class="model-selector-slots-demo__effort-empty">当前模型未声明推理强度</span>
          </div>
          <button type="button" class="model-selector-slots-demo__done" @click="close">完成</button>
        </div>
      </template>
    </TrModelSelector>

    <p class="model-selector-slots-demo__status" aria-live="polite">
      当前值：<code>{{ String(model) }}</code
      >；<code>v-model:reasoning-effort</code> 保留值：<code>{{ String(reasoningEffort) }}</code>
    </p>
  </div>
</template>

<style scoped>
.model-selector-slots-demo {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-slots-demo__title {
  margin: 0;
  font-size: 16px;
}

.model-selector-slots-demo__status {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.model-selector-slots-demo__trigger,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-main,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  display: inline-flex;
  min-width: 0;
}

.model-selector-slots-demo__trigger,
.model-selector-slots-demo__item-main {
  align-items: center;
  gap: 9px;
}

.model-selector-slots-demo__trigger {
  width: 100%;
}

.model-selector-slots-demo__trigger-icon,
.model-selector-slots-demo__item-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.model-selector-slots-demo__trigger-copy,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  flex-direction: column;
}

.model-selector-slots-demo__trigger-copy,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-copy {
  gap: 2px;
}

.model-selector-slots-demo__trigger-meta,
.model-selector-slots-demo__item-description,
.model-selector-slots-demo__panel-hint,
.model-selector-slots-demo__effort-label,
.model-selector-slots-demo__effort-empty {
  color: var(--vp-c-text-2);
  font-size: 11px;
  line-height: 1.35;
}

.model-selector-slots-demo__trigger-label,
.model-selector-slots-demo__item-label,
.model-selector-slots-demo__item-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-selector-slots-demo__trigger-label,
.model-selector-slots-demo__item-label {
  color: var(--vp-c-text-1);
}

.model-selector-slots-demo__trigger-state,
.model-selector-slots-demo__item-state {
  flex: 0 0 auto;
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.model-selector-slots-demo__panel-heading,
.model-selector-slots-demo__group-label,
.model-selector-slots-demo__item,
.model-selector-slots-demo__footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.model-selector-slots-demo__close,
.model-selector-slots-demo__done,
.model-selector-slots-demo__effort-option {
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
}

.model-selector-slots-demo__close,
.model-selector-slots-demo__done {
  min-height: 28px;
  padding: 3px 9px;
  font-size: 12px;
}

.model-selector-slots-demo__empty {
  display: grid;
  gap: 5px;
}

.model-selector-slots-demo__empty-hint {
  color: var(--vp-c-text-2);
}

.model-selector-slots-demo__footer {
  align-items: flex-end;
}

.model-selector-slots-demo__effort {
  gap: 6px;
}

.model-selector-slots-demo__effort-options {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.model-selector-slots-demo__effort-option {
  min-width: 30px;
  min-height: 26px;
  padding: 2px 7px;
  font-size: 12px;
}

.model-selector-slots-demo__effort-option.is-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.model-selector-slots-demo__effort-option:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

:global(.model-selector-slots-panel) {
  box-shadow: 0 16px 48px rgb(0 0 0 / 16%);
}
</style>
