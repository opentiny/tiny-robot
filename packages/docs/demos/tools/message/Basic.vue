<template>
  <BubbleList :items="messages" :roles="roles"></BubbleList>
  <Sender
    class="chat-input"
    v-model="inputMessage"
    :placeholder="messageState.status === STATUS.PROCESSING ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="GeneratingStatus.includes(messageState.status)"
    @submit="sendMessage"
    @cancel="abortRequest"
  ></Sender>
</template>

<script setup lang="ts">
// import { BubbleList, Sender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { AIClient, GeneratingStatus, STATUS, useMessage } from '@opentiny/tiny-robot-ai-adapter'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + '/cdocs/tiny-robot/',
})

const aiAvatar = h(IconAi, { style: { width: '32px', height: '32px' } })
const userAvatar = h(IconUser, { style: { width: '32px', height: '32px' } })

const { messages, messageState, inputMessage, sendMessage, abortRequest } = useMessage({
  client,
  useStreamByDefault: true,
  initialMessages: [
    {
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      role: 'assistant',
    },
  ],
})

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}
</script>

<style scoped lang="less">
.chat-input {
  background-color: transparent;
}
</style>
