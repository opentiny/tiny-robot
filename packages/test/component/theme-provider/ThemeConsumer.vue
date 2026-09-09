<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../../../components/src/theme-provider/useTheme'

defineProps<{ prefix: string }>()

const { theme, colorMode, resolvedColorMode, systemColorMode, setTheme, setColorMode, toggleColorMode } = useTheme()
const lastResult = ref('')

const run = (operation: () => boolean) => {
  lastResult.value = String(operation())
}
</script>

<template>
  <div :data-testid="`${prefix}-consumer`">
    <button type="button" @click="run(() => setTheme('forest'))">Set forest theme</button>
    <button type="button" @click="run(() => setColorMode('auto'))">Set auto mode</button>
    <button type="button" @click="run(() => setColorMode('dark'))">Set dark mode</button>
    <button type="button" @click="run(toggleColorMode)">Toggle color mode</button>
    <output :data-testid="`${prefix}-theme`">{{ theme }}</output>
    <output :data-testid="`${prefix}-color-mode`">{{ colorMode }}</output>
    <output :data-testid="`${prefix}-resolved-mode`">{{ resolvedColorMode }}</output>
    <output :data-testid="`${prefix}-system-mode`">{{ systemColorMode }}</output>
    <output :data-testid="`${prefix}-result`">{{ lastResult }}</output>
  </div>
</template>
