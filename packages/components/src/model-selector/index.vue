<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import ModelSelectorPanel from './components/ModelSelectorPanel.vue'
import ModelSelectorTrigger from './components/ModelSelectorTrigger.vue'
import { useModelSelectorEffort } from './composables/useModelSelectorEffort'
import { useModelSelectorFilter } from './composables/useModelSelectorFilter'
import { useModelSelectorFloating } from './composables/useModelSelectorFloating'
import { useModelSelectorNavigation } from './composables/useModelSelectorNavigation'
import { useModelSelectorState } from './composables/useModelSelectorState'
import type { ModelSelectorEmits, ModelSelectorProps, ModelSelectorSlots } from './index.type'
import type { ModelSelectorInitialHighlight, NormalizedModelSelectorOption } from './internal.type'
import { getDuplicateModelEffortValues, normalizeModelEfforts } from './normalizeModelEfforts'
import { getDuplicateModelValues, normalizeModelOptions } from './normalizeModelOptions'
import { useTeleportTarget } from '../shared/composables/useTeleportTarget'
import { COLOR_MODE_ATTR_NAME, RESOLVED_COLOR_MODE, THEME, THEME_ATTR_NAME } from '../theme-provider/constants'

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
  matchTriggerWidth: true,
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
const panelRef = shallowRef<InstanceType<typeof ModelSelectorPanel> | null>(null)
const isMounted = shallowRef(false)
const requestedInitialHighlight = shallowRef<ModelSelectorInitialHighlight>('first')
const pendingFocusRestore = shallowRef<boolean | null>(null)
let closeOnNextPanelFocusOut = false
let closeOnNextPanelFocusOutRequest = 0

const baseTeleportTarget = useTeleportTarget(referenceEl)
const theme = inject<Ref<string> | undefined>(THEME, undefined)
const resolvedColorMode = inject<ComputedRef<'light' | 'dark'> | undefined>(RESOLVED_COLOR_MODE, undefined)
const teleportThemeAttrs = computed(() => {
  const attrs: Record<string, string> = {}

  if (theme) {
    attrs[THEME_ATTR_NAME] = theme.value
  }

  if (resolvedColorMode) {
    attrs[COLOR_MODE_ATTR_NAME] = resolvedColorMode.value
  }

  return attrs
})
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

const filter = useModelSelectorFilter({
  options: () => normalizedOptions.value,
  searchable: () => props.searchable,
  filterMethod: () => props.filterMethod,
})

const navigation = useModelSelectorNavigation({
  enabled: () => isOpen.value,
  options: () => filter.visibleOptions.value,
  selectedValue: () => state.value.value,
  containerEl: floatingEl,
})

const activeDescendantId = computed(() => {
  const option = navigation.highlightedOption.value
  return option ? `${idPrefix}-option-${option.index}` : undefined
})
const triggerLabel = computed(() => currentOption.value?.label ?? props.placeholder)
const resolvedAriaLabel = computed(() => props.ariaLabel?.trim() || props.placeholder)
const resolvedSearchAriaLabel = computed(() => props.searchAriaLabel?.trim() || props.searchPlaceholder)
const resolvedListAriaLabel = computed(
  () => props.listAriaLabel?.trim() || props.ariaLabel?.trim() || props.placeholder,
)
const resolvedReasoningEffortAriaLabel = computed(
  () => props.reasoningEffortAriaLabel?.trim() || props.reasoningEffortLabel,
)
const triggerAriaLabel = computed(() => {
  const reasoningEffortLabel = effortState.activeOption.value?.label
  return `${resolvedAriaLabel.value}: ${triggerLabel.value}${reasoningEffortLabel ? `, ${resolvedReasoningEffortAriaLabel.value}: ${reasoningEffortLabel}` : ''}`
})

function findVisibleOption(key: string) {
  return filter.visibleOptions.value.find((option) => option.key === key)
}

function focusTrigger() {
  referenceEl.value?.querySelector<HTMLButtonElement>('.tr-model-selector__trigger')?.focus({ preventScroll: true })
}

