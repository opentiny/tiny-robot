<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import CustomerAssistantApp from './examples/CustomerAssistantApp.vue'
</script>

<template>
  <TrThemeProvider color-mode="light">
    <CustomerAssistantApp />
  </TrThemeProvider>
</template>
