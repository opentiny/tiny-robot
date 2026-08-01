<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorEffortValue,
  type ModelSelectorFilterMethod,
  type ModelSelectorOption,
  type ModelSelectorValue,
} from '@opentiny/tiny-robot'
import { IconClaude, IconDeepseek, IconGemini, IconOllama, IconOpenai } from '@opentiny/tiny-robot-svgs'

const models = shallowRef<ModelSelectorOption[]>([
  {
    value: 'gpt-4.1',
    label: 'GPT-4.1',
    description: '稳定的通用与代码能力',
    icon: IconOpenai,
    group: 'cloud',
    groupLabel: '云端模型',
    keywords: ['openai', 'gpt', '代码', '通用'],
    efforts: true,
  },
  {
    value: 'claude-3.7-sonnet',
    label: 'Claude 3.7 Sonnet',
    description: '长文本与复杂分析',
    icon: IconClaude,
    group: 'cloud',
    groupLabel: '云端模型',
    keywords: ['anthropic', 'claude', '长文本', '分析'],
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: '多模态与长上下文',
    icon: IconGemini,
    group: 'cloud',
    groupLabel: '云端模型',
    keywords: ['google', 'gemini', '多模态'],
    efforts: true,
  },
  {
    value: 'deepseek-r1',
    label: 'DeepSeek R1',
    description: '专注数学和逻辑推理',
    icon: IconDeepseek,
    group: 'reasoning',
    groupLabel: '推理模型',
    keywords: ['deepseek', 'reasoning', '推理', '数学'],
    efforts: [
      { value: 'low', label: '快速' },
      { value: 'medium', label: '平衡' },
      { value: 'high', label: '深度', disabled: true },
    ],
  },
  {
    value: 'ollama-llama-3.3',
    label: 'Llama 3.3 (Ollama)',
    description: '本地运行，当前设备未启动',
    icon: IconOllama,
    disabled: true,
    group: 'local',
    groupLabel: '本地模型',
    keywords: ['ollama', 'llama', '本地'],
  },
])

