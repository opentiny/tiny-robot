<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrModelSelector, type ModelSelectorOption } from '@opentiny/tiny-robot'
import { IconDeepseek } from '@opentiny/tiny-robot-svgs'

const models: readonly ModelSelectorOption[] = [
  {
    value: 'alpha',
    label: 'Alpha model',
    description: 'Fast multimodal model',
    group: 'Team Alpha',
    icon: IconDeepseek,
  },
  {
    value: 'beta',
    label: 'Beta model',
    description: 'Only custom filter finds this',
    group: 'Team Beta',
    icon: 'https://example.com/model.svg',
  },
  { value: 'locked', label: 'Locked model', description: 'Unavailable model', group: 'Team Beta', disabled: true },
]
const shortModels: readonly ModelSelectorOption[] = [
  { value: 'short-a', label: 'A' },
  { value: 'short-b', label: 'B' },
]
const wideModels: readonly ModelSelectorOption[] = [
  { value: 'wide-a', label: 'A model name intentionally wider than the initial panel' },
  { value: 'wide-b', label: 'Another wide model name' },
]
const dynamicModels = shallowRef<readonly ModelSelectorOption[]>(shortModels)
const asyncModels = shallowRef<readonly ModelSelectorOption[]>([])
const controlledValue = shallowRef<string | null>('alpha')
const controlledOpen = shallowRef(false)
const controlledEvents = shallowRef<string[]>([])
const rejectedEvents = shallowRef<string[]>([])
const defaultOpenEvents = shallowRef<boolean[]>([])
const showDefaultOpen = shallowRef(false)
const selectionEvents = shallowRef<string[]>([])
const rapidOpen = shallowRef(false)

function loadModels() {
  asyncModels.value = models
}

function loadWideModels() {
  dynamicModels.value = wideModels
}

function rejectModelUpdate(value: string | null) {
  rejectedEvents.value = [...rejectedEvents.value, `model:${value}`]
}

function rejectOpenUpdate(value: boolean) {
  rejectedEvents.value = [...rejectedEvents.value, `open:${value}`]
}

function recordDefaultOpenUpdate(value: boolean) {
  defaultOpenEvents.value = [...defaultOpenEvents.value, value]
}

function customFilter(query: string, option: ModelSelectorOption) {
  return option.value.includes(query.trim().toLowerCase())
}

function setRapidOpen() {
  rapidOpen.value = true
  rapidOpen.value = false
}
</script>

<template>
  <main>
    <button data-testid="load-models" type="button" @click="loadModels">Load models</button>
    <TrModelSelector data-testid="async-selector" :models="asyncModels" placeholder="Choose model" />

    <button data-testid="toggle-controlled-open" type="button" @click="controlledOpen = !controlledOpen">
      Toggle controlled panel
    </button>
    <output data-testid="controlled-state">{{ controlledValue }}:{{ controlledOpen }}</output>
    <TrModelSelector
      data-testid="controlled-selector"
      :models="models"
      :model-value="controlledValue"
      :open="controlledOpen"
      @update:model-value="
        (value) => {
          controlledEvents = [...controlledEvents, `model:${value}`]
          controlledValue = value
        }
      "
      @update:open="
        (value) => {
          controlledEvents = [...controlledEvents, `open:${value}`]
          controlledOpen = value
        }
      "
    />
    <output data-testid="controlled-events">{{ JSON.stringify(controlledEvents) }}</output>

    <TrModelSelector
      data-testid="rejected-selector"
      :models="models"
      model-value="alpha"
      :open="false"
      @update:model-value="rejectModelUpdate"
      @update:open="rejectOpenUpdate"
    />
    <output data-testid="rejected-events">{{ JSON.stringify(rejectedEvents) }}</output>

    <button data-testid="show-default-open" type="button" @click="showDefaultOpen = true">
      Show default-open selector
    </button>
    <TrModelSelector
      v-if="showDefaultOpen"
      data-testid="default-open-selector"
      :models="models"
      default-open
      searchable
      search-placeholder="Search models"
      @update:open="recordDefaultOpenUpdate"
    />
    <output data-testid="default-open-events">{{ JSON.stringify(defaultOpenEvents) }}</output>

    <TrModelSelector
      data-testid="search-selector"
      :models="models"
      default-value="alpha"
      searchable
      search-placeholder="Search models"
    />
    <TrModelSelector
      data-testid="custom-filter-selector"
      :models="models"
      default-value="alpha"
      searchable
      search-placeholder="Filter by id"
      :filter-method="customFilter"
    />
    <TrModelSelector data-testid="aria-selector" :models="models" default-value="alpha" searchable />

    <button data-testid="outside-action" type="button">Outside</button>
    <TrModelSelector data-testid="primary-selector" :models="models" default-value="alpha" />
    <TrModelSelector
      data-testid="secondary-selector"
      :models="models"
      default-value="beta"
      @change="selectionEvents.push($event.value)"
    />
    <output data-testid="selection-events">{{ JSON.stringify(selectionEvents) }}</output>
    <TrModelSelector data-testid="invalid-append-selector" :models="models" append-to="[" />

    <button data-testid="rapid-open-close" type="button" @click="setRapidOpen">Rapid open and close</button>
    <TrModelSelector data-testid="rapid-selector" :models="models" :open="rapidOpen" />

    <TrModelSelector data-testid="short-selector" :models="shortModels" default-value="short-a" />
    <TrModelSelector data-testid="short-search-selector" :models="shortModels" searchable />
    <TrModelSelector data-testid="short-small-selector" :models="shortModels" size="small" />
    <TrModelSelector data-testid="short-normal-selector" :models="shortModels" size="normal" />
    <TrModelSelector data-testid="short-large-selector" :models="shortModels" size="large" />
    <TrModelSelector data-testid="custom-panel-selector" :models="models" panel-class="regression-panel" />
    <TrModelSelector data-testid="disabled-selector" :models="models" disabled />
    <TrModelSelector data-testid="dynamic-width-selector" :models="dynamicModels" default-value="short-a">
      <template #header>
        <button data-testid="load-wide-models" type="button" @click="loadWideModels">Load wide models</button>
      </template>
    </TrModelSelector>
  </main>
</template>
