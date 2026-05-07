<script setup lang="ts">
import { computed, getCurrentInstance, useId } from 'vue'
import { ThemeProvider } from '@opentiny/tiny-robot'
import type { ChatAppearanceConfig } from '@/types'

defineOptions({ name: 'ConditionalThemeProvider' })

const props = defineProps<{
  appearance?: ChatAppearanceConfig
  scopeIdPrefix?: string
}>()

const stableId = typeof useId === 'function' ? useId() : String(getCurrentInstance()?.uid ?? 'fallback')
const themeScopeId = computed(() => `${props.scopeIdPrefix ?? 'tr-theme-scope'}-${stableId}`)
const scopedThemeTargetElement = computed(() => `#${themeScopeId.value}`)

const scopedColorMode = computed(() => {
  const mode = props.appearance?.mode
  if (mode === 'light' || mode === 'dark') return mode
  if (mode === 'system') return 'auto'
  return undefined
})

const useThemeProvider = computed(() => Boolean(scopedColorMode.value))

defineExpose({ themeScopeId, scopedColorMode })
</script>

<template>
  <ThemeProvider v-if="useThemeProvider" :target-element="scopedThemeTargetElement" :color-mode="scopedColorMode">
    <slot :theme-scope-id="themeScopeId" :scoped-color-mode="scopedColorMode" />
  </ThemeProvider>
  <slot v-else :theme-scope-id="themeScopeId" :scoped-color-mode="undefined" />
</template>
