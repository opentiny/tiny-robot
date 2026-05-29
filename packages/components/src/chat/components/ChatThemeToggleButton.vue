<script setup lang="ts">
import { computed, h } from 'vue'
import IconButton from '../../icon-button'
import { useTheme } from '../../theme-provider/useTheme'

const props = defineProps<{
  lightLabel: string
  darkLabel: string
}>()

const { resolvedColorMode, toggleColorMode } = useTheme()

const isDark = computed(() => resolvedColorMode?.value === 'dark')
const themeLabel = computed(() => (isDark.value ? props.darkLabel : props.lightLabel))

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
          d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
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
