<template>
  <div>
    <h1>会话</h1>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import {
  ChatMessage,
  ConversationInfo,
  ConversationStorageStrategy,
  sseStreamToGenerator,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h } from 'vue'

class MockStorageStrategy implements ConversationStorageStrategy {
  private conversations: ConversationInfo[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      metadata: {},
    },
  ]

  private messagesMap: Map<string, ChatMessage[]> = new Map([
    [
      'm9zfbomexdm9pza',
      [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
    ],
    [
      'm9zefqta1rihhpj',
      [
        {
          role: 'user',
          content: '想写段文案、起个名字，还是来点灵感？',
        },
        {
          role: 'assistant',
          content: '这是对 "想写段文案、起个名字，还是来点灵感？" 的模拟回复。',
        },
        {
          role: 'user',
          content: 'hello',
        },
        {
          role: 'assistant',
          content: '你好！我是TinyRobot搭建的AI助手。你可以问我任何问题，我会尽力回答。',
        },
      ],
    ],
  ])

  async loadConversations(): Promise<ConversationInfo[]> {
    return this.conversations || []
  }

  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messagesMap.get(conversationId) || []
  }

  async saveConversation(conversation: ConversationInfo): Promise<void> {
    const index = this.conversations.findIndex((c) => c.id === conversation.id)
    if (index >= 0) {
      this.conversations[index] = conversation
    } else {
      this.conversations.push(conversation)
    }
  }

  async saveMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
    this.messagesMap.set(conversationId, messages)
  }
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
}

// Get BASE_URL from import.meta if available, otherwise use empty string
interface ImportMetaEnv {
  BASE_URL?: string
}
interface ImportMetaWithEnv extends ImportMeta {
  env?: ImportMetaEnv
}
const meta = typeof import.meta !== 'undefined' ? (import.meta as ImportMetaWithEnv) : null
const baseUrl = meta?.env?.BASE_URL || ''
const apiUrl = window.parent?.location.origin || location.origin + baseUrl

const storage = new MockStorageStrategy()
const { activeConversation, activeConversationId, conversations, createConversation, switchConversation } =
  useConversation({
    useMessageOptions: {
      responseProvider: async (requestBody, abortSignal) => {
        const response = await fetch(`${apiUrl}/api/chat/completions`, {
          method: 'POST',
          body: JSON.stringify({ ...requestBody, stream: true }),
          signal: abortSignal,
        })
        return sseStreamToGenerator(response, { signal: abortSignal })
      },
    },
    storage,
  })

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)
</script>

<style scoped>
.tiny-select {
  width: 280px;
  margin-left: 4px;
}

.tiny-button {
  margin-left: 10px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
</style>
