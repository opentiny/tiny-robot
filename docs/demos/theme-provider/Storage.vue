<template>
  <div id="theme-provider-storage">
    <tr-theme-provider target-element="#theme-provider-storage" :storage="storage" :storage-key="storageKey">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './StorageComp.vue'

const storage = localStorage
const storageKey = 'custom-theme-data-storage'
</script>

<style scoped>
[data-tr-theme='custom-theme'][data-tr-color-mode='light'] {
  --tr-prompt-bg: #fff7ed;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.08);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.04);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
}
[data-tr-theme='custom-theme'][data-tr-color-mode='dark'] {
  --tr-prompt-bg: #1c1917;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.25);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.08);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.15);
  --tr-prompt-title-color: #fed7aa;
  --tr-prompt-description-color: #fbbf24;
}
</style>
