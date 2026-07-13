<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { RequestProcessingState, RequestState } from '@opentiny/tiny-robot-kit'
import { createDemoReply } from '../scenario'
import { useDemoChatUi } from './shared'
import { TrChat, type ChatMessageItem, type ChatRuntime } from '../../src'

const messages = shallowRef<ChatMessageItem[]>([])
const loading = shallowRef(false)
const requestState = shallowRef<RequestState>('idle')
const processingState = shallowRef<RequestProcessingState | undefined>()
const lastError = shallowRef<unknown | null>(null)

const runtime: ChatRuntime = {
  messages: {
    items: computed(() => messages.value),
    requestState,
    processingState,
    lastError,
  },
  sender: {
    disabled: computed(() => false),
    loading,
  },
  actions: {
    send: async ({ text }) => {
      const content = text.trim()

      if (!content) {
        return
      }

      const userMessages = [...messages.value, { role: 'user', content }]

      lastError.value = null
      loading.value = true
      requestState.value = 'processing'
      processingState.value = 'requesting'
      messages.value = userMessages

      await new Promise<void>((resolve) => window.setTimeout(resolve, 200))

      messages.value = [
        ...userMessages,
        {
          role: 'assistant',
          content: createDemoReply('Minimal Custom Runtime', content),
        },
      ]
      requestState.value = 'completed'
      loading.value = false
      processingState.value = undefined
    },
  },
}

const { isMobile, ui } = useDemoChatUi({
  title: 'Minimal Custom Runtime',
  description: '最小自定义 Runtime，不提供 conversations。',
  placeholder: '输入消息验证最小 Runtime',
})
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
