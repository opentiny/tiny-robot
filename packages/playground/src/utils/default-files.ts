export function getDefaultFiles() {
  return [
    {
      filename: 'src/App.vue',
      code: `<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
</script>
`,
    },
    {
      filename: 'src/index.css',
      code: `@import url('https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@0.3.0-rc.5/dist/style.css');`,
    },
  ]
}