const selectedValue = shallowRef<ModelSelectorValue>('deepseek-r1')
const effort = shallowRef<ModelSelectorEffortValue>('medium')

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
    <section class="model-selector-slots-demo__section">
      <h3 class="model-selector-slots-demo__title">Variant 与 Size</h3>
      <div class="model-selector-slots-demo__variants">
        <div class="model-selector-slots-demo__variant">
          <span class="model-selector-slots-demo__caption">outline / small</span>
          <TrModelSelector
            :models="models"
            default-value="gpt-4.1"
            variant="outline"
            size="small"
            :searchable="false"
          />
        </div>
        <div class="model-selector-slots-demo__variant">
          <span class="model-selector-slots-demo__caption">ghost / normal</span>
          <TrModelSelector
            :models="models"
            default-value="claude-3.7-sonnet"
            variant="ghost"
            size="normal"
            :searchable="false"
          />
        </div>
        <div class="model-selector-slots-demo__variant">
          <span class="model-selector-slots-demo__caption">muted / large</span>
          <TrModelSelector
            :models="models"
            default-value="gemini-2.5-pro"
            variant="muted"
            size="large"
            :searchable="false"
          />
        </div>
      </div>
    </section>

    <section class="model-selector-slots-demo__section">
      <h3 class="model-selector-slots-demo__title">完整插槽组合</h3>
      <p class="model-selector-slots-demo__description">
        搜索采用“所有关键词均命中”的自定义过滤；<code>v-model:effort</code> 由组件管理交互契约，footer
        插槽完整替换默认推理强度 UI。
      </p>

      <TrModelSelector
        v-model="selectedValue"
        v-model:effort="effort"
        :models="models"
        :filter-method="filterMethod"
        variant="muted"
        size="large"
        placeholder="选择工作模型"
        search-placeholder="例如：推理 数学"
        content-class="model-selector-slots-panel"
        :content-style="{ maxHeight: '420px' }"
      >
        <template #trigger="{ option, label, open, effortOption }">
          <span class="model-selector-slots-demo__custom-trigger">
            <component
              :is="option?.icon"
              v-if="option?.icon"
              class="model-selector-slots-demo__trigger-icon"
              aria-hidden="true"
              focusable="false"
            />
            <span class="model-selector-slots-demo__trigger-copy">
              <span class="model-selector-slots-demo__trigger-kicker">
                工作模型{{ effortOption ? ` · ${effortOption.label}` : '' }}
              </span>
              <span class="model-selector-slots-demo__trigger-label">{{ label }}</span>
            </span>
          </span>
          <span class="model-selector-slots-demo__trigger-state" aria-hidden="true">
            {{ open ? '收起' : '切换' }}
          </span>
        </template>

        <template #panel-header="{ query, close }">
          <div class="model-selector-slots-demo__panel-heading">
            <span class="model-selector-slots-demo__panel-copy">
              <strong class="model-selector-slots-demo__panel-title">选择工作模型</strong>
              <small class="model-selector-slots-demo__panel-hint">
                {{ query ? `正在筛选：${query}` : '可以按厂商或能力搜索' }}
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
            <strong class="model-selector-slots-demo__empty-title">没有找到“{{ query }}”</strong>
            <small class="model-selector-slots-demo__empty-hint">尝试厂商名、模型名或能力关键词。</small>
          </span>
        </template>

        <template #footer="{ close, efforts, effort: activeEffort, effortOption, setEffort }">
          <div class="model-selector-slots-demo__footer">
            <div class="model-selector-slots-demo__effort">
              <span class="model-selector-slots-demo__effort-label">
                Reasoning effort{{ effortOption ? ` · ${effortOption.label}` : '' }}
              </span>
              <div
                v-if="efforts.length > 0"
                class="model-selector-slots-demo__effort-options"
                role="group"
                aria-label="推理强度"
              >
                <button
                  v-for="option in efforts"
                  :key="option.value"
                  type="button"
                  class="model-selector-slots-demo__effort-option"
                  :class="{ 'is-active': activeEffort === option.value }"
                  :aria-pressed="activeEffort === option.value"
                  :disabled="option.disabled"
                  @click="setEffort(option.value)"
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
        当前值：<code>{{ String(selectedValue) }}</code
        >；<code>v-model:effort</code> 保留值：<code>{{ String(effort) }}</code>
      </p>
    </section>
  </div>
</template>

<style scoped>
.model-selector-slots-demo {
  display: grid;
  gap: 20px;
}

.model-selector-slots-demo__section {
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-slots-demo__title {
  margin: 0 0 14px;
  font-size: 16px;
}

.model-selector-slots-demo__description,
.model-selector-slots-demo__status {
  margin: -6px 0 16px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.model-selector-slots-demo__status {
  margin: 14px 0 0;
}

.model-selector-slots-demo__variants {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 18px;
}

.model-selector-slots-demo__variant {
  display: grid;
  gap: 7px;
}

.model-selector-slots-demo__caption {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.model-selector-slots-demo__custom-trigger,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-main,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  display: inline-flex;
  min-width: 0;
}

.model-selector-slots-demo__custom-trigger,
.model-selector-slots-demo__item-main {
  align-items: center;
  gap: 9px;
}

.model-selector-slots-demo__trigger-icon,
.model-selector-slots-demo__item-icon {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  font-size: 18px;
}

.model-selector-slots-demo__trigger-copy,
.model-selector-slots-demo__panel-copy,
.model-selector-slots-demo__item-copy,
.model-selector-slots-demo__effort {
  flex-direction: column;
}

.model-selector-slots-demo__trigger-kicker,
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

.model-selector-slots-demo__panel-copy {
  gap: 2px;
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

.model-selector-slots-demo__group-label {
  color: inherit;
}

.model-selector-slots-demo__item-copy {
  gap: 2px;
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

@media (max-width: 640px) {
  .model-selector-slots-demo__variants {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
