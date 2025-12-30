<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble
      content="简单介绍 TinyVue"
      :avatar="userAvatar"
      placement="end"
      style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
    ></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
      :avatar="aiAvatar"
      placement="start"
    ></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
</script>
