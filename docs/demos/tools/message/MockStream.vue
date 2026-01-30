<template>
  <div>
    <p class="hint">模拟 <code>responseProvider</code>：不依赖真实 API，用于开发时模拟流式响应。</p>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '模拟流式中...' : '输入任意内容'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortRequest"
    ></tr-sender>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import { type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'
import { useMessageMockStream } from './MockStream'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const { messages, isProcessing, sendMessage, abortRequest } = useMessageMockStream()

const inputMessage = ref('')

function handleSubmit(content: string) {
  if (!content?.trim() || isProcessing.value) return
  sendMessage(content.trim())
  inputMessage.value = ''
}

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: aiAvatar },
  user: { placement: 'end', avatar: userAvatar },
}
</script>

<style scoped>
.hint {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.hint code {
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  font-size: 13px;
}
</style>
