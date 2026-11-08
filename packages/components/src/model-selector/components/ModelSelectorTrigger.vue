<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { type Component, type VNode } from 'vue'
import type { ModelSelectorSize, ModelSelectorVariant } from '../index.type'

defineOptions({ name: 'TrModelSelectorTrigger' })

defineProps<{
  open: boolean
  disabled: boolean
  text: string
  icon?: Component | string
  controlsId: string
  variant: ModelSelectorVariant
  size: ModelSelectorSize
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
  enter: [event: KeyboardEvent]
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.defaultPrevented) {
    event.preventDefault()
    emit('enter', event)
  }
}

defineSlots<{
  default?: () => VNode | VNode[]
}>()
</script>

<template>
  <button
    type="button"
    class="tr-model-selector__trigger"
    :class="[`tr-model-selector__trigger--${variant}`, `tr-model-selector__trigger--${size}`, { 'is-open': open }]"
    :title="text"
    :disabled="disabled"
    :aria-label="text"
    :aria-expanded="open"
    :aria-controls="controlsId"
    aria-haspopup="listbox"
    @click="$emit('click', $event)"
    @keydown="handleKeydown"
  >
    <slot>
      <span class="tr-model-selector__trigger-content">
        <img
          v-if="typeof icon === 'string'"
          :src="icon"
          class="tr-model-selector__trigger-icon"
          alt=""
          aria-hidden="true"
        />
        <component
          :is="icon"
          v-else-if="icon"
          class="tr-model-selector__trigger-icon"
          aria-hidden="true"
          focusable="false"
        />
        <span class="tr-model-selector__trigger-label">{{ text }}</span>
      </span>
      <IconArrowDown class="tr-model-selector__trigger-chevron" aria-hidden="true" focusable="false" />
    </slot>
  </button>
</template>
