<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from 'vue'
import { TrModelSelector } from '@opentiny/tiny-robot'
import type { ModelSelectorReasoningEffortOption, ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconDeepseek } from '@opentiny/tiny-robot-svgs'

interface SelectorEventLog {
  updates: number
  changes: number
  openUpdates: number
  lastValue: string | null
  lastChange: string
  lastOpen: boolean | null
}

interface EffortEventLog {
  updates: number
  changes: number
  lastValue: string | null
  lastChange: string | null
  sequence: string[]
}

function createEventLog(): SelectorEventLog {
  return reactive({
    updates: 0,
    changes: 0,
    openUpdates: 0,
    lastValue: null,
    lastChange: '',
    lastOpen: null,
  })
}

function createEffortEventLog(): EffortEventLog {
  return reactive({
    updates: 0,
    changes: 0,
    lastValue: null,
    lastChange: null,
    sequence: [],
  })
}

function recordValue(log: SelectorEventLog, value: string | null) {
  log.updates += 1
  log.lastValue = value
}

function recordChange(log: SelectorEventLog, option: ModelSelectorOption) {
  log.changes += 1
  log.lastChange = option.value
}

function recordOpen(log: SelectorEventLog, open: boolean) {
  log.openUpdates += 1
  log.lastOpen = open
}

function recordEffortValue(log: EffortEventLog, value: string | null) {
  log.updates += 1
  log.lastValue = value
  log.sequence.push(`update:${value ?? 'null'}`)
}

function recordEffortChange(log: EffortEventLog, option: ModelSelectorReasoningEffortOption | null) {
  log.changes += 1
  log.lastChange = option?.value ?? null
  log.sequence.push(`change:${option?.value ?? 'null'}`)
}

const models: readonly ModelSelectorOption[] = [
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Fast multimodal model',
    group: 'OpenAI',
    icon: 'https://example.com/model.svg',
  },
  {
    value: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'Precise coding model',
    group: 'OpenAI',
    icon: IconDeepseek,
  },
  {
    value: 'claude-sonnet',
    label: 'Claude Sonnet',
    description: 'Balanced reasoning model',
    group: 'Anthropic',
  },
  {
    value: 'claude-haiku',
    label: 'Claude Haiku',
    description: 'Unavailable compact model',
    disabled: true,
    group: 'Anthropic',
  },
  {
    value: 'deepseek-r1',
    label: 'DeepSeek R1',
    description: 'Open reasoning model',
    group: 'Open Source',
  },
]

const compactModels = models.slice(0, 3)
const minimalModels: readonly ModelSelectorOption[] = [
  { value: 'minimal-reasoning', label: 'Minimal Reasoning', reasoningEfforts: true },
  { value: 'minimal-plain', label: 'Minimal Plain' },
]
const customFilterModels: readonly ModelSelectorOption[] = [
  { value: 'custom-alpha', label: 'First Model', description: 'Ordinary choice' },
  { value: 'custom-beta', label: 'Second Model', description: 'Only the custom filter finds this value' },
]
const effortModels: readonly ModelSelectorOption[] = [
  {
    value: 'reasoning-default',
    label: 'Reasoning Default',
    description: 'Uses the default effort levels',
    reasoningEfforts: true,
  },
  {
    value: 'reasoning-custom',
    label: 'Reasoning Custom',
    description: 'Uses custom effort levels',
    reasoningEfforts: [
      { value: 'minimal', label: 'Minimal' },
      { value: 'medium', label: 'Medium' },
      { value: 'maximum', label: 'Maximum', disabled: true },
      { value: 'medium', label: 'Duplicate Medium' },
    ],
  },
  {
    value: 'plain-model',
    label: 'Plain Model',
    description: 'Does not support configurable effort',
  },
  {
    value: 'disabled-reasoning',
    label: 'Disabled Reasoning',
    description: 'Disabled model with effort metadata',
    disabled: true,
    reasoningEfforts: true,
  },
]

