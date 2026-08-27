<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { computed, type VNode } from 'vue'
import type { ModelSelectorIcon, ModelSelectorSize, ModelSelectorVariant } from '../index.type'

defineOptions({ name: 'TrModelSelectorTrigger' })

const props = defineProps<{
  open: boolean
  disabled: boolean
  label: string
  effortLabel?: string
  icon?: ModelSelectorIcon
  controlsId: string
  triggerAriaLabel: string
  variant: ModelSelectorVariant
  size: ModelSelectorSize
}>()

const title = computed(() => (props.effortLabel ? `${props.label} · ${props.effortLabel}` : props.label))

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
    :title="title"
    :disabled="disabled"
    :aria-label="triggerAriaLabel"
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
        <span class="tr-model-selector__trigger-label">{{ label }}</span>
        <span v-if="effortLabel" class="tr-model-selector__trigger-effort">{{ effortLabel }}</span>
      </span>
      <IconArrowDown class="tr-model-selector__trigger-chevron" aria-hidden="true" focusable="false" />
    </slot>
  </button>
</template>
