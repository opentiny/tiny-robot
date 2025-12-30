<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isGenerating ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isGenerating"
      @submit="sendMessage"
      @cancel="abortRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select :modelValue="state.currentId" :options="options" @change="switchConversation($event)"></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { useConversation, AIClient, GeneratingStatus, indexedDBStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySelect, TinyButton } from '@opentiny/vue'
import { computed, h } from 'vue'

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

const client = new AIClient({
  provider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: window.parent?.location.origin || location.origin,
})

// 使用 IndexedDB 策略
const {
  state,
  messageManager: { messages, inputMessage, sendMessage, messageState, abortRequest },
  createConversation,
  switchConversation,
} = useConversation({
  client,
  storage: indexedDBStorageStrategyFactory({
    dbName: 'demo-chat-db', // 自定义数据库名称
    dbVersion: 1, // 数据库版本
  }),
  events: {
    onLoaded(conversations) {
      if (conversations.length === 0) {
        createConversation()
      }
    },
  },
})

const options = computed(() =>
  state.conversations.map((conversation) => ({
    label: conversation.title,
    value: conversation.id,
  })),
)

// 是否正在生成
const isGenerating = computed(() => GeneratingStatus.includes(messageState.status))

// 清空存储
const clearStorage = async () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    try {
      // 删除 IndexedDB 数据库
      indexedDB.deleteDatabase('demo-chat-db')
      location.reload()
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  }
}
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
