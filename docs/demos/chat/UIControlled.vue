<script setup lang="ts">
import { ref } from 'vue'
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChatUI, type ChatMessageItem, type ChatSendPayload, type ChatUIData } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const inputValue = ref('')
const data = ref<ChatUIData>({
  conversation: { items: [], activeId: null, title: '新对话' },
  bubble: { messages: [] },
  sender: { loading: false, disabled: false, submitDisabled: false },
  request: { state: 'idle' },
})

function handleSubmit(payload: ChatSendPayload) {
  const userMessage: ChatMessageItem = { role: 'user', content: payload.text }
  const assistantMessage: ChatMessageItem = {
    role: 'assistant',
    content: `已收到：${payload.text}`,
  }

  data.value = {
    ...data.value,
    bubble: { messages: [...(data.value.bubble?.messages ?? []), userMessage, assistantMessage] },
    request: { state: 'completed' },
  }
  inputValue.value = ''
}
</script>

<template>
  <TrTheme>
    <div class="chat-ui-demo">
      <TrChatUI
        :data="data"
        :ui="{
          brand: { name: '纯界面示例' },
          history: false,
          model: false,
          mcp: false,
          prompts: false,
          welcome: { title: '由应用控制的聊天界面', description: '提交后由宿主更新消息数据。' },
        }"
        :input-value="inputValue"
        @update:input-value="inputValue = $event"
        @submit="handleSubmit"
      />
    </div>
  </TrTheme>
</template>

<style scoped>
.chat-ui-demo {
  --tr-layout-height: 100%;
  box-sizing: border-box;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-ui-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-ui-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