async function focusPanelPrimary() {
  await nextTick()

  const panel = panelRef.value
  const ownerWindow = referenceEl.value?.ownerDocument.defaultView

  if (!isOpen.value || !panel) {
    return
  }

  if (!ownerWindow || typeof ownerWindow.requestAnimationFrame !== 'function') {
    panel.focusPrimary()
    return
  }

  ownerWindow.requestAnimationFrame(() => {
    if (isOpen.value && panelRef.value === panel) {
      panel.focusPrimary()
    }
  })
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

function requestOpen(initialHighlight: ModelSelectorInitialHighlight = 'first') {
  if (props.disabled) {
    return
  }

  requestedInitialHighlight.value = initialHighlight
  filter.clearQuery()
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
    requestOpen('first')
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented || props.disabled) {
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()

    if (!isOpen.value) {
      requestOpen(event.key === 'ArrowDown' ? 'first' : 'last')
      return
    }

    navigation.moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    void focusPanelPrimary()
    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    requestClose(true)
  }
}

function handleSelectOption(option: NormalizedModelSelectorOption) {
  if (option.disabled) {
    return
  }

  const changed = state.setValue(option.value)

  if (changed) {
    emit('change', option.raw)
  }

  requestClose(true)
}

function handleSelectByKey(key: string) {
  const option = findVisibleOption(key)

  if (option) {
    handleSelectOption(option)
  }
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

function selectHighlightedOption() {
  const option = navigation.highlightedOption.value

  if (option) {
    handleSelectOption(option)
  }
}

function isAuxiliaryInteractiveTarget(target: Element) {
  return Boolean(
    target.closest(
      'button, a[href], input, select, textarea, [contenteditable="true"], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return
  }

  if (event.key === 'Tab') {
    const request = ++closeOnNextPanelFocusOutRequest
    closeOnNextPanelFocusOut = true
    const ownerWindow = referenceEl.value?.ownerDocument.defaultView

    if (ownerWindow) {
      ownerWindow.setTimeout(() => {
        if (request === closeOnNextPanelFocusOutRequest) {
          closeOnNextPanelFocusOut = false
        }
      }, 0)
    } else {
      queueMicrotask(() => {
        if (request === closeOnNextPanelFocusOutRequest) {
          closeOnNextPanelFocusOut = false
        }
      })
    }
    return
  }

  const isComposing = event.isComposing || event.keyCode === 229

  if (isComposing) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose(true)
    return
  }

  const target = event.target

  if (!(target instanceof Element)) {
    return
  }

  const isSearchInput = Boolean(target.closest('[data-model-selector-search-input]'))
  const isListbox = Boolean(target.closest('[role="listbox"]'))

  if (!isSearchInput && !isListbox && isAuxiliaryInteractiveTarget(target)) {
    return
  }

  if (!isSearchInput && !isListbox) {
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    navigation.moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    return
  }

  if (!isSearchInput && (event.key === 'Home' || event.key === 'End')) {
    event.preventDefault()
    navigation.highlightBoundary(event.key === 'Home' ? 'first' : 'last')
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectHighlightedOption()
    return
  }

  if (!isSearchInput && (event.key === ' ' || event.key === 'Spacebar')) {
    event.preventDefault()
    selectHighlightedOption()
  }
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null
  const eventTarget = event.target as Node | null
  const nextTargetIsReference = Boolean(nextTarget && referenceEl.value?.contains(nextTarget))
  const nextTargetIsFloating = Boolean(nextTarget && floatingEl.value?.contains(nextTarget))
  const focusLeavesPanelThroughTab = Boolean(
    closeOnNextPanelFocusOut && eventTarget && floatingEl.value?.contains(eventTarget),
  )

  if (nextTargetIsFloating || (nextTargetIsReference && !focusLeavesPanelThroughTab)) {
    return
  }

  requestClose(false)
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
  matchTriggerWidth: () => props.matchTriggerWidth,
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
  () => props.searchable,
  () => {
    filter.clearQuery()

    if (isOpen.value) {
      void focusPanelPrimary()
    }
  },
)

watch(
  [isOpen, isMounted],
  async ([open, mounted], previous) => {
    if (!open) {
      filter.clearQuery()
      navigation.resetHighlight()

      if (previous?.[0]) {
        const shouldRestoreFocus = pendingFocusRestore.value ?? isFocusInsideFloating()
        pendingFocusRestore.value = null

        if (shouldRestoreFocus) {
          await nextTick()
          focusTrigger()
        }
      }

      return
    }

    if (!mounted) {
      return
    }

    filter.clearQuery()
    navigation.highlightSelectedOrBoundary(requestedInitialHighlight.value)
    requestedInitialHighlight.value = 'first'
    void focusPanelPrimary()
  },
  { immediate: true },
)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <div class="tr-model-selector" :class="[`tr-model-selector--${variant}`, `tr-model-selector--${size}`]">
    <span ref="referenceEl" class="tr-model-selector__anchor" @focusout="handleFocusOut">
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
        @keydown="handleTriggerKeydown"
      >
        <template v-if="$slots.trigger" #default>
          <slot
            name="trigger"
            :value="state.value.value"
            :option="currentOption?.raw ?? null"
            :label="triggerLabel"
            :open="isOpen"
            :disabled="disabled"
            :reasoning-effort="activeEffort"
            :reasoning-effort-option="effortState.activeOption.value"
          />
        </template>
      </ModelSelectorTrigger>
    </span>

    <Teleport v-if="isMounted && teleportTarget" :to="teleportTarget">
      <div
        v-if="isOpen"
        ref="floatingEl"
        class="tr-model-selector__dropdown-wrapper"
        :class="{ 'is-positioned': isPositioned }"
        v-bind="teleportThemeAttrs"
      >
        <div class="tr-model-selector__dropdown-surface">
          <ModelSelectorPanel
            ref="panelRef"
            :query="filter.query.value"
            :searchable="searchable"
            :groups="filter.groups.value"
            :is-empty="filter.isEmpty.value"
            :selected-value="state.value.value"
            :highlighted-key="navigation.highlightedKey.value"
            :active-descendant-id="activeDescendantId"
            :listbox-id="listboxId"
            :option-id-prefix="idPrefix"
            :search-placeholder="searchPlaceholder"
            :empty-text="emptyText"
            :search-aria-label="resolvedSearchAriaLabel"
            :list-aria-label="resolvedListAriaLabel"
            :effort-options="currentEfforts"
            :effort-value="activeEffort"
            :effort-label="reasoningEffortLabel"
            :effort-aria-label="resolvedReasoningEffortAriaLabel"
            :effort-disabled="Boolean(currentOption?.disabled)"
            :size="size"
            :content-class="contentClass"
            :content-style="contentStyle"
            @update:query="filter.setQuery"
            @hover="navigation.setHighlightedKey"
            @select="handleSelectByKey"
            @select-effort="handleSelectEffort"
            @keydown="handlePanelKeydown"
            @focusout="handleFocusOut"
          >
            <template v-if="$slots['panel-header']" #panel-header>
              <slot
                name="panel-header"
                :value="state.value.value"
                :option="currentOption?.raw ?? null"
                :query="filter.query.value"
                :close="closeFromSlot"
              />
            </template>
            <template v-if="$slots.item" #item="slotProps">
              <slot name="item" v-bind="slotProps" />
            </template>
            <template v-if="$slots['group-label']" #group-label="slotProps">
              <slot name="group-label" v-bind="slotProps" />
            </template>
            <template v-if="$slots.empty" #empty="slotProps">
              <slot name="empty" v-bind="slotProps" />
            </template>
            <template v-if="$slots.footer" #footer>
              <slot
                name="footer"
                :value="state.value.value"
                :option="currentOption?.raw ?? null"
                :query="filter.query.value"
                :close="closeFromSlot"
                :reasoning-efforts="currentEfforts"
                :reasoning-effort="activeEffort"
                :reasoning-effort-option="effortState.activeOption.value"
                :set-reasoning-effort="handleSelectEffort"
              />
            </template>
          </ModelSelectorPanel>
        </div>
      </div>
    </Teleport>
  </div>
</template>
