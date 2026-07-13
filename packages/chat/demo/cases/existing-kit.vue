<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { createDemoResponseProvider } from '../scenario'
import { TrChat, useKitChatRuntime } from '../../src'
import { createDemoStorage, useDemoChatUi } from './shared'

const lastError = shallowRef<unknown | null>(null)
const conversation = useConversation({
  storage: createDemoStorage(),
  useMessageOptions: {
    responseProvider: createDemoResponseProvider('Existing Kit Runtime'),
  },
})

conversation.createConversation({
  title: '已有 Kit 会话',
})

const runtime = useKitChatRuntime(conversation, {
  lastError,
  send: async ({ text }) => {
    const content = text.trim()

    if (!content) {
      return
    }

    const active = conversation.activeConversation.value

    if (!active) {
      return
    }

    try {
      lastError.value = null
      await active.engine.sendMessage(content)
    } catch (error) {
      lastError.value = error
      throw error
    }
  },
})
const { isMobile, ui } = useDemoChatUi({
  title: 'Existing Kit Runtime',
  description: '复用已有 useConversation()，只迁移到 TrChat UI。',
  placeholder: '输入消息验证已有 Kit 复用路径',
})
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
