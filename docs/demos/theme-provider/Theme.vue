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

<style scoped>
[data-tr-theme='custom-theme'] {
  --tr-prompt-bg: #fff7ed;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.08);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.04);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
}
</style>
