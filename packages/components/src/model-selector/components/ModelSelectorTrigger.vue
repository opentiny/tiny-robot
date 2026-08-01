<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { computed, type Component, type VNode } from 'vue'
import type { ModelSelectorSize, ModelSelectorVariant } from '../index.type'

defineOptions({ name: 'TrModelSelectorTrigger' })

const props = defineProps<{
  open: boolean
  disabled: boolean
  label: string
  effortLabel?: string
  icon?: Component
  controlsId: string
  triggerAriaLabel: string
  variant: ModelSelectorVariant
  size: ModelSelectorSize
}>()

const title = computed(() => (props.effortLabel ? `${props.label} · ${props.effortLabel}` : props.label))

defineEmits<{
  click: [event: MouseEvent]
  keydown: [event: KeyboardEvent]
}>()

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
    @keydown="$emit('keydown', $event)"
  >
    <slot>
      <span class="tr-model-selector__trigger-content">
        <component
          :is="icon"
          v-if="icon"
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
