<template>
  <div>
    <tr-bubble-list :messages="messages" :role-configs="roles"></tr-bubble-list>
    <tr-sender
      v-model="inputMessage"
      :placeholder="isProcessing ? '模拟回复中...' : '请输入您的问题'"
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
      <tiny-button type="info" @click="createConversation()">创建新对话</tiny-button>
      <tiny-button type="danger" :disabled="!activeConversationId" @click="handleDeleteConversation">
        删除当前会话
      </tiny-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BubbleRoleConfig, TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { UseMessageOptions } from '@opentiny/tiny-robot-kit'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinyButton, TinySelect } from '@opentiny/vue'
import { computed, h, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'
import { MockStorageStrategy } from './mockStorageStrategy'

// useConversation basic usage: useMessageOptions.responseProvider + storage
const {
  activeConversation,
  activeConversationId,
  conversations,
  createConversation,
  switchConversation,
  deleteConversation,
  abortActiveRequest,
} = useConversation({
  useMessageOptions: {
    responseProvider: mockResponseProvider as UseMessageOptions['responseProvider'],
  },
  storage: new MockStorageStrategy(),
})

const messages = computed(() => activeConversation.value?.engine?.messages.value || [])
const isProcessing = computed(() => activeConversation.value?.engine?.isProcessing.value ?? false)
const options = computed(() => conversations.value.map((c) => ({ label: c.title, value: c.id })))

const inputMessage = ref('')

function handleSubmit(content: string) {
  // Auto-create conversation if none exists
  const conversation = activeConversation.value ?? createConversation()
  conversation?.engine?.sendMessage(content)
  inputMessage.value = ''
}

async function handleDeleteConversation() {
  const id = activeConversationId.value
  if (!id) return
  await deleteConversation(id)
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
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
