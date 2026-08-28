<script setup lang="ts">
import { IconCheck } from '@opentiny/tiny-robot-svgs'
import type { VNode } from 'vue'
import type { ModelSelectorItemSlotProps, ModelSelectorOption } from '../index.type'
import type { NormalizedModelSelectorOption } from '../internal.type'

defineOptions({ name: 'TrModelSelectorItem' })

const props = defineProps<{
  option: NormalizedModelSelectorOption
  selected: boolean
  highlighted: boolean
  optionId: string
  descriptionId: string
}>()

const emit = defineEmits<{
  hover: [key: string]
  select: [option: ModelSelectorOption]
}>()

defineSlots<{
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
}>()

function handleMouseEnter() {
  if (!props.option.disabled) {
    emit('hover', props.option.key)
  }
}

function handleSelect() {
  if (!props.option.disabled) {
    emit('select', props.option.raw)
  }
}
</script>

<template>
  <div
    :id="optionId"
    class="tr-model-selector__option"
    :class="{
      'is-selected': selected,
      'is-highlighted': highlighted,
      'is-disabled': option.disabled,
    }"
    :data-model-selector-option-key="option.key"
    role="option"
    :aria-selected="selected"
    :aria-disabled="option.disabled || undefined"
    :aria-describedby="option.description && !$slots.item ? descriptionId : undefined"
    @mouseenter="handleMouseEnter"
    @mousedown.prevent
    @click="handleSelect"
  >
    <slot name="item" :option="option.raw" :selected="selected" :highlighted="highlighted">
      <span class="tr-model-selector__option-main">
        <img
          v-if="typeof option.icon === 'string'"
          :src="option.icon"
          class="tr-model-selector__option-icon"
          alt=""
          aria-hidden="true"
        />
        <component
          :is="option.icon"
          v-else-if="option.icon"
          class="tr-model-selector__option-icon"
          aria-hidden="true"
          focusable="false"
        />
        <span class="tr-model-selector__option-copy">
          <span class="tr-model-selector__option-label" :title="option.label">{{ option.label }}</span>
          <span
            v-if="option.description"
            :id="descriptionId"
            class="tr-model-selector__option-description"
            :title="option.description"
          >
            {{ option.description }}
          </span>
        </span>
      </span>
      <IconCheck v-if="selected" class="tr-model-selector__option-check" aria-hidden="true" focusable="false" />
    </slot>
  </div>
</template>