const logs = {
  init: createEventLog(),
  async: createEventLog(),
  uncontrolled: createEventLog(),
  controlled: createEventLog(),
  blocked: createEventLog(),
  keyboard: createEventLog(),
  slots: createEventLog(),
  defaultOpen: createEventLog(),
  effortUncontrolled: createEffortEventLog(),
  effortControlled: createEffortEventLog(),
  effortBlocked: createEffortEventLog(),
}

const asyncModels = ref<readonly ModelSelectorOption[]>([])
const controlledValue = ref<string | null>('gpt-4o')
const controlledOpen = ref(false)
const controlledModelRemoved = ref(false)
const blockedValue = ref<string | null>('gpt-4o')
const blockedOpen = ref(false)
const controlledModels = computed(() =>
  controlledModelRemoved.value ? models.filter((option) => option.value !== 'gpt-4o') : models,
)
const initiallyUndefinedValue = shallowRef<string | null | undefined>(undefined)
const initiallyUndefinedOpen = shallowRef<boolean | undefined>(undefined)
const initiallyUndefinedEffort = shallowRef<string | null | undefined>(undefined)
const blockedEffort = shallowRef<string | null>('medium')

function primeInitiallyUndefinedSelector() {
  initiallyUndefinedValue.value = 'reasoning-default'
  initiallyUndefinedEffort.value = 'high'
  initiallyUndefinedOpen.value = true
}

function showDisabledEffortModel() {
  initiallyUndefinedValue.value = 'disabled-reasoning'
  initiallyUndefinedEffort.value = 'high'
  initiallyUndefinedOpen.value = true
}

function handleControlledValue(value: string | null) {
  recordValue(logs.controlled, value)
  controlledValue.value = value
}

function handleControlledOpen(open: boolean) {
  recordOpen(logs.controlled, open)
  controlledOpen.value = open
}

function setControlledInvalid() {
  controlledValue.value = 'retired-model'
}

function removeControlledModel() {
  controlledModelRemoved.value = true
}

function restoreControlledModel() {
  controlledModelRemoved.value = false
}

function customFilter(query: string, option: ModelSelectorOption) {
  return query.trim().toLocaleLowerCase() === 'featured' && option.value === 'custom-beta'
}

const slotHeaderActivations = ref(0)
const slotFooterActivations = ref(0)
const rapidOpen = ref(false)
const showDefaultOpenSelector = ref(false)

async function rapidOpenClose() {
  rapidOpen.value = true
  await nextTick()
  rapidOpen.value = false
}

const isDark = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-tr-color-mode', isDark.value ? 'dark' : 'light')
}

onBeforeUnmount(() => {
  document.documentElement.removeAttribute('data-tr-color-mode')
})
</script>

