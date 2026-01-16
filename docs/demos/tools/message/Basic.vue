<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="sendMessage"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

// Get BASE_URL from import.meta if available, otherwise use empty string
interface ImportMetaEnv {
  BASE_URL?: string
}
interface ImportMetaWithEnv extends ImportMeta {
  env?: ImportMetaEnv
}
const meta = typeof import.meta !== 'undefined' ? (import.meta as ImportMetaWithEnv) : null
const baseUrl = meta?.env?.BASE_URL || ''
const apiUrl = window.parent?.location.origin || location.origin + baseUrl

const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  responseProvider: async (requestBody, abortSignal) => {
    const response = await fetch(`${apiUrl}/api/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({ ...requestBody, stream: true }),
      signal: abortSignal,
    })
    return sseStreamToGenerator(response, { signal: abortSignal })
  },
  initialMessages: [
    {
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      role: 'assistant',
    },
  ],
})

const inputMessage = ref('')

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}
</script>
