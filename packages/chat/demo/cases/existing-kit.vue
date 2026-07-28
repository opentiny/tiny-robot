<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { localStorageStrategyFactory, useConversation } from '@opentiny/tiny-robot-kit'
import { createDeepSeekResponseProvider } from '../deepseek-provider'
import { TrChat, useKitChatRuntime } from '../../src'
import type { ChatConversationInfo, ChatSubmitPayload, ChatUi } from '../../src'

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
const lastUiEvent = shallowRef('')

function handleItemClick(item: ChatConversationInfo) {
  lastUiEvent.value = `history:${item.id}`
}

function handleSubmit(payload: ChatSubmitPayload) {
  lastUiEvent.value = `submit:${payload.text}`
}

function handleFocus() {
  lastUiEvent.value = 'focus'
}

const ui = computed<ChatUi>(() => ({
  layout: {
    leftAside: {
      mode: isMobile.value ? 'drawer' : 'dock',
      defaultOpen: !isMobile.value,
      expandedWidth: isMobile.value ? 280 : 260,
    },
  },
  history: {
    onItemClick: handleItemClick,
  },
  welcome: {
    title: 'Existing Kit Runtime',
    description: '复用已有 useConversation()，并通过 DeepSeek 验证迁移后的流式输出。',
  },
  prompts: {
    wrap: true,
    items: prompts,
  },
  bubbleList: {
    autoScroll: true,
    roleConfigs: {
      user: { placement: 'end' },
      assistant: { placement: 'start' },
    },
  },
  sender: {
    mode: 'multiple',
    placeholder: '输入消息验证 Existing Kit + DeepSeek 流式输出',
    onSubmit: handleSubmit,
    onFocus: handleFocus,
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
