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
    const error = new Error(
      '模拟模型服务不可用。错误详情属于这条 assistant 消息；包含较长标识 demo-request-abcdefghijklmnopqrstuvwxyz-0123456789 以便检查窄容器换行。',
    )
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
        message: { role: 'assistant', content: `请求已恢复：${text || '成功消息'}` },
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
const actionStatus = shallowRef('尚未收到动作失败通知')

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionStatus.value = `已收到 ${payload.action} 动作失败通知；错误详情仍由所属消息气泡展示。`
}
</script>

<template>
  <section class="runtime-error-demo">
    <p class="runtime-error-demo__hint">
      输入包含“失败”的内容会触发确定性错误；随后输入其他内容即可继续发送并观察恢复结果。
    </p>
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
