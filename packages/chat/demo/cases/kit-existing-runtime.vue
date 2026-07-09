<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { TrChat, useKitChatRuntime } from '../../src'
import { createDemoResponseProvider, createDemoStorage, useDemoChatUi } from './shared'

const lastError = shallowRef<unknown | null>(null)
const conversation = useConversation({
  storage: createDemoStorage(),
  useMessageOptions: {
    responseProvider: createDemoResponseProvider('Kit existing runtime'),
  },
})

conversation.createConversation({
  title: '已有 kit runtime',
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
  title: 'Kit Existing Runtime',
  placeholder: '输入消息验证已有 kit runtime',
})
</script>

<template>
  <TrChat :key="isMobile ? 'mobile' : 'desktop'" :runtime="runtime" :ui="ui" />
</template>
