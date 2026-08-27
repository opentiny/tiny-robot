<script setup lang="ts">
import type { VNode } from 'vue'
import type { ModelSelectorItemSlotProps, ModelSelectorOption } from '../index.type'
import type { ModelSelectorOptionGroup } from '../internal.type'
import ModelSelectorItem from './ModelSelectorItem.vue'

defineOptions({ name: 'TrModelSelectorGroup' })

defineProps<{
  group: ModelSelectorOptionGroup
  selectedValue: string | null
  highlightedKey: string | null
  optionIdPrefix: string
}>()

defineEmits<{
  hover: [key: string]
  select: [option: ModelSelectorOption]
}>()

defineSlots<{
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
}>()
</script>

<template>
  <div
    class="tr-model-selector__group"
    :role="group.label ? 'group' : 'presentation'"
    :aria-labelledby="group.label ? `${optionIdPrefix}-group-${group.index}` : undefined"
  >
    <div v-if="group.label" :id="`${optionIdPrefix}-group-${group.index}`" class="tr-model-selector__group-title">
      {{ group.label }}
    </div>

    <ModelSelectorItem
      v-for="option in group.items"
      :key="option.key"
      :option="option"
      :selected="selectedValue === option.value"
      :highlighted="highlightedKey === option.key"
      :option-id="`${optionIdPrefix}-option-${option.index}`"
      :description-id="`${optionIdPrefix}-option-${option.index}-description`"
      @hover="$emit('hover', $event)"
      @select="$emit('select', $event)"
    >
      <template v-if="$slots.item" #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>
    </ModelSelectorItem>
  </div>
</template>
