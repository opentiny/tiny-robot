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
  --tr-prompt-bg-color: #fff7ed;
  --tr-prompt-hover-color: rgba(249, 115, 22, 0.08);
  --tr-prompt-active-color: rgba(249, 115, 22, 0.15);
  --tr-prompt-disabled-color: rgba(249, 115, 22, 0.04);
  --tr-prompt-box-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
  --tr-prompt-badge-bg-color: #fed7aa;
  --tr-prompt-badge-color: #ea580c;
}
[data-tr-theme='custom-theme'][data-tr-color-mode='dark'] {
  --tr-prompt-bg-color: #1c1917;
  --tr-prompt-hover-color: rgba(249, 115, 22, 0.15);
  --tr-prompt-active-color: rgba(249, 115, 22, 0.25);
  --tr-prompt-disabled-color: rgba(249, 115, 22, 0.08);
  --tr-prompt-box-shadow: 0 2px 12px rgba(249, 115, 22, 0.15);
  --tr-prompt-title-color: #fed7aa;
  --tr-prompt-description-color: #fbbf24;
  --tr-prompt-badge-bg-color: #92400e;
  --tr-prompt-badge-color: #fed7aa;
}
</style>
