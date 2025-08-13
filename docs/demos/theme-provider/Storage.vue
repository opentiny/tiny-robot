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
