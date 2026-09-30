<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <!-- 消息输入区域 -->
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="handleSubmit"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createNewConversation">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleRoleConfig } from '@opentiny/tiny-robot'
import { indexedDBStorageStrategyFactory, useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

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

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider,
  },
  storage: indexedDBStorageStrategyFactory({
    dbName: 'demo-chat-db',
    dbVersion: 1,
  }),
  autoSaveMessages: true,
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const handleSubmit = (content: string) => {
  const conversation = activeConversation.value ?? createNewConversation()
  conversation.engine.sendMessage(content)
  inputMessage.value = ''
}

const createNewConversation = () => createConversation({ title: `新会话 ${conversations.value.length + 1}` })

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || `会话 ${conversation.id.slice(0, 8)}`,
    value: conversation.id,
  })),
)

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
