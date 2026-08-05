<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { createDeepSeekResponseProvider } from '../deepseek-provider'
import { TrChat, useLocalChatRuntime } from '../../src'
import type { ChatUIOptions } from '../../src'

const prompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

const runtime = useLocalChatRuntime({
  conversation: {
    useMessageOptions: {
      responseProvider: createDeepSeekResponseProvider(),
    },
  },
  titleFallback: (text) => text.trim().slice(0, 20) || '新对话',
})
const isMobile = useMediaQuery('(max-width: 768px)')

const ui = computed<ChatUIOptions>(() => ({
  leftAside: {
    mode: isMobile.value ? 'drawer' : 'dock',
    defaultOpen: !isMobile.value,
    width: isMobile.value ? 280 : 260,
  },
  welcome: {
    title: 'Built-in Kit Runtime',
    description: '由 Chat 创建并装配 Kit 会话状态，并通过 DeepSeek 验证流式消息。',
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
      placeholder: '输入消息验证 Built-in Kit + DeepSeek 流式输出',
    },
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
