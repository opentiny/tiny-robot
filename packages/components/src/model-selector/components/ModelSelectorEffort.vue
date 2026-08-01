<script setup lang="ts">
import type { ModelSelectorEffortOption, ModelSelectorEffortValue } from '../index.type'

defineOptions({ name: 'TrModelSelectorEffort' })

defineProps<{
  options: readonly ModelSelectorEffortOption[]
  value: ModelSelectorEffortValue
  label: string
  groupAriaLabel: string
  disabled: boolean
}>()

defineEmits<{
  select: [value: ModelSelectorEffortValue]
}>()
</script>

<template>
  <div class="tr-model-selector__effort">
    <span class="tr-model-selector__effort-label">{{ label }}</span>
    <div class="tr-model-selector__effort-options" role="group" :aria-label="groupAriaLabel">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="tr-model-selector__effort-option"
        :class="{ 'is-active': option.value === value }"
        :disabled="disabled || option.disabled"
        :aria-pressed="option.value === value"
        :data-model-selector-effort-value="option.value"
        @click="$emit('select', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
