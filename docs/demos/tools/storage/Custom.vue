<template>
  <div>
    <div class="info">
      <p><strong>自定义存储策略示例</strong></p>
      <p>此示例展示如何实现自定义存储策略。在实际应用中，你可以将数据保存到远程服务器。</p>
      <p>本示例使用内存存储作为演示，刷新页面后数据会丢失。</p>
    </div>

    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>

    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '正在思考中...' : '请输入您的问题'"
      :clearable="true"
      :loading="isProcessing"
      @submit="sendMessage"
      @cancel="abortActiveRequest"
    ></tr-sender>

    <div class="actions">
      <span><b>切换会话</b></span>
      <tiny-select
        :modelValue="activeConversationId"
        :options="options"
        @change="switchConversation($event)"
      ></tiny-select>
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="warning" @click="clearStorage">清空存储</tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrBubbleList, TrSender, BubbleRoleConfig } from '@opentiny/tiny-robot'
import {
  type ConversationStorageStrategy,
  type ConversationInfo,
  type ChatMessage,
  sseStreamToGenerator,
  useConversation,
} from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'

// 自定义存储策略：使用内存存储（仅作为示例）
class MemoryStorageStrategy implements ConversationStorageStrategy {
  private conversations: ConversationInfo[] = []
  private messagesMap: Map<string, ChatMessage[]> = new Map()

  loadConversations(): ConversationInfo[] {
    return [...this.conversations]
  }

  loadMessages(conversationId: string): ChatMessage[] {
    return [...(this.messagesMap.get(conversationId) || [])]
  }

  saveConversation(conversation: ConversationInfo): void {
    const index = this.conversations.findIndex((c) => c.id === conversation.id)
    if (index >= 0) {
      this.conversations[index] = conversation
    } else {
      this.conversations.unshift(conversation)
    }
  }

  saveMessages(conversationId: string, messages: ChatMessage[]): void {
    this.messagesMap.set(conversationId, [...messages])
  }

  deleteConversation(conversationId: string): void {
    const index = this.conversations.findIndex((c) => c.id === conversationId)
    if (index >= 0) {
      this.conversations.splice(index, 1)
    }
    this.messagesMap.delete(conversationId)
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

const apiUrl = window.parent?.location.origin || location.origin

// 使用自定义存储策略
const customStorage = new MemoryStorageStrategy()

const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  abortActiveRequest,
  clear,
} = useConversation({
  useMessageOptions: {
    responseProvider: async (requestBody, abortSignal) => {
      const response = await fetch(`${apiUrl}/api/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...requestBody, stream: true }),
        signal: abortSignal,
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return sseStreamToGenerator(response, { signal: abortSignal })
    },
  },
  storage: customStorage,
  autoSaveMessages: true, // 启用自动保存消息
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value)

const inputMessage = ref('')

const sendMessage = (content: string) => {
  activeConversation.value?.engine?.sendMessage(content)
  inputMessage.value = ''
}

const options = computed(() =>
  conversations.value.map((conversation) => ({
    label: conversation.title || `会话 ${conversation.id.slice(0, 8)}`,
    value: conversation.id,
  })),
)

// 清空存储
const clearStorage = () => {
  if (confirm('确定要清空所有会话数据吗？')) {
    clear()
  }
}
</script>

<style scoped>
.info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}

.info p {
  margin: 4px 0;
  font-size: 14px;
  color: #0369a1;
}

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
