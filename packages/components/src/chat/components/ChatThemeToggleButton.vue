<script setup lang="ts">
import { computed, h } from 'vue'
import IconButton from '../../icon-button'
import { useTheme } from '../../theme-provider/useTheme'

const { resolvedColorMode, toggleColorMode } = useTheme()

const isDark = computed(() => resolvedColorMode?.value === 'dark')
const themeLabel = computed(() => (isDark.value ? 'Dark mode' : 'Light mode'))

const SunIcon = {
  render() {
    return h(
      'svg',
      { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' },
      [
        h('circle', { cx: '12', cy: '12', r: '4.25' }),
        h('path', {
          d: 'M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12H2.75M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46',
        }),
      ],
    )
  },
}

const MoonIcon = {
  render() {
    return h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      [
        h('path', {
          d: 'M14.5 2.75c-3.9 1.12-6.75 4.72-6.75 9 0 5.18 4.2 9.38 9.38 9.38 1.26 0 2.47-.25 3.57-.7-1.37 1.03-3.07 1.64-4.92 1.64-4.69 0-8.5-3.81-8.5-8.5 0-4 2.77-7.35 6.49-8.27.25-.06.5.11.48.37-.13.98-.03 2.01.25 3.08z',
        }),
      ],
    )
  },
}

const themeIcon = computed(() => (isDark.value ? MoonIcon : SunIcon))
</script>

<template>
  <IconButton
    :icon="themeIcon"
    size="28"
    svg-size="20"
    :title="themeLabel"
    :aria-label="themeLabel"
    @click="toggleColorMode()"
  />
</template>

<style scoped>
:deep(.tr-icon-button) {
  background: transparent;
}
</style>
