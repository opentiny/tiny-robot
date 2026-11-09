<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import { TrChatUI, type ChatMessageItem, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const inputValue = shallowRef('')
const messages = shallowRef<ChatMessageItem[]>([])
const sending = shallowRef(false)
let replyTimer: ReturnType<typeof setTimeout> | undefined

const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'controlled-demo', title: '应用助手' },
  bubble: { messages: messages.value },
  sender: { loading: sending.value },
}))

function handleSubmit(payload: ChatSendPayload) {
  if (!payload.text.trim() || sending.value) return

  sending.value = true
  messages.value = [...messages.value, { role: 'user', content: payload.text }]
  inputValue.value = ''
  replyTimer = setTimeout(() => {
    messages.value = [...messages.value, { role: 'assistant', content: `已收到：${payload.text}` }]
    replyTimer = undefined
    sending.value = false
  }, 1500)
}

function handleCancel() {
  clearTimeout(replyTimer)
  replyTimer = undefined
  sending.value = false
}

onUnmounted(handleCancel)
</script>

<template>
  <div class="controlled-ui-demo">
    <TrChatUI
      :data="data"
      :ui="{ layout: { leftAside: false, rightAside: false } }"
      v-model:input-value="inputValue"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
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
