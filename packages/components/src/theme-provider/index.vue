<script setup lang="ts">
import { computed, onUnmounted, provide, ref, watch, watchEffect } from 'vue'
import {
  COLOR_MODE,
  COLOR_MODE_ATTR_NAME,
  RESOLVED_COLOR_MODE,
  SYSTEM_COLOR_MODE,
  THEME,
  THEME_ATTR_NAME,
} from './constants'
import type { ColorMode, ThemeProviderProps } from './index.type'

const props = withDefaults(defineProps<ThemeProviderProps>(), {
  targetElement: 'html',
  storageKey: 'tiny-robot-theme-data',
})

const getThemeDataFromStorage = () => {
  if (!props.storage) return {}

  let themeData: { theme?: string; colorMode?: ColorMode } = {}
  try {
    themeData = JSON.parse(props.storage.getItem(props.storageKey) || '{}')
  } catch {}

  return themeData
}

const saveThemeDataToStorage = (themeData: { theme?: string; colorMode?: ColorMode }) => {
  if (!props.storage) return

  const oldThemeData = getThemeDataFromStorage()
  const newThemeData = { ...oldThemeData, ...themeData }
  props.storage.setItem(props.storageKey, JSON.stringify(newThemeData))
}

const innerTheme = defineModel<string>('theme', { default: '' })
const innerColorMode = defineModel<ColorMode>('colorMode', {
  default: 'auto',
  validator: (value) => ['light', 'dark', 'auto'].includes(value as ColorMode),
})

// 如果启用了 storage，则从 storage 中获取数据
if (props.storage) {
  const themeData = getThemeDataFromStorage()
  if (typeof themeData.theme === 'string') {
    innerTheme.value = themeData.theme
  }
  if (themeData.colorMode === 'auto' || themeData.colorMode === 'light' || themeData.colorMode === 'dark') {
    innerColorMode.value = themeData.colorMode
  }
}

const systemMode = ref<'light' | 'dark'>('light')

if (typeof window !== 'undefined') {
  const matchDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemMode.value = matchDarkQuery.matches ? 'dark' : 'light'

  const handleMatchDarkChange = (e: MediaQueryListEvent) => {
    systemMode.value = e.matches ? 'dark' : 'light'
  }
  matchDarkQuery.addEventListener('change', handleMatchDarkChange)
  onUnmounted(() => {
    matchDarkQuery.removeEventListener('change', handleMatchDarkChange)
  })
}

const resolvedColorMode = computed(() => {
  if (innerColorMode.value === 'auto') {
    return systemMode.value
  }
  return innerColorMode.value
})

provide(THEME, innerTheme)
provide(COLOR_MODE, innerColorMode)
provide(RESOLVED_COLOR_MODE, resolvedColorMode)
provide(SYSTEM_COLOR_MODE, systemMode)

// 应用主题到指定选择器
watchEffect(
  () => {
    if (typeof document === 'undefined') return

    const targetElement = document.querySelector(props.targetElement)
    if (!targetElement) return

    targetElement.setAttribute(THEME_ATTR_NAME, innerTheme.value)
    targetElement.setAttribute(COLOR_MODE_ATTR_NAME, resolvedColorMode.value)
  },
  { flush: 'post' },
)

watch(innerTheme, (newTheme) => {
  saveThemeDataToStorage({ theme: newTheme })
})

watch(innerColorMode, (newColorMode) => {
  saveThemeDataToStorage({ colorMode: newColorMode })
})
</script>

<template>
  <slot />
</template>
