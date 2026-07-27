<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { createDemoResponseProvider } from '../scenario'
import { TrChat, useLocalChatRuntime } from '../../src'
import type { ChatConversationInfo, ChatSubmitPayload, ChatUi } from '../../src'

const prompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

const runtime = useLocalChatRuntime({
  conversation: {
    useMessageOptions: {
      responseProvider: createDemoResponseProvider('Built-in Kit Runtime'),
    },
  },
  titleFallback: (text) => text.trim().slice(0, 20) || '新对话',
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
    title: 'Built-in Kit Runtime',
    description: '由 Chat 创建并装配 Kit 会话状态。',
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
    placeholder: '输入消息验证内置 Kit 路径',
    onSubmit: handleSubmit,
    onFocus: handleFocus,
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
