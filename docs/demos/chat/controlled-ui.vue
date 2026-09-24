<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { TrChatUI, type ChatMessageItem, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const inputValue = shallowRef('')
const messages = shallowRef<ChatMessageItem[]>([])
const sending = shallowRef(false)

const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'controlled-demo', title: '受控数据' },
  bubble: { messages: messages.value },
  sender: { loading: sending.value },
  request: { state: sending.value ? 'processing' : 'idle' },
}))

async function handleSubmit(payload: ChatSendPayload) {
  if (!payload.text.trim() || sending.value) return

  sending.value = true
  messages.value = [...messages.value, { role: 'user', content: payload.text }]
  inputValue.value = ''
  await Promise.resolve()
  messages.value = [...messages.value, { role: 'assistant', content: `已收到：${payload.text}` }]
  sending.value = false
}
</script>

<template>
  <div class="controlled-ui-demo">
    <TrChatUI :data="data" :input-value="inputValue" @update:input-value="inputValue = $event" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.controlled-ui-demo {
  --tr-layout-height: 100%;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.controlled-ui-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.controlled-ui-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
