<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutPanel } from './composables/useLayoutPanel'
import type { LayoutAsideToggleProps } from './internal.type'

defineOptions({
  name: 'LayoutAsideToggle',
})

const props = defineProps<LayoutAsideToggleProps>()

const { isOpen, toggle } = useLayoutPanel(() => props.placement)

const slotProps = computed(() => ({
  isOpen: isOpen.value,
}))

const fallbackTexts = {
  left: {
    expanded: 'Collapse navigation',
    collapsed: 'Expand navigation',
  },
  right: {
    expanded: 'Hide side panel',
    collapsed: 'Show side panel',
  },
} as const

const fallbackText = computed(() => {
  const text = fallbackTexts[props.placement]
  return isOpen.value ? text.expanded : text.collapsed
})
</script>

<template>
  <button class="tr-layout-aside-toggle" type="button" @click="toggle">
    <slot v-bind="slotProps">
      {{ fallbackText }}
    </slot>
  </button>
</template>

<style scoped>
.tr-layout-aside-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
</style>
