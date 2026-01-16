<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在处理中...' : '请输入消息'"
      :loading="isProcessing"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { ChatMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

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

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好！我可以帮你处理流式响应。请发送一条消息试试。',
  },
])

const inputMessage = ref('')
const isProcessing = ref(false)
let abortController: AbortController | null = null

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

const sendMessage = async (content: string) => {
  if (!content.trim() || isProcessing.value) return

  // Add user message
  messages.value.push({
    role: 'user',
    content: content.trim(),
  })

  // Add placeholder for assistant message
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
  }
  messages.value.push(assistantMessage)

  isProcessing.value = true
  abortController = new AbortController()

  try {
    // Make fetch request
    const response = await fetch(`${apiUrl}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.value.slice(0, -1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Use sseStreamToGenerator to process stream
    for await (const chunk of sseStreamToGenerator(response, { signal: abortController.signal })) {
      const choice = chunk.choices?.[0]
      if (choice?.delta?.content) {
        // Append delta content to assistant message
        assistantMessage.content += choice.delta.content
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted')
      if (assistantMessage.content === '') {
        // Remove empty assistant message if aborted
        messages.value.pop()
      }
    } else {
      console.error('Error:', error)
      assistantMessage.content = `错误: ${error.message || '未知错误'}`
    }
  } finally {
    isProcessing.value = false
    abortController = null
  }
}

const abortRequest = () => {
  if (abortController) {
    abortController.abort()
  }
}
</script>
