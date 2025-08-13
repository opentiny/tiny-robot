<template>
  <div id="theme-provider-color-mode">
    <tr-theme-provider target-element="#theme-provider-color-mode">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ColorModeComp.vue'
</script>
