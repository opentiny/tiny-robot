<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation } from '@opentiny/tiny-robot-kit'
import type { ConversationStorageStrategy, ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  TrChatUI,
  useChatRuntimeAdapter,
  useChatRuntimeFromConversation,
  type ChatHistoryActionPayload,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const memoryStorage: ConversationStorageStrategy = {
  loadConversations: () => [],
  loadMessages: () => [],
  saveConversation: () => undefined,
  saveMessages: () => undefined,
  deleteConversation: () => undefined,
}

let responseIndex = 0

const responseProvider: ResponseProvider = async (requestBody) => {
  const text = String(requestBody.messages.filter((message) => message.role === 'user').at(-1)?.content ?? '')
  responseIndex += 1

  return {
    id: `runtime-adapter-demo-${responseIndex}`,
    object: 'chat.completion',
    created: responseIndex,
    model: 'local-demo',
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: `Runtime 已收到：${text}` },
        delta: undefined,
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  }
}

const conversation = useConversation({
  storage: memoryStorage,
  useMessageOptions: { responseProvider },
})
const runtime = useChatRuntimeFromConversation({ conversation })
const actionStatus = shallowRef('动作状态：正常')
const adapter = useChatRuntimeAdapter({
  runtime,
  onActionError({ action }) {
    actionStatus.value = `动作失败：${action}`
  },
})

function handleHistoryAction(payload: ChatHistoryActionPayload) {
  if (payload.action.id === 'delete' && !payload.defaultPrevented) {
    adapter.deleteConversation(payload.conversation.id)
  }
}
</script>

<template>
  <section class="runtime-adapter-demo">
    <p class="runtime-adapter-demo__status" aria-live="polite">{{ actionStatus }}</p>
    <div class="runtime-adapter-demo__chat">
      <tr-chat-u-i
        :data="adapter.data.value"
        :input-value="adapter.inputValue.value"
        @update:input-value="adapter.setInputValue"
        @submit="adapter.send"
        @cancel="adapter.abort"
        @clear="() => adapter.setInputValue('')"
        @create-conversation="adapter.clearActiveConversation"
        @switch-conversation="({ conversationId }) => adapter.switchConversation(conversationId)"
        @rename-conversation="({ conversationId, title }) => adapter.renameConversation(conversationId, title)"
        @history-action="handleHistoryAction"
      />
    </div>
  </section>
</template>

<style scoped>
.runtime-adapter-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.runtime-adapter-demo__status {
  margin: 0;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.runtime-adapter-demo__chat {
  box-sizing: border-box;
  width: min(100%, 720px);
  height: min(620px, calc(100vh - 280px));
  min-height: 480px;
  min-width: 0;
}

.runtime-adapter-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.runtime-adapter-demo__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .runtime-adapter-demo__chat {
    height: 560px;
  }
}
</style>
