<script setup lang="ts">
import { TrChat, useManagedChatRuntime, type ChatParts } from '../../src'
import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'

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
          content: `Managed runtime 回复：${lastMessage?.content ?? ''}`,
        },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const runtime = useManagedChatRuntime({
  useMessageOptions: {
    responseProvider,
  },
})

const parts: ChatParts = {
  layout: {
    leftAside: {
      defaultOpen: true,
      expandedWidth: 260,
    },
  },
  messages: {
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
  },
  composer: {
    sender: {
      mode: 'multiple',
      placeholder: '输入消息验证 managed runtime',
    },
  },
}
</script>

<template>
  <TrChat :runtime="runtime" :parts="parts" />
</template>
