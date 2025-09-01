<template>
  <div id="theme-provider-nested-one">
    <tr-theme-provider target-element="#theme-provider-nested-one" theme="custom-theme">
      <Comp></Comp>
      <hr />
      <div id="theme-provider-nested-two">
        <p>我在嵌套的 ThemeProvider 中，默认使用 TinyRobot 的默认主题</p>
        <tr-theme-provider target-element="#theme-provider-nested-two">
          <Comp></Comp>
        </tr-theme-provider>
      </div>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ThemeComp.vue'
</script>

<style scoped>
#theme-provider-nested-one,
#theme-provider-nested-two {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

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
