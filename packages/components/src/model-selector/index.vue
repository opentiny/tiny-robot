<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, shallowRef, watch } from 'vue'
import ModelSelectorPanel from './components/ModelSelectorPanel.vue'
import ModelSelectorTrigger from './components/ModelSelectorTrigger.vue'
import { useModelSelectorEffort } from './composables/useModelSelectorEffort'
import { useModelSelectorFloating } from './composables/useModelSelectorFloating'
import { useModelSelectorState } from './composables/useModelSelectorState'
import type {
  ModelSelectorEmits,
  ModelSelectorOption,
  ModelSelectorProps,
  ModelSelectorSlots,
  ModelSelectorTriggerSlotProps,
} from './index.type'
import { getDuplicateModelEffortValues, normalizeModelEfforts } from './normalizeModelEfforts'
import { getDuplicateModelValues, normalizeModelOptions } from './normalizeModelOptions'
import { useTeleportTarget } from '../shared/composables/useTeleportTarget'

defineOptions({ name: 'TrModelSelector' })

const props = withDefaults(defineProps<ModelSelectorProps>(), {
  models: () => [],
  defaultValue: null,
  reasoningEffort: undefined,
  defaultReasoningEffort: null,
  open: undefined,
  defaultOpen: false,
  disabled: false,
  searchable: false,
  placeholder: 'Select model',
  searchPlaceholder: 'Search models',
  emptyText: 'No models found.',
  variant: 'outline',
  size: 'normal',
  placement: 'bottom-start',
  offset: 8,
  reasoningEffortLabel: 'Thinking',
})

const emit = defineEmits<ModelSelectorEmits>()
defineSlots<ModelSelectorSlots>()

const instance = getCurrentInstance()
const instanceUid = instance?.uid ?? 0
const initialVNodeProps = instance?.vnode.props ?? {}
const hasInitialVNodeProp = (...names: string[]) => {
  return names.some((name) => Object.prototype.hasOwnProperty.call(initialVNodeProps, name))
}
const idPrefix = `tr-model-selector-${instanceUid}`
const listboxId = `${idPrefix}-listbox`
const referenceEl = shallowRef<HTMLElement | null>(null)
const floatingEl = shallowRef<HTMLElement | null>(null)
const isMounted = shallowRef(false)
const pendingFocusRestore = shallowRef<boolean | null>(null)

const baseTeleportTarget = useTeleportTarget(referenceEl)
const teleportTarget = computed(() => {
  if (!isMounted.value) {
    return null
  }

  const fallbackTarget = baseTeleportTarget.value
  const requestedTarget = props.appendTo

  if (!requestedTarget) {
    return fallbackTarget
  }

  if (typeof requestedTarget !== 'string') {
    return requestedTarget
  }

  if (requestedTarget === 'body' && fallbackTarget === referenceEl.value?.ownerDocument.body) {
    return fallbackTarget
  }

  const searchableTarget = fallbackTarget as Node & ParentNode
  try {
    return searchableTarget.querySelector?.(requestedTarget) ?? fallbackTarget
  } catch {
    return fallbackTarget
  }
})

const state = useModelSelectorState({
  value: () => props.modelValue,
  defaultValue: props.defaultValue,
  valueControlled: hasInitialVNodeProp('modelValue', 'model-value'),
  open: () => props.open,
  defaultOpen: props.disabled ? false : props.defaultOpen,
  openControlled: hasInitialVNodeProp('open'),
  onUpdateValue: (value) => emit('update:modelValue', value),
  onUpdateOpen: (open) => emit('update:open', open),
})

