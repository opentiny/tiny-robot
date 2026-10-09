<script setup lang="ts">
import { shallowRef } from 'vue'
import type { ConversationStorageStrategy, MessageRequestBody, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { TrChat, useChatRuntime, type ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

let responseIndex = 0

const memoryStorage: ConversationStorageStrategy = {
  loadConversations: () => [],
  loadMessages: () => [],
  saveConversation: () => undefined,
  saveMessages: () => undefined,
  deleteConversation: () => undefined,
}

const responseProvider: ResponseProvider = async (requestBody: MessageRequestBody) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')

  if (text.includes('失败')) {
    const error = new Error('模拟请求失败：模型服务暂时不可用。')
    Object.assign(error, { code: 'DEMO_UNAVAILABLE' })
    throw error
  }

  responseIndex += 1
  return {
    id: `runtime-error-demo-${responseIndex}`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: `正常回复：${text || '成功消息'}` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const runtime = useChatRuntime({
  conversation: { storage: memoryStorage, useMessageOptions: { responseProvider } },
})
const actionStatus = shallowRef('尚未收到操作失败通知')

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionStatus.value = payload.action === 'send' ? '已收到发送失败通知' : '已收到操作失败通知'
}
</script>

<template>
  <section class="runtime-error-demo">
    <p class="runtime-error-demo__hint">发送包含“失败”的内容可查看错误提示，发送其他内容可查看正常回复。</p>
    <p class="runtime-error-demo__status" aria-live="polite">{{ actionStatus }}</p>
    <div class="runtime-error-demo__chat">
      <tr-chat :runtime="runtime" @runtime-action-error="handleRuntimeActionError" />
    </div>
  </section>
</template>

<style scoped>
.runtime-error-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-error-demo__hint,
.runtime-error-demo__status {
  margin: 0;
  overflow-wrap: anywhere;
}

.runtime-error-demo__hint {
  color: var(--tr-text-primary, #252b3a);
}

.runtime-error-demo__status {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.runtime-error-demo__chat {
  box-sizing: border-box;
  width: min(100%, 720px);
  height: min(620px, calc(100vh - 280px));
  min-height: 480px;
  min-width: 0;
}

.runtime-error-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.runtime-error-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .runtime-error-demo__chat {
    height: 560px;
  }
}
</style>
