<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorFeatureValues, type ModelSelectorOption } from '@opentiny/tiny-robot'

const props = withDefaults(defineProps<{ keyboard?: boolean }>(), { keyboard: false })
const selected = shallowRef('alpha')
const values = shallowRef<ModelSelectorFeatureValues>({ mode: 'invalid', search: 'invalid' })
const events = shallowRef<string[]>([])
const models: ModelSelectorOption[] = [
  {
    value: 'alpha',
    label: 'Alpha model',
    group: 'Team Alpha',
    fields: [
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'off',
        summary: true,
        options: [
          { value: 'off', label: '关闭', summary: false },
          { value: 'high', label: '高' },
        ],
      },
      { key: 'search', label: '搜索', type: 'switch' },
    ],
  },
  { value: 'locked', label: 'Locked model', group: 'Team Alpha', disabled: true },
  { value: 'beta', label: 'Beta model', group: 'Team Beta' },
]
</script>

<template>
  <TrModelSelector
    v-model="selected"
    v-model:feature-values="values"
    :models="models"
    :searchable="!props.keyboard"
    search-placeholder="Search models"
    placeholder="Choose model"
    :close-on-select="false"
    @change="events.push(`model:${$event.value}`)"
    @feature-change="events.push(`field:${$event.key}`)"
  >
    <template #header="{ query, option }">
      <div data-testid="header">{{ option?.label }}:{{ query }}</div>
    </template>
    <template #item="{ option, selected: isSelected, highlighted }">
      <span>{{ option.label }} {{ isSelected ? 'selected' : '' }} {{ highlighted ? 'highlighted' : '' }}</span>
    </template>
    <template #empty="{ query }">
      <span data-testid="empty-slot">Nothing for {{ query }}</span>
    </template>
  </TrModelSelector>
  <output data-testid="events">{{ JSON.stringify(events) }}</output>
</template>
