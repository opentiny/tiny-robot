<script setup lang="ts">
import { computed, onUnmounted, provide, ref, watchEffect } from 'vue'
import {
  COLOR_MODE_ATTR_NAME,
  COLOR_MODE_KEY,
  RESOLVED_COLOR_MODE_KEY,
  STORAGE_COLOR_MODE_KEY,
  STORAGE_KEY,
} from './constants'
import type { ColorMode, ThemeStorage } from './index.type'
import { THEME_ATTR_NAME } from './constants'

const props = withDefaults(
  defineProps<{
    colorMode?: ColorMode
    targetElement?: string
    themes?: {
      dark?: string
      light?: string
    }
    storage?: ThemeStorage
    storageKey?: string
  }>(),
  {
    targetElement: 'html',
    storageKey: 'tiny-robot-color-mode',
  },
)

const innerColorMode = defineModel<ColorMode>('colorMode', {
  default: 'auto',
  validator: (value) => ['light', 'dark', 'auto'].includes(value as ColorMode),
})

// 如果启用了 storage，则从 storage 中获取 colorMode
if (props.storage) {
  innerColorMode.value = (props.storage.getItem(props.storageKey) as ColorMode | null) || innerColorMode.value
}

provide(COLOR_MODE_KEY, innerColorMode)
provide(STORAGE_KEY, props.storage)
provide(STORAGE_COLOR_MODE_KEY, props.storageKey)

const matchDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemMode = ref<'light' | 'dark'>(matchDarkQuery.matches ? 'dark' : 'light')
const handleMatchDarkChange = (e: MediaQueryListEvent) => {
  systemMode.value = e.matches ? 'dark' : 'light'
}
matchDarkQuery.addEventListener('change', handleMatchDarkChange)
onUnmounted(() => {
  matchDarkQuery.removeEventListener('change', handleMatchDarkChange)
})

const resolvedColorMode = computed(() => {
  if (innerColorMode.value === 'auto') {
    return systemMode.value
  }
  return innerColorMode.value
})

provide(RESOLVED_COLOR_MODE_KEY, resolvedColorMode)

// TODO 添加默认值，需要提供默认主题
const defaultTheme = ''

// 应用主题到指定选择器
watchEffect(
  () => {
    const targetElement = document.querySelector(props.targetElement)
    if (!targetElement) return

    targetElement.setAttribute(COLOR_MODE_ATTR_NAME, resolvedColorMode.value)

    if (resolvedColorMode.value === 'light') {
      targetElement.setAttribute(THEME_ATTR_NAME, props.themes?.light || defaultTheme)
    } else {
      targetElement.setAttribute(THEME_ATTR_NAME, props.themes?.dark || defaultTheme)
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <slot />
</template>
