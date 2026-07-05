<script setup lang="ts">
import { TrChat, useLocalChatRuntime } from '../../src'
import { createDemoResponseProvider, createDemoStorage, useDemoChatUi } from './shared'

const runtime = useLocalChatRuntime(
  {
    storage: createDemoStorage(),
    useMessageOptions: {
      responseProvider: createDemoResponseProvider('Kit quick start'),
    },
  },
  {
    titleFallback: (text) => text.trim().slice(0, 20) || '新对话',
  },
)

const { isMobile, ui } = useDemoChatUi({
  title: 'Kit Quick Start',
  placeholder: '输入消息验证 kit 快速入口',
})
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
