<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useConversation, type ResponseProvider, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntimeFromConversation,
  type ChatModelRuntime,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const actionMetadataKey = 'chat_action_metadata'
const responseProvider: ResponseProvider = async (requestBody) => {
  const user = [...requestBody.messages].reverse().find((message) => message.role === 'user')
  const text = typeof user?.content === 'string' ? user.content : '这条消息'
  return {
    id: 'chat-actions-demo-response',
    object: 'chat.completion',
    created: 0,
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

const actionStatePlugin: UseMessagePlugin = {
  name: 'chat-actions-demo-state',
  onTurnStart({ currentTurn }) {
    const user = [...currentTurn].reverse().find((message) => message.role === 'user')
    const metadata = user?.metadata?.[actionMetadataKey] as { turnState?: string } | undefined
    if (metadata) metadata.turnState = 'processing'
  },
  onFinally({ currentTurn, requestState }) {
    const user = [...currentTurn].reverse().find((message) => message.role === 'user')
    const userMetadata = user?.metadata?.[actionMetadataKey] as { id?: string } | undefined
    if (!userMetadata?.id) return
    const turnState = requestState === 'paused' ? 'paused' : requestState
    for (const message of currentTurn) {
      if (message.role !== 'assistant') continue
      message.metadata = {
        ...message.metadata,
        [actionMetadataKey]: {
          id: `${userMetadata.id}-assistant`,
          userMessageId: userMetadata.id,
          turnState,
        },
      }
    }
    userMetadata.turnState = turnState
  },
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
  useMessageOptions: {
    responseProvider,
    plugins: [actionStatePlugin],
  },
})
const runtime = useChatRuntimeFromConversation({ conversation, composer: { model } })
const ui: ChatUIOptions = {
  layout: { leftAside: false },
  bubble: {
    actions: {
      display: 'always',
      user: ['copy', 'edit'],
      assistant: ['copy', 'regenerate', 'usage'],
      usage: { trigger: 'click' },
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
      这是本地确定性示例。可以复制、编辑用户消息、重新生成回答，并查看 Token 用量。
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
