<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorSnapshot, type ModelSelectorOption } from '@opentiny/tiny-robot'

const props = withDefaults(defineProps<{ keyboard?: boolean; extraSwitches?: number; customFooter?: boolean }>(), {
  keyboard: false,
})
const selected = shallowRef('alpha')
const events = shallowRef<string[]>([])
const models: ModelSelectorOption[] = [
  {
    id: 'alpha',
    label: 'Alpha model',
    group: 'Team Alpha',
    features: [
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'off',
        options: [
          { value: 'off', label: '关闭' },
          { value: 'high', label: '高' },
        ],
      },
      { key: 'search', label: '搜索', type: 'switch' },
      ...Array.from({ length: props.extraSwitches ?? 0 }, (_, index) => ({
        key: `extra-${index + 1}`,
        label: `Extra setting ${index + 1}`,
        type: 'switch' as const,
      })),
    ],
  },
  { id: 'locked', label: 'Locked model', group: 'Team Alpha', disabled: true },
  { id: 'beta', label: 'Beta model', group: 'Team Beta' },
]
function handleChange(current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot) {
  if (current.modelId !== previous.modelId) {
    events.value.push(`model:${current.modelId}`)
    return
  }
  for (const [key, value] of Object.entries(current.featureValues)) {
    if (value !== previous.featureValues[key]) {
      events.value.push(`field:${key}`)
    }
  }
}
</script>

<template>
  <TrModelSelector
    v-model="selected"
    :models="models"
    :searchable="!props.keyboard"
    search-placeholder="Search models"
    placeholder="Choose model"
    :close-on-select="false"
    @change="handleChange"
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
    <template v-if="props.customFooter" #footer>
      <button type="button" style="min-height: 32px" @click="events = [...events, 'done']">Done</button>
    </template>
  </TrModelSelector>
  <output data-testid="events">{{ JSON.stringify(events) }}</output>
</template>
