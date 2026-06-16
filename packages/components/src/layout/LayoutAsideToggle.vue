<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutContext } from './composables/useLayoutContext'
import type { LayoutAsideToggleProps } from './internal.type'

defineOptions({
  name: 'LayoutAsideToggle',
})

const props = defineProps<LayoutAsideToggleProps>()

const layout = useLayoutContext()
const panel = computed(() => (props.placement === 'left' ? layout.left : layout.right))

const slotProps = computed(() => ({
  isOpen: panel.value.state.isOpen.value,
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
  return panel.value.state.isOpen.value ? text.expanded : text.collapsed
})
</script>

<template>
  <button class="tr-layout-aside-toggle" type="button" @click="panel.actions.toggle">
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
