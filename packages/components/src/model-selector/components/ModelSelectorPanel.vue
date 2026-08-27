<script setup lang="ts">
import { IconNoData, IconSearch } from '@opentiny/tiny-robot-svgs'
import { computed, nextTick, onMounted, shallowRef, watch, type StyleValue, type VNode } from 'vue'
import type {
  ModelSelectorContentClass,
  ModelSelectorEmptySlotProps,
  ModelSelectorFooterSlotProps,
  ModelSelectorFilterMethod,
  ModelSelectorItemSlotProps,
  ModelSelectorOption,
  ModelSelectorReasoningEffortOption,
  ModelSelectorSize,
  ModelSelectorSlotProps,
} from '../index.type'
import type { NormalizedModelSelectorOption } from '../internal.type'
import { useModelSelectorFilter } from '../composables/useModelSelectorFilter'
import { useModelSelectorNavigation } from '../composables/useModelSelectorNavigation'
import ModelSelectorEffort from './ModelSelectorEffort.vue'
import ModelSelectorGroup from './ModelSelectorGroup.vue'

defineOptions({ name: 'TrModelSelectorPanel' })

type ModelSelectorPanelSlotContext = Pick<ModelSelectorSlotProps, 'value' | 'option' | 'close'>

const props = defineProps<{
  options: readonly NormalizedModelSelectorOption[]
  selectedValue: string | null
  searchable: boolean
  filterMethod?: ModelSelectorFilterMethod
  listboxId: string
  optionIdPrefix: string
  searchPlaceholder: string
  emptyText: string
  searchAriaLabel: string
  ariaLabel: string
  effortOptions: readonly ModelSelectorReasoningEffortOption[]
  effortValue: string | null
  effortLabel: string
  effortAriaLabel: string
  effortDisabled: boolean
  size: ModelSelectorSize
  contentClass?: ModelSelectorContentClass
  contentStyle?: StyleValue
  slotContext: ModelSelectorPanelSlotContext
}>()

const emit = defineEmits<{
  select: [option: ModelSelectorOption]
  'select-effort': [value: string | null]
  close: [restoreFocus: boolean]
}>()

defineSlots<{
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  header?: (props: ModelSelectorSlotProps) => VNode | VNode[]
  footer?: (props: ModelSelectorFooterSlotProps) => VNode | VNode[]
}>()

const searchInputEl = shallowRef<HTMLInputElement | null>(null)
const listboxEl = shallowRef<HTMLElement | null>(null)

const filter = useModelSelectorFilter({
  options: () => props.options,
  searchable: () => props.searchable,
  filterMethod: () => props.filterMethod,
})

const navigation = useModelSelectorNavigation({
  enabled: () => true,
  options: () => filter.visibleOptions.value,
  selectedValue: () => props.selectedValue,
  containerEl: listboxEl,
})

const activeDescendantId = computed(() => {
  const option = navigation.highlightedOption.value
  return option ? `${props.optionIdPrefix}-option-${option.index}` : undefined
})

const headerSlotProps = computed<ModelSelectorSlotProps>(() => ({
  ...props.slotContext,
  query: filter.query.value,
}))

const footerSlotProps = computed<ModelSelectorFooterSlotProps>(() => ({
  ...headerSlotProps.value,
  reasoningEfforts: props.effortOptions,
  reasoningEffort: props.effortValue,
  reasoningEffortOption: props.effortOptions.find((option) => option.value === props.effortValue) ?? null,
  setReasoningEffort: (value) => emit('select-effort', value),
}))

function handleInput(event: Event) {
  filter.setQuery((event.target as HTMLInputElement).value)
}

function focusPrimaryTarget() {
  const focusTarget = props.searchable ? searchInputEl.value : listboxEl.value
  focusTarget?.focus({ preventScroll: true })
}

async function focusPrimary() {
  await nextTick()

  const ownerWindow = searchInputEl.value?.ownerDocument.defaultView ?? listboxEl.value?.ownerDocument.defaultView

  if (!ownerWindow || typeof ownerWindow.requestAnimationFrame !== 'function') {
    focusPrimaryTarget()
    return
  }

  ownerWindow.requestAnimationFrame(() => {
    focusPrimaryTarget()
  })
}

function selectHighlightedOption() {
  const option = navigation.highlightedOption.value

  if (option) {
    emit('select', option.raw)
  }
}

function isComposing(event: KeyboardEvent) {
  return event.isComposing || event.keyCode === 229
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || isComposing(event)) {
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    navigation.moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectHighlightedOption()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close', true)
  }
}

function handleListboxKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || isComposing(event)) {
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    navigation.moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    navigation.highlightBoundary(event.key === 'Home' ? 'first' : 'last')
    return
  }

  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault()
    selectHighlightedOption()
  }
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close', true)
  }
}

onMounted(() => {
  void focusPrimary()
})

watch(
  () => props.searchable,
  async () => {
    filter.clearQuery()
    await focusPrimary()
  },
)
</script>

<template>
  <div
    class="tr-model-selector__panel"
    :class="[`tr-model-selector__panel--${size}`, contentClass]"
    :style="contentStyle"
    @keydown="handlePanelKeydown"
  >
    <div v-if="$slots.header" class="tr-model-selector__header">
      <slot name="header" v-bind="headerSlotProps" />
    </div>

    <div v-if="searchable" class="tr-model-selector__search">
      <IconSearch class="tr-model-selector__search-icon" aria-hidden="true" focusable="false" />
      <input
        ref="searchInputEl"
        type="text"
        class="tr-model-selector__search-input"
        data-model-selector-search-input
        role="combobox"
        :value="filter.query.value"
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
        @keydown="handleSearchKeydown"
      />
    </div>

    <div v-if="filter.isEmpty.value" class="tr-model-selector__empty" role="status" aria-live="polite">
      <slot name="empty" :query="filter.query.value">
        <IconNoData class="tr-model-selector__empty-icon" aria-hidden="true" focusable="false" />
        <span>{{ emptyText }}</span>
      </slot>
    </div>

    <div
      :id="listboxId"
      ref="listboxEl"
      class="tr-model-selector__content"
      :class="{ 'is-empty': filter.isEmpty.value }"
      role="listbox"
      tabindex="-1"
      :aria-label="ariaLabel"
      :aria-activedescendant="searchable ? undefined : activeDescendantId"
      @keydown="handleListboxKeydown"
    >
      <ModelSelectorGroup
        v-for="group in filter.groups.value"
        :key="group.key"
        :group="group"
        :selected-value="selectedValue"
        :highlighted-key="navigation.highlightedKey.value"
        :option-id-prefix="optionIdPrefix"
        @hover="navigation.setHighlightedKey"
        @select="$emit('select', $event)"
      >
        <template v-if="$slots.item" #item="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
      </ModelSelectorGroup>
    </div>

    <div v-if="$slots.footer || effortOptions.length > 0" class="tr-model-selector__footer">
      <slot name="footer" v-bind="footerSlotProps">
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
