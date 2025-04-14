<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tiny-bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      :max-width="maxWidth + '%'"
    ></tiny-bubble-item>
    <hr style="width: 100%" />
    <div style="display: flex; align-items: center">
      <label style="font-size: 12px; margin-right: 8px">调整最大宽度</label>
      <tiny-slider v-model="maxWidth" :max="100" :min="30"></tiny-slider>
      <label style="font-size: 12px; margin-left: 24px">当前值：{{ maxWidth + '%' }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const maxWidth = ref(80)
</script>
