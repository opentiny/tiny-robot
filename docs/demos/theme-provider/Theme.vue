<template>
  <div id="theme-provider-theme">
    <tr-theme-provider target-element="#theme-provider-theme" theme="custom-theme">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ThemeComp.vue'
</script>
