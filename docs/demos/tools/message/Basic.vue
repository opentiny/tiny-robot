<template>
  <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
  <tr-sender
    v-model="inputMessage"
    :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
    :clearable="true"
    :loading="isProcessing"
    @submit="handleSubmit"
    @cancel="abortRequest"
  ></tr-sender>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageBasic } from './Basic'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageBasic()

const inputMessage = ref('')

function handleSubmit(content: string) {
  sendMessage(content)
  inputMessage.value = ''
}

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
