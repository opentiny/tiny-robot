<script setup lang="ts">
import { computed, type VNode } from 'vue'
import type { ModelSelectorGroupLabelSlotProps, ModelSelectorItemSlotProps, ModelSelectorValue } from '../index.type'
import type { ModelSelectorOptionGroup } from '../internal.type'
import ModelSelectorItem from './ModelSelectorItem.vue'

defineOptions({ name: 'TrModelSelectorGroup' })

const props = defineProps<{
  group: ModelSelectorOptionGroup
  selectedValue: ModelSelectorValue
  highlightedKey: string | null
  optionIdPrefix: string
}>()

defineEmits<{
  hover: [key: string]
  select: [key: string]
}>()

defineSlots<{
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  'group-label'?: (props: ModelSelectorGroupLabelSlotProps) => VNode | VNode[]
}>()

const groupModels = computed(() => props.group.items.map((option) => option.raw))
</script>

<template>
  <div
    class="tr-model-selector__group"
    :role="group.label || $slots['group-label'] ? 'group' : 'presentation'"
    :aria-labelledby="group.label || $slots['group-label'] ? `${optionIdPrefix}-group-${group.index}` : undefined"
  >
    <div
      v-if="group.label || $slots['group-label']"
      :id="`${optionIdPrefix}-group-${group.index}`"
      class="tr-model-selector__group-title"
    >
      <slot name="group-label" :group="group.group" :label="group.label" :models="groupModels">
        {{ group.label }}
      </slot>
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
