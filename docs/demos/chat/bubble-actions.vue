<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useConversation, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  createChatActionStatePlugin,
  useChatRuntimeFromConversation,
  type ChatModelRuntime,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const responseProvider: ResponseProvider = async (requestBody) => {
  const user = [...requestBody.messages].reverse().find((message) => message.role === 'user')
  const text = typeof user?.content === 'string' ? user.content : '这条消息'
  return {
    id: 'chat-actions-demo-response',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'tiny-robot-demo',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: `本地演示回答：${text}` },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
  } as never
}

const options = shallowRef([{ id: 'tiny-robot-demo', label: '本地演示模型' }])
const selectedId = shallowRef<string | null>('tiny-robot-demo')
const model: ChatModelRuntime = {
  options,
  selectedId,
  select: (id) => {
    selectedId.value = id
  },
}
const conversation = useConversation({
  storage: {
    loadConversations: () => [],
    loadMessages: () => [],
    saveConversation: () => {},
    saveMessages: () => {},
  },
  useMessageOptions: {
    responseProvider,
    plugins: [createChatActionStatePlugin()],
  },
})
const runtime = useChatRuntimeFromConversation({ conversation, composer: { model } })
const ui: ChatUIOptions = {
  layout: { leftAside: false },
  bubble: {
    actions: {
      display: ({ message }) => {
        const messages = runtime.activeConversation.value?.messages ?? []
        const latest = messages.filter((item) => item.role === message.role).at(-1)
        return message === latest ? 'always' : 'hover'
      },
      user: ['copy', 'edit'],
      assistant: ['copy', 'regenerate', 'info', 'timestamp'],
    },
  },
}

onMounted(async () => {
  if (!runtime.activeConversation.value) {
    await runtime.actions.send({ text: '请介绍一下 TinyRobot' })
  }
})
</script>

<template>
  <section class="bubble-actions-demo">
    <p class="bubble-actions-demo__tip">
      助手消息完成后显示时间；当天仅显示时分，历史消息显示日期和时间。时间随操作组显隐，最新用户和助手消息的操作组常驻，历史消息悬停显示。
    </p>
    <div class="bubble-actions-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" />
    </div>
  </section>
</template>

<style scoped>
.bubble-actions-demo__tip {
  margin: 0 0 12px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.bubble-actions-demo__chat {
  --tr-layout-height: 100%;
  height: 600px;
}

.bubble-actions-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
