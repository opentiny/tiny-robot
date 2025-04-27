<template>
  <h1>会话</h1>
  <tr-bubble-list :items="messages" :roles="roles"></tr-bubble-list>
  <div class="actions">
    <span><b>切换会话</b></span
    ><tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
    <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, ConversationStorageStrategy, Conversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { computed, h } from 'vue'

class MockStorageStrategy implements ConversationStorageStrategy {
  mockData: Conversation[] = [
    {
      id: 'm9zfbomexdm9pza',
      title: '安排日程',
      createdAt: 1745744706662,
      updatedAt: 1745744717297,
      messages: [
        {
          role: 'user',
          content: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
        },
        {
          role: 'assistant',
          content: '这是对 "今天需要我帮你安排日程，规划旅行，还是起草一封邮件？" 的模拟回复。',
        },
      ],
      metadata: {},
    },
    {
      id: 'm9zefqta1rihhpj',
      title: '写段文案',
      createdAt: 1745743216510,
      updatedAt: 1745744704671,
      messages: [
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
      metadata: {},
    },
  ]

  async saveConversations(conversations: Conversation[]) {
    this.mockData = conversations
  }

  async loadConversations(): Promise<Conversation[]> {
    return this.mockData || []
  }
}

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const roles: Record<string, BubbleRoleConfig> = {
  assistant: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}

const client = new AIClient({
  provider: 'openai',
  // apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: location.origin + '/cdocs/tiny-robot/',
})

const storage = new MockStorageStrategy()
const {
  state,
  messageManager: { messages }, // 与 useMessage 返回一致，具体查看useMessage
  createConversation,
  switchConversation,
} = useConversation({ client, storage })

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

console.log('state: ', state)
</script>

<style lang="less" scoped>
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
