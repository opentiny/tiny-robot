<script setup lang="ts">
import { ref } from 'vue'
import ThemeProvider from '../../../components/src/theme-provider/index.vue'
import type { ThemeStorage } from '../../../components/src/theme-provider/index.type'
import ThemeConsumer from './ThemeConsumer.vue'

const theme = ref('ocean')
const colorMode = ref<'light' | 'dark' | 'auto'>('auto')

const storedValue = ref(JSON.stringify({ theme: 'stored-theme', colorMode: 'dark', retained: 'yes' }))
const storage: ThemeStorage = {
  getItem: (key) => (key === 'custom-theme-key' ? storedValue.value : null),
  setItem: (key, value) => {
    if (key === 'custom-theme-key') storedValue.value = value
  },
}

const malformedValue = ref('{not-json')
const malformedStorage: ThemeStorage = {
  getItem: () => malformedValue.value,
  setItem: (_key, value) => {
    malformedValue.value = value
  },
}
</script>

<template>
  <main>
    <ThemeProvider theme="default-theme" color-mode="light">
      <span data-testid="default-slot">Default provider slot</span>
    </ThemeProvider>

    <div id="controlled-theme-target" data-testid="controlled-target"></div>
    <ThemeProvider v-model:theme="theme" v-model:color-mode="colorMode" target-element="#controlled-theme-target">
      <ThemeConsumer prefix="controlled" />
    </ThemeProvider>
    <output data-testid="controlled-theme-model">{{ theme }}</output>
    <output data-testid="controlled-mode-model">{{ colorMode }}</output>

    <div id="stored-theme-target" data-testid="stored-target"></div>
    <ThemeProvider
      theme="fallback-theme"
      color-mode="light"
      target-element="#stored-theme-target"
      :storage="storage"
      storage-key="custom-theme-key"
    >
      <ThemeConsumer prefix="stored" />
    </ThemeProvider>
    <output data-testid="stored-value">{{ storedValue }}</output>

    <div id="malformed-theme-target" data-testid="malformed-target"></div>
    <ThemeProvider
      theme="safe-theme"
      color-mode="light"
      target-element="#malformed-theme-target"
      :storage="malformedStorage"
    >
      <span data-testid="malformed-slot">Malformed storage provider</span>
    </ThemeProvider>

    <ThemeConsumer prefix="outside" />
  </main>
</template>
