<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import type { ModelOption } from '@/types'
import { useChatPageInputs } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import { getProviderIcon } from '@/shared/utils/iconMap'
import { useModelSelector } from './useModelSelector'
import { useFloatingDropdown } from './useFloatingDropdown'
import { useKeyboardNavigation } from './useKeyboardNavigation'

defineOptions({ name: 'TrModelSelector' })

const props = defineProps<{
  models?: ModelOption[]
}>()

const emit = defineEmits<{
  change: [value: ModelOption]
}>()

const modelValue = defineModel<string>()
const pageInputs = useChatPageInputs()
const chatMessages = useResolvedChatMessages()
const modelSelectorInput = computed(() => pageInputs?.value.modelSelector)

const resolvedModels = computed(() => props.models ?? modelSelectorInput.value?.models ?? [])
const currentModel = computed<string>({
  get: () => modelValue.value ?? modelSelectorInput.value?.defaultModel ?? '',
  set: (value) => {
    modelValue.value = value
  },
}) as Ref<string>

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)

const { isOpen } = useFloatingDropdown(referenceEl, floatingEl)
const { currentProvider, selectModel } = useModelSelector({
  currentModel,
  models: resolvedModels,
  onChange: (model) => {
    emit('change', model)
  },
})

const { highlightedIndex, setHighlightedIndex } = useKeyboardNavigation({
  enabled: isOpen,
  itemCount: computed(() => resolvedModels.value.length),
  isItemDisabled: (index) => !!resolvedModels.value[index]?.disabled,
  onSelect: (index) => {
    const model = resolvedModels.value[index]
    if (model) {
      handleSelectModel(model)
    }
  },
  onClose: () => {
    isOpen.value = false
  },
})

function handleSelectModel(model: ModelOption) {
  selectModel(model)
  isOpen.value = false
}

function handleOpenDropdown() {
  isOpen.value = true
  const currentIndex = resolvedModels.value.findIndex((model) => model.value === currentModel.value)
  setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
}

function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    handleOpenDropdown()
  }
}

function handleMouseEnter(index: number) {
  if (resolvedModels.value[index]?.disabled) {
    return
  }

  highlightedIndex.value = index
}
</script>

<template>
  <div class="tr-model-selector__wrapper">
    <button
      ref="referenceEl"
      class="tr-model-selector__trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      :title="currentModel"
      :aria-label="chatMessages.modelSelector.triggerLabel"
    >
      <component v-if="currentProvider" :is="currentProvider" class="tr-model-selector__icon-provider" :size="20" />
      <svg
        class="tr-model-selector__chevron"
        :class="{ 'is-open': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <transition name="tr-model-selector-fade">
      <div v-if="isOpen" ref="floatingEl" class="tr-model-selector__dropdown-wrapper">
        <div class="tr-model-selector__dropdown">
          <div class="tr-model-selector__content">
            <div
              v-for="(model, index) in resolvedModels"
              :key="model.value"
              class="tr-model-selector__item"
              @mouseenter="handleMouseEnter(index)"
            >
              <button
                class="tr-model-selector__option"
                :class="{
                  'is-selected': currentModel === model.value,
                  'is-highlighted': highlightedIndex === index,
                  'is-disabled': model.disabled,
                }"
                @click="handleSelectModel(model)"
              >
                <div class="tr-model-selector__option-left">
                  <component
                    v-if="getProviderIcon(model)"
                    :is="getProviderIcon(model)"
                    class="tr-model-selector__option-icon"
                    :size="18"
                  />
                  <span class="tr-model-selector__option-label" :title="model.value">{{
                    model.label || model.value
                  }}</span>
                </div>
                <svg
                  v-if="currentModel === model.value"
                  class="tr-model-selector__check"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