<template>
  <div class="model-selector-test">
    <header class="model-selector-test__intro">
      <div>
        <h2>ModelSelector 组件测试</h2>
        <p>验证状态契约、effort、搜索分组、键盘与 ARIA、slots 以及浮层边界。</p>
      </div>
      <button data-testid="dark-mode-toggle" type="button" @click="toggleDarkMode">
        {{ isDark ? 'Use light mode' : 'Use dark mode' }}
      </button>
    </header>

    <button data-testid="outside-action" type="button">Outside action</button>

    <section class="model-selector-test__section" data-testid="init-section">
      <h3>初始化与异步 models</h3>
      <div class="model-selector-test__row">
        <TrModelSelector
          data-testid="init-selector"
          :models="models"
          searchable
          @update:model-value="recordValue(logs.init, $event)"
          @change="recordChange(logs.init, $event)"
          @update:open="recordOpen(logs.init, $event)"
        />

        <button data-testid="load-async-models" type="button" @click="asyncModels = models">Load async models</button>
        <TrModelSelector
          data-testid="async-selector"
          :models="asyncModels"
          @update:model-value="recordValue(logs.async, $event)"
          @change="recordChange(logs.async, $event)"
          @update:open="recordOpen(logs.async, $event)"
        />
      </div>
      <div class="model-selector-test__metrics">
        <output data-testid="init-updates">{{ logs.init.updates }}</output>
        <output data-testid="init-changes">{{ logs.init.changes }}</output>
        <output data-testid="async-updates">{{ logs.async.updates }}</output>
        <output data-testid="async-changes">{{ logs.async.changes }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="minimal-section">
      <h3>最小数据与可访问名称回退</h3>
      <div class="model-selector-test__row">
        <TrModelSelector
          data-testid="minimal-fallback-selector"
          :models="minimalModels"
          model-value="minimal-reasoning"
          reasoning-effort="medium"
          placeholder="Choose compact model"
          search-placeholder="Find compact model"
          reasoning-effort-label="Thinking level"
        />
        <TrModelSelector
          data-testid="minimal-explicit-selector"
          :models="minimalModels"
          model-value="minimal-reasoning"
          reasoning-effort="medium"
          searchable
          placeholder="Ignored selector fallback"
          search-placeholder="Ignored search fallback"
          reasoning-effort-label="Ignored effort fallback"
        />
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="uncontrolled-section">
      <h3>非受控 value/open</h3>
      <TrModelSelector
        data-testid="uncontrolled-selector"
        :models="models"
        searchable
        default-value="claude-sonnet"
        @update:model-value="recordValue(logs.uncontrolled, $event)"
        @change="recordChange(logs.uncontrolled, $event)"
        @update:open="recordOpen(logs.uncontrolled, $event)"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="uncontrolled-updates">{{ logs.uncontrolled.updates }}</output>
        <output data-testid="uncontrolled-changes">{{ logs.uncontrolled.changes }}</output>
        <output data-testid="uncontrolled-last-value">{{ logs.uncontrolled.lastValue ?? 'null' }}</output>
        <output data-testid="uncontrolled-open-updates">{{ logs.uncontrolled.openUpdates }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="controlled-section">
      <h3>受控 value/open 与无效值</h3>
      <div class="model-selector-test__controls">
        <button data-testid="controlled-open" type="button" @click="controlledOpen = true">External open</button>
        <button data-testid="controlled-close" type="button" @click="controlledOpen = false">External close</button>
        <button data-testid="controlled-invalid" type="button" @click="setControlledInvalid">Set invalid</button>
        <button data-testid="controlled-remove" type="button" @click="removeControlledModel">Remove selected</button>
        <button data-testid="controlled-restore" type="button" @click="restoreControlledModel">Restore selected</button>
        <button data-testid="controlled-reset" type="button" @click="controlledValue = 'gpt-4o'">Reset value</button>
      </div>
      <TrModelSelector
        data-testid="controlled-selector"
        :models="controlledModels"
        :model-value="controlledValue"
        :open="controlledOpen"
        searchable
        @update:model-value="handleControlledValue"
        @change="recordChange(logs.controlled, $event)"
        @update:open="handleControlledOpen"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="controlled-value">{{ controlledValue ?? 'null' }}</output>
        <output data-testid="controlled-open-state">{{ controlledOpen }}</output>
        <output data-testid="controlled-updates">{{ logs.controlled.updates }}</output>
        <output data-testid="controlled-changes">{{ logs.controlled.changes }}</output>
        <output data-testid="controlled-open-updates">{{ logs.controlled.openUpdates }}</output>
      </div>

      <div class="model-selector-test__controls">
        <button data-testid="blocked-force-open" type="button" @click="blockedOpen = true">Force blocked open</button>
        <button data-testid="blocked-force-close" type="button" @click="blockedOpen = false">
          Force blocked close
        </button>
      </div>
      <TrModelSelector
        data-testid="blocked-selector"
        :models="controlledModels"
        :model-value="blockedValue"
        :open="blockedOpen"
        searchable
        @update:model-value="recordValue(logs.blocked, $event)"
        @change="recordChange(logs.blocked, $event)"
        @update:open="recordOpen(logs.blocked, $event)"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="blocked-value">{{ blockedValue }}</output>
        <output data-testid="blocked-open-state">{{ blockedOpen }}</output>
        <output data-testid="blocked-updates">{{ logs.blocked.updates }}</output>
        <output data-testid="blocked-changes">{{ logs.blocked.changes }}</output>
        <output data-testid="blocked-open-updates">{{ logs.blocked.openUpdates }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="effort-section">
      <h3>Reasoning effort</h3>

      <TrModelSelector
        data-testid="effort-uncontrolled-selector"
        :models="effortModels"
        :searchable="false"
        default-value="reasoning-default"
        default-reasoning-effort="medium"
        @update:reasoning-effort="recordEffortValue(logs.effortUncontrolled, $event)"
        @reasoning-effort-change="recordEffortChange(logs.effortUncontrolled, $event)"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="effort-uncontrolled-updates">{{ logs.effortUncontrolled.updates }}</output>
        <output data-testid="effort-uncontrolled-changes">{{ logs.effortUncontrolled.changes }}</output>
        <output data-testid="effort-uncontrolled-value">{{ logs.effortUncontrolled.lastValue ?? 'null' }}</output>
        <output data-testid="effort-uncontrolled-sequence">{{ logs.effortUncontrolled.sequence.join(' > ') }}</output>
      </div>

      <TrModelSelector
        data-testid="effort-blocked-selector"
        :models="effortModels"
        :searchable="false"
        model-value="reasoning-default"
        :reasoning-effort="blockedEffort"
        @update:reasoning-effort="recordEffortValue(logs.effortBlocked, $event)"
        @reasoning-effort-change="recordEffortChange(logs.effortBlocked, $event)"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="effort-blocked-raw">{{ blockedEffort }}</output>
        <output data-testid="effort-blocked-updates">{{ logs.effortBlocked.updates }}</output>
        <output data-testid="effort-blocked-changes">{{ logs.effortBlocked.changes }}</output>
        <output data-testid="effort-blocked-sequence">{{ logs.effortBlocked.sequence.join(' > ') }}</output>
      </div>

      <div class="model-selector-test__controls">
        <button data-testid="undefined-controlled-prime" type="button" @click="primeInitiallyUndefinedSelector">
          Set initially undefined models
        </button>
        <button data-testid="undefined-controlled-disabled" type="button" @click="showDisabledEffortModel">
          Show disabled effort model
        </button>
      </div>
      <TrModelSelector
        v-model="initiallyUndefinedValue"
        v-model:open="initiallyUndefinedOpen"
        v-model:reasoning-effort="initiallyUndefinedEffort"
        data-testid="effort-controlled-selector"
        :models="effortModels"
        :searchable="false"
        @update:reasoning-effort="recordEffortValue(logs.effortControlled, $event)"
        @reasoning-effort-change="recordEffortChange(logs.effortControlled, $event)"
      >
        <template #trigger="{ label, reasoningEffortOption }">
          <span data-testid="effort-controlled-trigger-slot">
            {{ label }}|{{ reasoningEffortOption?.value ?? 'null' }}|{{ reasoningEffortOption?.label ?? 'null' }}
          </span>
        </template>
        <template #footer="{ reasoningEfforts, reasoningEffortOption, setReasoningEffort, close }">
          <div data-testid="effort-custom-footer">
            <output data-testid="effort-footer-count">{{ reasoningEfforts.length }}</output>
            <output data-testid="effort-footer-value">{{ reasoningEffortOption?.value ?? 'null' }}</output>
            <output data-testid="effort-footer-option">{{ reasoningEffortOption?.label ?? 'null' }}</output>
            <button data-testid="effort-footer-medium" type="button" @click="setReasoningEffort('medium')">
              Medium
            </button>
            <button data-testid="effort-footer-high" type="button" @click="setReasoningEffort('high')">High</button>
            <button data-testid="effort-footer-low" type="button" @click="setReasoningEffort('low')">Low</button>
            <button data-testid="effort-footer-close" type="button" @click="close">Close effort panel</button>
          </div>
        </template>
      </TrModelSelector>
      <div class="model-selector-test__metrics">
        <output data-testid="effort-controlled-model">
          {{ initiallyUndefinedValue === undefined ? 'undefined' : String(initiallyUndefinedValue) }}
        </output>
        <output data-testid="effort-controlled-open">
          {{ initiallyUndefinedOpen === undefined ? 'undefined' : String(initiallyUndefinedOpen) }}
        </output>
        <output data-testid="effort-controlled-raw">
          {{ initiallyUndefinedEffort === undefined ? 'undefined' : String(initiallyUndefinedEffort) }}
        </output>
        <output data-testid="effort-controlled-updates">{{ logs.effortControlled.updates }}</output>
        <output data-testid="effort-controlled-changes">{{ logs.effortControlled.changes }}</output>
        <output data-testid="effort-controlled-sequence">{{ logs.effortControlled.sequence.join(' > ') }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="filter-section">
      <h3>自定义过滤</h3>
      <TrModelSelector
        data-testid="custom-filter-selector"
        :models="customFilterModels"
        :filter-method="customFilter"
        searchable
      />
    </section>

    <section class="model-selector-test__section" data-testid="keyboard-section">
      <h3>无搜索键盘导航</h3>
      <TrModelSelector
        data-testid="keyboard-selector"
        :models="models"
        :searchable="false"
        @update:model-value="recordValue(logs.keyboard, $event)"
        @change="recordChange(logs.keyboard, $event)"
        @update:open="recordOpen(logs.keyboard, $event)"
      />
      <div class="model-selector-test__metrics">
        <output data-testid="keyboard-updates">{{ logs.keyboard.updates }}</output>
        <output data-testid="keyboard-changes">{{ logs.keyboard.changes }}</output>
        <output data-testid="keyboard-last-value">{{ logs.keyboard.lastValue ?? 'null' }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="slots-section">
      <h3>Slots 与辅助控件</h3>
      <TrModelSelector
        data-testid="slot-selector"
        :models="models"
        default-value="gpt-4o"
        searchable
        variant="ghost"
        size="small"
        panel-class="model-selector-test__custom-content"
        @update:model-value="recordValue(logs.slots, $event)"
        @change="recordChange(logs.slots, $event)"
        @update:open="recordOpen(logs.slots, $event)"
      >
        <template #trigger="{ label, open }">
          <span data-testid="slot-trigger-content">{{ open ? 'Opened' : 'Closed' }}: {{ label }}</span>
        </template>
        <template #header>
          <button data-testid="slot-header-action" type="button" @click="slotHeaderActivations += 1">
            Header action
          </button>
        </template>
        <template #item="{ option, selected }">
          <span :data-testid="`slot-item-${option.value}`">
            Custom {{ option.label }}{{ selected ? ' selected' : '' }}{{ option.disabled ? ' disabled' : '' }}
          </span>
        </template>
        <template #empty="{ query }">
          <span data-testid="slot-empty">Nothing matches {{ query }}</span>
        </template>
        <template #footer="{ close }">
          <button data-testid="slot-footer-action" type="button" @click="slotFooterActivations += 1">
            Footer action
          </button>
          <button data-testid="slot-footer-close" type="button" @click="close">Close from footer</button>
        </template>
      </TrModelSelector>
      <div class="model-selector-test__metrics">
        <output data-testid="slot-header-activations">{{ slotHeaderActivations }}</output>
        <output data-testid="slot-footer-activations">{{ slotFooterActivations }}</output>
        <output data-testid="slot-updates">{{ logs.slots.updates }}</output>
        <output data-testid="slot-changes">{{ logs.slots.changes }}</output>
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="multiple-section">
      <h3>多实例与 outside click</h3>
      <div class="model-selector-test__row">
        <TrModelSelector data-testid="primary-selector" :models="compactModels" />
        <TrModelSelector data-testid="secondary-selector" :models="compactModels" />
        <TrModelSelector data-testid="invalid-append-to-selector" :models="compactModels" append-to="[" />
      </div>
    </section>

    <section class="model-selector-test__section" data-testid="lifecycle-section">
      <h3>defaultOpen 与快速开关</h3>
      <div class="model-selector-test__controls">
        <button data-testid="mount-default-open" type="button" @click="showDefaultOpenSelector = true">
          Mount default open
        </button>
        <button data-testid="rapid-open-close" type="button" @click="rapidOpenClose">Rapid open close</button>
      </div>
      <TrModelSelector
        v-if="showDefaultOpenSelector"
        data-testid="default-open-selector"
        :models="compactModels"
        default-open
        searchable
        @update:open="recordOpen(logs.defaultOpen, $event)"
      />
      <TrModelSelector
        data-testid="rapid-selector"
        :models="compactModels"
        :open="rapidOpen"
        @update:open="rapidOpen = $event"
      />
      <output data-testid="default-open-updates">{{ logs.defaultOpen.openUpdates }}</output>
      <output data-testid="rapid-open-state">{{ rapidOpen }}</output>
    </section>

    <section class="model-selector-test__section" data-testid="appearance-section">
      <h3>Variant、size、disabled 与窄屏</h3>
      <div class="model-selector-test__row model-selector-test__row--appearance">
        <TrModelSelector
          data-testid="outline-small-selector"
          :models="compactModels"
          :searchable="false"
          variant="outline"
          size="small"
        />
        <TrModelSelector
          data-testid="ghost-normal-selector"
          :models="compactModels"
          :searchable="false"
          variant="ghost"
          size="normal"
        />
        <TrModelSelector
          data-testid="muted-large-selector"
          :models="compactModels"
          :searchable="false"
          variant="muted"
          size="large"
        />
        <TrModelSelector data-testid="disabled-selector" :models="compactModels" disabled />
      </div>
    </section>
  </div>
</template>

<style scoped>
.model-selector-test {
  display: grid;
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto;
  color: var(--tr-text-primary, #1f2937);
}

.model-selector-test__intro,
.model-selector-test__row,
.model-selector-test__controls,
.model-selector-test__metrics {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.model-selector-test__intro {
  justify-content: space-between;
}

.model-selector-test__intro h2,
.model-selector-test__intro p,
.model-selector-test__section h3 {
  margin: 0;
}

.model-selector-test__intro p {
  margin-top: 6px;
  color: var(--tr-text-secondary, #667085);
}

.model-selector-test__section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--tr-border-color-default, #d0d5dd);
  border-radius: 12px;
  background: var(--tr-container-bg-default, #fff);
}

.model-selector-test button:not(.tr-model-selector__trigger) {
  padding: 7px 10px;
  border: 1px solid var(--tr-border-color-default, #d0d5dd);
  border-radius: 7px;
  background: var(--tr-container-bg-default, #fff);
  color: inherit;
  cursor: pointer;
}

.model-selector-test__metrics output {
  min-width: 28px;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--tr-container-bg-default-2, #f2f4f7);
  font: 12px/1.4 monospace;
}

.model-selector-test__row--appearance {
  align-items: flex-start;
}

:global(.tr-model-selector__panel.model-selector-test__custom-content) {
  border-width: 2px;
  border-style: dashed;
}

@media (max-width: 480px) {
  .model-selector-test {
    gap: 12px;
  }

  .model-selector-test__section {
    padding: 10px;
  }
}
</style>
