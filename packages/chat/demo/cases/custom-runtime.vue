<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { TrChat } from '../../src'
import { useCustomRuntime } from './useCustomRuntime'
import type { ChatUIOptions } from '../../src'

const prompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

const runtime = useCustomRuntime()
const isMobile = useMediaQuery('(max-width: 768px)')

const ui = computed<ChatUIOptions>(() => ({
  leftAside: {
    mode: isMobile.value ? 'drawer' : 'dock',
    defaultOpen: !isMobile.value,
    width: isMobile.value ? 280 : 260,
  },
  welcome: {
    title: 'Custom Runtime',
    description: '用户自有数据层适配为 ChatRuntime，并通过 DeepSeek 验证流式输出。',
  },
  prompts: {
    wrap: true,
    items: prompts,
  },
  messages: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        user: { placement: 'end' },
        assistant: { placement: 'start' },
      },
    },
  },
  composer: {
    sender: {
      mode: 'multiple',
      placeholder: '输入消息验证 Custom Runtime + DeepSeek 流式输出',
    },
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
