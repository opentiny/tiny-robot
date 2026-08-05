<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { localStorageStrategyFactory, useConversation } from '@opentiny/tiny-robot-kit'
import { createDeepSeekResponseProvider } from '../deepseek-provider'
import { TrChat, useKitChatRuntime } from '../../src'
import type { ChatUIOptions } from '../../src'

const prompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

const conversation = useConversation({
  storage: localStorageStrategyFactory({
    key: 'tiny-robot-chat-existing-kit-demo',
  }),
  autoSaveMessages: true,
  useMessageOptions: {
    responseProvider: createDeepSeekResponseProvider(),
  },
})

const runtime = useKitChatRuntime({
  conversation,
})
const isMobile = useMediaQuery('(max-width: 768px)')

const ui = computed<ChatUIOptions>(() => ({
  leftAside: {
    mode: isMobile.value ? 'drawer' : 'dock',
    defaultOpen: !isMobile.value,
    width: isMobile.value ? 280 : 260,
  },
  welcome: {
    title: 'Existing Kit Runtime',
    description: '复用已有 useConversation()，并通过 DeepSeek 验证迁移后的流式输出。',
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
      placeholder: '输入消息验证 Existing Kit + DeepSeek 流式输出',
    },
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
