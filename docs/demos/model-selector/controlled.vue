<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption, type ModelSelectorValue } from '@opentiny/tiny-robot'
import { IconClaude, IconDeepseek, IconGemini, IconOpenai } from '@opentiny/tiny-robot-svgs'

const initialModels: readonly ModelSelectorOption[] = [
  {
    value: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'OpenAI 通用模型',
    icon: IconOpenai,
    keywords: ['openai', 'gpt'],
  },
  {
    value: 'claude-3.7-sonnet',
    label: 'Claude 3.7 Sonnet',
    description: 'Anthropic 长文本模型',
    icon: IconClaude,
    keywords: ['anthropic', 'claude'],
  },
  {
    value: 'deepseek-r1',
    label: 'DeepSeek R1',
    description: '推理模型',
    icon: IconDeepseek,
    keywords: ['deepseek', '推理'],
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Google 多模态模型',
    icon: IconGemini,
    keywords: ['google', 'gemini'],
  },
]

const models = shallowRef<ModelSelectorOption[]>([...initialModels])
const selectedValue = shallowRef<ModelSelectorValue>('claude-3.7-sonnet')
const open = shallowRef(false)
const eventLogs = shallowRef<string[]>([])
let logSequence = 0

const matchedOption = computed(() => {
  return models.value.find((model) => model.value === selectedValue.value) ?? null
})

function addLog(message: string) {
  logSequence += 1
  eventLogs.value = [`#${logSequence} ${message}`, ...eventLogs.value].slice(0, 8)
}

function handleValueUpdate(value: ModelSelectorValue) {
  addLog(`update:modelValue -> ${String(value)}`)
}

function handleOpenUpdate(nextOpen: boolean) {
  addLog(`update:open -> ${nextOpen}`)
}

function handleChange(option: ModelSelectorOption) {
  addLog(`change -> ${option.label}`)
}

function toggleOpenFromOutside() {
  open.value = !open.value
  addLog(`[外部赋值] open -> ${open.value}`)
}

function setMissingValue() {
  selectedValue.value = 'model-not-in-list'
  addLog('[外部赋值] modelValue -> model-not-in-list（不会触发 change）')
}

function removeCurrentModel() {
  if (!matchedOption.value) {
    return
  }

  const removedLabel = matchedOption.value.label
  models.value = models.value.filter((model) => model.value !== selectedValue.value)
  addLog(`[外部更新] 从 models 移除 ${removedLabel}（不会自动回退）`)
}

function restoreModels() {
  models.value = [...initialModels]
  addLog('[外部更新] 已恢复 models；保留当前 modelValue')
}

function resetDemo() {
  models.value = [...initialModels]
  selectedValue.value = 'claude-3.7-sonnet'
  open.value = false
  eventLogs.value = []
  logSequence = 0
}

function clearLogs() {
  eventLogs.value = []
}
</script>

<template>
  <div class="model-selector-controlled-demo">
    <div class="model-selector-controlled-demo__stage">
      <TrModelSelector
        v-model="selectedValue"
        v-model:open="open"
        :models="models"
        placeholder="当前值没有匹配模型"
        search-placeholder="搜索模型"
        @update:model-value="handleValueUpdate"
        @update:open="handleOpenUpdate"
        @change="handleChange"
      />

      <dl class="model-selector-controlled-demo__state">
        <div class="model-selector-controlled-demo__state-row">
          <dt class="model-selector-controlled-demo__state-key">modelValue</dt>
          <dd class="model-selector-controlled-demo__state-value">
            <code>{{ String(selectedValue) }}</code>
          </dd>
        </div>
        <div class="model-selector-controlled-demo__state-row">
          <dt class="model-selector-controlled-demo__state-key">匹配结果</dt>
          <dd class="model-selector-controlled-demo__state-value">
            {{ matchedOption?.label ?? '无匹配项，触发器显示 placeholder' }}
          </dd>
        </div>
        <div class="model-selector-controlled-demo__state-row">
          <dt class="model-selector-controlled-demo__state-key">open</dt>
          <dd class="model-selector-controlled-demo__state-value">
            <code>{{ open }}</code>
          </dd>
        </div>
      </dl>
    </div>

    <div class="model-selector-controlled-demo__actions" role="group" aria-label="外部状态控制">
      <button type="button" class="model-selector-controlled-demo__button" @click="toggleOpenFromOutside">
        {{ open ? '从外部关闭' : '从外部打开' }}
      </button>
      <button type="button" class="model-selector-controlled-demo__button" @click="setMissingValue">
        设为不存在的值
      </button>
      <button
        type="button"
        class="model-selector-controlled-demo__button"
        :disabled="!matchedOption"
        @click="removeCurrentModel"
      >
        移除当前模型
      </button>
      <button type="button" class="model-selector-controlled-demo__button" @click="restoreModels">恢复模型列表</button>
      <button type="button" class="model-selector-controlled-demo__button" @click="resetDemo">重置</button>
    </div>

    <div class="model-selector-controlled-demo__log" aria-live="polite">
      <div class="model-selector-controlled-demo__log-heading">
        <strong class="model-selector-controlled-demo__log-title">事件与外部操作</strong>
        <button type="button" class="model-selector-controlled-demo__button is-compact" @click="clearLogs">
          清空日志
        </button>
      </div>
      <ol v-if="eventLogs.length" class="model-selector-controlled-demo__log-list">
        <li v-for="entry in eventLogs" :key="entry" class="model-selector-controlled-demo__log-entry">
          {{ entry }}
        </li>
      </ol>
      <p v-else class="model-selector-controlled-demo__log-empty">
        尚无记录。用户选择时可观察 value 更新、change 与关闭请求的顺序。
      </p>
    </div>
  </div>
</template>

<style scoped>
.model-selector-controlled-demo {
  display: grid;
  gap: 16px;
}

.model-selector-controlled-demo__stage,
.model-selector-controlled-demo__log {
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.model-selector-controlled-demo__stage {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.model-selector-controlled-demo__state {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 8px;
  margin: 0;
}

.model-selector-controlled-demo__state-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
}

.model-selector-controlled-demo__state-key {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.model-selector-controlled-demo__state-value {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
}

.model-selector-controlled-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-selector-controlled-demo__button {
  min-height: 32px;
  padding: 5px 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}

.model-selector-controlled-demo__button:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.model-selector-controlled-demo__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.model-selector-controlled-demo__log-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.model-selector-controlled-demo__button.is-compact {
  min-height: 28px;
  padding: 3px 9px;
}

.model-selector-controlled-demo__log-list,
.model-selector-controlled-demo__log-empty {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.65;
}

.model-selector-controlled-demo__log-list {
  padding-left: 22px;
}

@media (max-width: 640px) {
  .model-selector-controlled-demo__stage {
    flex-direction: column;
  }

  .model-selector-controlled-demo__state {
    width: 100%;
  }

  .model-selector-controlled-demo__state-row {
    grid-template-columns: 80px minmax(0, 1fr);
  }
}
</style>
