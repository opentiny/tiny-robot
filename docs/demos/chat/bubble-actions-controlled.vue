<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrChatUI,
  type ChatBubbleMessageActionPayload,
  type ChatMessageItem,
  type ChatUIData,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const messages = shallowRef<ChatMessageItem[]>([
  {
    role: 'user',
    content: '请总结这份报告',
    metadata: { id: 'user-1', chat_action_metadata: { id: 'user-1' } },
  },
  {
    role: 'assistant',
    content: '报告显示，本季度收入增长 12%，主要来自企业客户。',
    metadata: {
      id: 'assistant-1',
      usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
      chat_action_metadata: { id: 'assistant-1', userMessageId: 'user-1' },
    },
  },
])

const data = computed<ChatUIData>(() => ({
  conversation: { title: '受控消息操作', activeId: 'demo' },
  bubble: {
    messages: messages.value,
    actions: {
      'user-1': { canEdit: true, canRegenerate: false, turnState: 'completed' },
      'assistant-1': { canEdit: false, canRegenerate: true, turnState: 'completed' },
    },
  },
}))

const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  bubble: {
    actions: {
      display: 'always',
      user: ['copy', 'edit'],
      assistant: ['copy', 'regenerate', 'info'],
    },
  },
}

async function handleEdit(payload: ChatBubbleMessageActionPayload) {
  const accepted = Boolean(payload.text?.trim())
  if (accepted) {
    messages.value = messages.value.map((message) =>
      message.metadata?.id === payload.messageId ? { ...message, content: payload.text } : message,
    )
  }
  payload.complete?.(accepted)
}

function handleRegenerate(payload: ChatBubbleMessageActionPayload) {
  // 应用在这里请求服务或替换本地 mock，然后更新 messages。
  const userMessageId = payload.messageId
  messages.value = messages.value.map((message) => {
    const metadata = message.metadata?.chat_action_metadata as { userMessageId?: string } | undefined
    return message.role === 'assistant' && metadata?.userMessageId === userMessageId
      ? { ...message, content: '重新生成的本地示例回答。' }
      : message
  })
}
</script>

<template>
  <div class="bubble-actions-controlled-demo">
    <TrChatUI :data="data" :ui="ui" @edit-message="handleEdit" @regenerate-message="handleRegenerate" />
  </div>
</template>

<style scoped>
.bubble-actions-controlled-demo {
  --tr-layout-height: 100%;
  height: min(560px, calc(100vh - 240px));
  min-height: 360px;
}

.bubble-actions-controlled-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