const normalizedOptions = computed(() => normalizeModelOptions(props.models))
const duplicateValues = computed(() => getDuplicateModelValues(props.models))
const currentOption = computed(() => {
  return normalizedOptions.value.find((option) => option.value === state.value.value) ?? null
})
const currentEfforts = computed(() => normalizeModelEfforts(currentOption.value?.raw.reasoningEfforts))
const duplicateEffortValues = computed(() => getDuplicateModelEffortValues(currentOption.value?.raw.reasoningEfforts))
// Raw vnode props preserve an explicitly bound `undefined`, which still denotes controlled usage.
const effortState = useModelSelectorEffort({
  value: () => props.reasoningEffort,
  defaultValue: props.defaultReasoningEffort,
  efforts: () => currentEfforts.value,
  controlled: hasInitialVNodeProp('reasoningEffort', 'reasoning-effort'),
  onUpdateValue: (value) => emit('update:reasoningEffort', value),
})
const activeEffort = computed<string | null>(() => effortState.activeOption.value?.value ?? null)
const isOpen = computed(() => state.open.value && !props.disabled)
const triggerLabel = computed(() => currentOption.value?.label ?? props.placeholder)
const resolvedAriaLabel = computed(() => props.ariaLabel?.trim() || props.placeholder)
const resolvedSearchAriaLabel = computed(() => props.searchAriaLabel?.trim() || props.searchPlaceholder)
const resolvedReasoningEffortAriaLabel = computed(() => props.reasoningEffortLabel)
const triggerAriaLabel = computed(() => {
  const reasoningEffortLabel = effortState.activeOption.value?.label
  return `${resolvedAriaLabel.value}: ${triggerLabel.value}${reasoningEffortLabel ? `, ${resolvedReasoningEffortAriaLabel.value}: ${reasoningEffortLabel}` : ''}`
})

const triggerSlotProps = computed<ModelSelectorTriggerSlotProps>(() => ({
  value: state.value.value,
  option: currentOption.value?.raw ?? null,
  label: triggerLabel.value,
  open: isOpen.value,
  disabled: props.disabled,
  reasoningEffort: activeEffort.value,
  reasoningEffortOption: effortState.activeOption.value,
}))

const panelSlotContext = computed(() => ({
  value: state.value.value,
  option: currentOption.value?.raw ?? null,
  close: closeFromSlot,
}))

function focusTrigger() {
  referenceEl.value?.querySelector<HTMLButtonElement>('.tr-model-selector__trigger')?.focus({ preventScroll: true })
}

function getDeepActiveElement() {
  let activeElement = referenceEl.value?.ownerDocument.activeElement ?? null

  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement
  }

  return activeElement
}

function isFocusInsideFloating() {
  const activeElement = getDeepActiveElement()
  return Boolean(activeElement && floatingEl.value?.contains(activeElement))
}

function requestOpen() {
  if (props.disabled) {
    return
  }

  state.setOpen(true)
}

function requestClose(restoreFocus: boolean) {
  if (!isOpen.value) {
    return
  }

  if (pendingFocusRestore.value !== null) {
    return
  }

  pendingFocusRestore.value = restoreFocus
  const didRequestClose = state.setOpen(false)

  if (!didRequestClose) {
    pendingFocusRestore.value = null
    return
  }

  const resetRejectedRequest = () => {
    if (isOpen.value && pendingFocusRestore.value === restoreFocus) {
      pendingFocusRestore.value = null
    }
  }
  const ownerWindow = referenceEl.value?.ownerDocument.defaultView

  if (ownerWindow) {
    ownerWindow.setTimeout(resetRejectedRequest, 0)
  } else {
    void nextTick().then(resetRejectedRequest)
  }
}

function handleTriggerClick() {
  if (isOpen.value) {
    requestClose(false)
  } else {
    requestOpen()
  }
}

function handleTriggerEnter() {
  requestOpen()
}

function handleSelectOption(option: ModelSelectorOption) {
  const normalizedOption = normalizedOptions.value.find((item) => item.value === option.value)

  if (!normalizedOption || normalizedOption.disabled) {
    return
  }

  const changed = state.setValue(normalizedOption.value)

  if (changed) {
    emit('change', normalizedOption.raw)
  }

  requestClose(true)
}

function handleSelectEffort(value: string | null) {
  if (props.disabled || currentOption.value?.disabled) {
    return
  }

  const option = value === null ? null : (currentEfforts.value.find((item) => item.value === value) ?? null)
  const changed = effortState.setValue(value)

  if (changed) {
    emit('reasoning-effort-change', option)
  }
}

