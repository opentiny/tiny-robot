<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { TrChat } from '../../src'
import { useCustomRuntime } from './useCustomRuntime'
import type { ChatConversationInfo, ChatSubmitPayload, ChatUi } from '../../src'

const prompts = [
  { label: '介绍一下 TinyRobot Chat' },
  { label: '生成一个 Vue 组件示例' },
  { label: '解释 runtime 和 ui 的职责' },
]

const runtime = useCustomRuntime()
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
    title: 'Custom Runtime',
    description: '用户自有数据层适配为 ChatRuntime。',
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
    placeholder: '输入消息验证自定义 Runtime 路径',
    onSubmit: handleSubmit,
    onFocus: handleFocus,
  },
}))
</script>

<template>
  <TrChat :runtime="runtime" :ui="ui" />
</template>
