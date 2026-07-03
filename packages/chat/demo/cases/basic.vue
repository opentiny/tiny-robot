<script setup lang="ts">
import { TrChat, useLocalChatRuntime, type ChatUi } from '../../src'
import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'

const responseProvider: ResponseProvider<ChatCompletion> = async (requestBody) => {
  const lastMessage = requestBody.messages.at(-1)

  return {
    id: 'chat-demo-completion',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'mock',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `Local runtime 回复：${lastMessage?.content ?? ''}`,
        },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const runtime = useLocalChatRuntime({
  useMessageOptions: {
    responseProvider,
  },
})

const isMobile = useMediaQuery('(max-width: 768px)')

const ui = computed<ChatUi>(() => ({
  layout: {
    leftAside: {
      mode: isMobile.value ? 'drawer' : 'dock',
      defaultOpen: !isMobile.value,
      expandedWidth: isMobile.value ? 280 : 260,
    },
  },
  welcome: {
    title: 'How can I help you today?',
    description: '',
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
    placeholder: '输入消息验证 local runtime',
  },
}))
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
