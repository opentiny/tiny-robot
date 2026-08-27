<script setup lang="ts">
import type { ModelSelectorReasoningEffortOption } from '../index.type'

defineOptions({ name: 'TrModelSelectorEffort' })

defineProps<{
  options: readonly ModelSelectorReasoningEffortOption[]
  value: string | null
  label: string
  groupAriaLabel: string
  disabled: boolean
}>()

defineEmits<{
  select: [value: string | null]
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
