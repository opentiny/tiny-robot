<script setup lang="ts">
import { createDemoResponseProvider } from '../scenario'
import { TrChat, useLocalChatRuntime } from '../../src'
import { createDemoStorage, useDemoChatUi } from './shared'

const runtime = useLocalChatRuntime(
  {
    storage: createDemoStorage(),
    useMessageOptions: {
      responseProvider: createDemoResponseProvider('Built-in Kit Runtime'),
    },
  },
  {
    titleFallback: (text) => text.trim().slice(0, 20) || '新对话',
  },
)
const { isMobile, ui } = useDemoChatUi({
  title: 'Built-in Kit Runtime',
  description: '由 Chat 创建并装配 Kit 会话状态。',
  placeholder: '输入消息验证内置 Kit 路径',
})
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
