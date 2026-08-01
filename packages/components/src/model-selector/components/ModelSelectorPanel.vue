<script setup lang="ts">
import { IconNoData, IconSearch } from '@opentiny/tiny-robot-svgs'
import { shallowRef, type StyleValue, type VNode } from 'vue'
import type {
  ModelSelectorContentClass,
  ModelSelectorEmptySlotProps,
  ModelSelectorEffortOption,
  ModelSelectorEffortValue,
  ModelSelectorGroupLabelSlotProps,
  ModelSelectorItemSlotProps,
  ModelSelectorSize,
  ModelSelectorValue,
} from '../index.type'
import type { ModelSelectorOptionGroup } from '../internal.type'
import ModelSelectorEffort from './ModelSelectorEffort.vue'
import ModelSelectorGroup from './ModelSelectorGroup.vue'

defineOptions({ name: 'TrModelSelectorPanel' })

const props = defineProps<{
  query: string
  searchable: boolean
  groups: readonly ModelSelectorOptionGroup[]
  isEmpty: boolean
  selectedValue: ModelSelectorValue
  highlightedKey: string | null
  activeDescendantId?: string
  listboxId: string
  optionIdPrefix: string
  searchPlaceholder: string
  emptyText: string
  searchAriaLabel: string
  listAriaLabel: string
  effortOptions: readonly ModelSelectorEffortOption[]
  effortValue: ModelSelectorEffortValue
  effortLabel: string
  effortAriaLabel: string
  effortDisabled: boolean
  size: ModelSelectorSize
  contentClass?: ModelSelectorContentClass
  contentStyle?: StyleValue
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  hover: [key: string]
  select: [key: string]
  'select-effort': [value: ModelSelectorEffortValue]
  keydown: [event: KeyboardEvent]
  focusout: [event: FocusEvent]
}>()

defineSlots<{
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  'group-label'?: (props: ModelSelectorGroupLabelSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  'panel-header'?: () => VNode | VNode[]
  footer?: () => VNode | VNode[]
}>()

const searchInputEl = shallowRef<HTMLInputElement | null>(null)
const listboxEl = shallowRef<HTMLElement | null>(null)

function handleInput(event: Event) {
  emit('update:query', (event.target as HTMLInputElement).value)
}

function focusPrimary() {
  const focusTarget = props.searchable ? searchInputEl.value : listboxEl.value
  focusTarget?.focus({ preventScroll: true })
}

defineExpose({ focusPrimary })
</script>

<template>
  <div
    class="tr-model-selector__panel"
    :class="[`tr-model-selector__panel--${size}`, contentClass]"
    :style="contentStyle"
    @keydown="$emit('keydown', $event)"
    @focusout="$emit('focusout', $event)"
  >
    <div v-if="$slots['panel-header']" class="tr-model-selector__panel-header">
      <slot name="panel-header" />
    </div>

    <div v-if="searchable" class="tr-model-selector__search">
      <IconSearch class="tr-model-selector__search-icon" aria-hidden="true" focusable="false" />
      <input
        ref="searchInputEl"
        type="text"
        class="tr-model-selector__search-input"
        data-model-selector-search-input
        role="combobox"
        :value="query"
        :placeholder="searchPlaceholder"
        :aria-label="searchAriaLabel"
        :aria-controls="listboxId"
        :aria-activedescendant="activeDescendantId"
        aria-autocomplete="list"
        aria-expanded="true"
        aria-haspopup="listbox"
        autocomplete="off"
        :spellcheck="false"
        @input="handleInput"
      />
    </div>

    <div v-if="isEmpty" class="tr-model-selector__empty" role="status" aria-live="polite">
      <slot name="empty" :query="query">
        <IconNoData class="tr-model-selector__empty-icon" aria-hidden="true" focusable="false" />
        <span>{{ emptyText }}</span>
      </slot>
    </div>

    <div
      :id="listboxId"
      ref="listboxEl"
      class="tr-model-selector__content"
      :class="{ 'is-empty': isEmpty }"
      role="listbox"
      tabindex="-1"
      :aria-label="listAriaLabel"
      :aria-activedescendant="searchable ? undefined : activeDescendantId"
    >
      <ModelSelectorGroup
        v-for="group in groups"
        :key="group.key"
        :group="group"
        :selected-value="selectedValue"
        :highlighted-key="highlightedKey"
        :option-id-prefix="optionIdPrefix"
        @hover="$emit('hover', $event)"
        @select="$emit('select', $event)"
      >
        <template v-if="$slots.item" #item="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
        <template v-if="$slots['group-label']" #group-label="slotProps">
          <slot name="group-label" v-bind="slotProps" />
        </template>
      </ModelSelectorGroup>
    </div>

    <div v-if="$slots.footer || effortOptions.length > 0" class="tr-model-selector__footer">
      <slot name="footer">
        <ModelSelectorEffort
          :options="effortOptions"
          :value="effortValue"
          :label="effortLabel"
          :group-aria-label="effortAriaLabel"
          :disabled="effortDisabled"
          @select="$emit('select-effort', $event)"
        />
      </slot>
    </div>
  </div>
</template>