function closeFromSlot() {
  requestClose(true)
}

const { isPositioned } = useModelSelectorFloating({
  referenceEl,
  floatingEl,
  open: () => isOpen.value,
  placement: () => props.placement,
  offset: () => props.offset,
  teleportTarget: () => teleportTarget.value,
  onOutsidePointerDown: () => requestClose(false),
})

if (import.meta.env.DEV) {
  watch(
    duplicateValues,
    (values) => {
      if (values.length > 0) {
        console.warn(
          `[TrModelSelector] model values must be unique. Duplicate values are ignored: ${values.join(', ')}`,
        )
      }
    },
    { immediate: true },
  )

  watch(
    duplicateEffortValues,
    (values) => {
      if (values.length > 0) {
        console.warn(
          `[TrModelSelector] reasoning effort values must be unique for model "${currentOption.value?.value ?? ''}". Duplicate values are ignored: ${values.join(', ')}`,
        )
      }
    },
    { immediate: true },
  )
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && state.open.value) {
      pendingFocusRestore.value = false
      state.setOpen(false)
    }
  },
)

watch(
  isOpen,
  async (open, previous) => {
    if (!open) {
      if (previous) {
        const shouldRestoreFocus = pendingFocusRestore.value ?? isFocusInsideFloating()
        pendingFocusRestore.value = null

        if (shouldRestoreFocus) {
          await nextTick()
          focusTrigger()
        }
      }

      return
    }
  },
  { immediate: true },
)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <div class="tr-model-selector" :class="[`tr-model-selector--${variant}`, `tr-model-selector--${size}`]">
    <span ref="referenceEl" class="tr-model-selector__anchor">
      <ModelSelectorTrigger
        :open="isOpen"
        :disabled="disabled"
        :label="triggerLabel"
        :effort-label="effortState.activeOption.value?.label"
        :icon="currentOption?.icon"
        :controls-id="listboxId"
        :trigger-aria-label="triggerAriaLabel"
        :variant="variant"
        :size="size"
        @click="handleTriggerClick"
        @enter="handleTriggerEnter"
      >
        <template v-if="$slots.trigger" #default>
          <slot name="trigger" v-bind="triggerSlotProps" />
        </template>
      </ModelSelectorTrigger>
    </span>

    <Teleport v-if="isMounted && teleportTarget" :to="teleportTarget">
      <div
        v-if="isOpen"
        ref="floatingEl"
        class="tr-model-selector__dropdown-wrapper"
        :class="{ 'is-positioned': isPositioned }"
      >
        <div class="tr-model-selector__dropdown-surface">
          <ModelSelectorPanel
            :options="normalizedOptions"
            :selected-value="state.value.value"
            :searchable="searchable"
            :filter-method="filterMethod"
            :listbox-id="listboxId"
            :option-id-prefix="idPrefix"
            :search-placeholder="searchPlaceholder"
            :empty-text="emptyText"
            :search-aria-label="resolvedSearchAriaLabel"
            :ariaLabel="resolvedAriaLabel"
            :effort-options="currentEfforts"
            :effort-value="activeEffort"
            :effort-label="reasoningEffortLabel"
            :effort-aria-label="resolvedReasoningEffortAriaLabel"
            :effort-disabled="Boolean(currentOption?.disabled)"
            :size="size"
            :content-class="contentClass"
            :content-style="contentStyle"
            :slot-context="panelSlotContext"
            @select="handleSelectOption"
            @select-effort="handleSelectEffort"
            @close="requestClose"
          >
            <template v-if="$slots.header" #header="slotProps">
              <slot name="header" v-bind="slotProps" />
            </template>
            <template v-if="$slots.item" #item="slotProps">
              <slot name="item" v-bind="slotProps" />
            </template>
            <template v-if="$slots.empty" #empty="slotProps">
              <slot name="empty" v-bind="slotProps" />
            </template>
            <template v-if="$slots.footer" #footer="slotProps">
              <slot name="footer" v-bind="slotProps" />
            </template>
          </ModelSelectorPanel>
        </div>
      </div>
    </Teleport>
  </div>
</template>
