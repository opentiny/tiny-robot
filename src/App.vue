<script setup lang="ts">
import { TrBubbleList, TrSender, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useMessage } from '@opentiny/tiny-robot-kit'
import { ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

const input = ref('')
const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  responseProvider: mockResponseProvider,
})
const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start' },
  user: { placement: 'end' },
}

function submit(content: string) {
  if (!content.trim()) return
  void sendMessage(content)
  input.value = ''
}
</script>

<template>
  <main class="chat-shell">
    <header>
      <span>TinyRobot Kit</span>
      <small>Mock 流式响应</small>
    </header>
    <TrBubbleList class="messages" :messages="messages" :role-configs="roles" auto-scroll />
    <TrSender
      v-model="input"
      :loading="isProcessing"
      :placeholder="isProcessing ? '正在生成…' : '输入问题体验流式回复'"
      @submit="submit"
      @cancel="abortRequest"
    />
  </main>
</template>
<style scoped>
.chat-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(880px, calc(100% - 32px));
  height: min(680px, calc(100vh - 64px));
  margin: 32px auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px #23395d14;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  font-weight: 700;
}

header small {
  color: #667085;
  font-weight: 400;
}

.messages {
  min-height: 0;
  overflow: auto;
  padding: 16px 0;
}
</style>
