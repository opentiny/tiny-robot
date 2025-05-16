<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
  ></tr-bubble>
  <hr />
  <div>
    <label style="margin-right: 8px">加载中</label>
    <tiny-switch v-model="loading"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const loading = ref(true)
</script>
