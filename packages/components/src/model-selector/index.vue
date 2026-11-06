<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, shallowRef, watch } from 'vue'
import ModelSelectorPanel from './components/ModelSelectorPanel.vue'
import ModelSelectorTrigger from './components/ModelSelectorTrigger.vue'
import { useModelSelectorFloating } from './composables/useModelSelectorFloating'
import { useModelSelectorState } from './composables/useModelSelectorState'
import type {
  ModelSelectorEmits,
  ModelSelectorFeatureValue,
  ModelSelectorFeatureValues,
  ModelSelectorOption,
  ModelSelectorProps,
  ModelSelectorSlots,
  ModelSelectorTriggerSlotProps,
} from './index.type'
import { getDuplicateModelValues, normalizeModelOptions } from './normalizeModelOptions'
import {
  canSetModelFieldValue,
  getModelFeatureSummary,
  normalizeModelFields,
  resolveModelFeatureValues,
} from './featureFields'
import { useStableId, useTeleportTarget } from '../shared/composables'

defineOptions({ name: 'TrModelSelector' })

const props = withDefaults(defineProps<ModelSelectorProps>(), {
  models: () => [],
  defaultValue: null,
  open: undefined,
  defaultOpen: false,
  closeOnSelect: true,
  disabled: false,
  searchable: false,
  placeholder: '选择模型',
  searchPlaceholder: '搜索模型',
  emptyText: '暂无可用模型',
  variant: 'outline',
  size: 'normal',
  placement: 'bottom-start',
  offset: 8,
})

const emit = defineEmits<ModelSelectorEmits>()
defineSlots<ModelSelectorSlots>()

const instance = getCurrentInstance()
const initialVNodeProps = instance?.vnode.props ?? {}
const hasInitialVNodeProp = (...names: string[]) => {
  return names.some((name) => Object.prototype.hasOwnProperty.call(initialVNodeProps, name))
}
const idPrefix = `tr-model-selector-${useStableId()}`
const listboxId = `${idPrefix}-listbox`
const referenceEl = shallowRef<HTMLElement | null>(null)
const floatingEl = shallowRef<HTMLElement | null>(null)
const isTeleportReady = shallowRef(false)
const pendingFocusRestore = shallowRef<boolean | null>(null)

const baseTeleportTarget = useTeleportTarget(referenceEl)
const teleportTarget = computed(() => {
  if (!isTeleportReady.value) {
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
const currentFields = computed(() => normalizeModelFields(currentOption.value?.raw.fields))
const currentValues = computed<ModelSelectorFeatureValues>(() =>
  resolveModelFeatureValues(currentFields.value, props.featureValues),
)
const featureSummary = computed(() => getModelFeatureSummary(currentFields.value, currentValues.value))
const isOpen = computed(() => state.open.value && !props.disabled)
const triggerLabel = computed(() => currentOption.value?.label ?? props.placeholder)

const triggerSlotProps = computed<ModelSelectorTriggerSlotProps>(() => ({
  option: currentOption.value?.raw ?? null,
  label: triggerLabel.value,
  open: isOpen.value,
  values: currentValues.value,
  summary: featureSummary.value,
}))

const panelSlotContext = computed(() => ({
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

  if (props.closeOnSelect) {
    requestClose(true)
  }
}

function setFeatureValue(key: string, value: ModelSelectorFeatureValue) {
  const option = currentOption.value
  const field = currentFields.value.find((item) => item.key === key)
  if (
    !option ||
    props.disabled ||
    option.disabled ||
    !field ||
    !canSetModelFieldValue(field, value) ||
    currentValues.value[key] === value
  )
    return
  const values = { ...currentValues.value, [key]: value }
  const change = { modelId: option.value, key, previousValue: currentValues.value[key], value, values: { ...values } }
  emit('update:featureValues', values)
  emit('feature-change', change)
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
  isTeleportReady.value = true
})
</script>

<template>
  <div class="tr-model-selector" :class="[`tr-model-selector--${variant}`, `tr-model-selector--${size}`]">
    <span ref="referenceEl" class="tr-model-selector__anchor">
      <ModelSelectorTrigger
        :open="isOpen"
        :disabled="disabled"
        :label="triggerLabel"
        :summary="featureSummary"
        :icon="currentOption?.icon"
        :controls-id="listboxId"
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

    <Teleport v-if="teleportTarget" :to="teleportTarget">
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
            :placeholder="placeholder"
            :search-placeholder="searchPlaceholder"
            :empty-text="emptyText"
            :fields-disabled="Boolean(currentOption?.disabled)"
            :fields="currentFields"
            :values="currentValues"
            :size="size"
            :panel-class="panelClass"
            :slot-context="panelSlotContext"
            @select="handleSelectOption"
            @set-feature-value="setFeatureValue"
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
