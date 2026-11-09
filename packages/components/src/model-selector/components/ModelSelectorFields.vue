<script setup lang="ts">
import { computed } from 'vue'
import type { ModelSelectorFeatureValue, ModelSelectorFeatureValues, ModelSelectorField } from '../index.type'
import { normalizeModelFields } from '../featureFields'

const props = defineProps<{
  fields: readonly ModelSelectorField[]
  values: ModelSelectorFeatureValues
  disabled: boolean
}>()
defineEmits<{ change: [key: string, value: ModelSelectorFeatureValue] }>()
const normalizedFields = computed(() => normalizeModelFields(props.fields))
</script>

<template>
  <div class="tr-model-selector__fields">
    <div
      v-for="field in normalizedFields"
      :key="field.key"
      class="tr-model-selector__field"
      :data-field-key="field.key"
    >
      <span class="tr-model-selector__field-label">{{ field.label }}</span>
      <button
        v-if="field.type === 'switch'"
        type="button"
        role="switch"
        class="tr-model-selector__field-switch"
        :aria-label="field.label"
        :aria-checked="values[field.key] === true"
        :disabled="disabled || field.disabled"
        @click="$emit('change', field.key, values[field.key] !== true)"
      >
        <span />
      </button>
      <div v-else class="tr-model-selector__field-options" role="group" :aria-label="field.label">
        <button
          v-for="option in field.options"
          :key="option.value"
          type="button"
          class="tr-model-selector__field-option"
          :class="{ 'is-active': values[field.key] === option.value }"
          :disabled="disabled || field.disabled || option.disabled"
          :aria-pressed="values[field.key] === option.value"
          @click="$emit('change', field.key, option.value)"
        >
          {{ option.label }}
        </button>
        <span v-if="values[field.key] === undefined" class="tr-model-selector__field-empty" role="status">—</span>
      </div>
    </div>
  </div>
</template>
