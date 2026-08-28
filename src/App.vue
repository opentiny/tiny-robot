<script setup lang="ts">
import { type BubbleRoleConfig, type HistoryItem, TrBubbleList, TrHistory, TrSender } from '@opentiny/tiny-robot'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { computed, ref } from 'vue'
import { mockResponseProvider } from './mockResponseProvider'

const input = ref('')
const {
  conversations, // 会话列表
  activeConversation, // 当前会话及其消息 engine
  activeConversationId, // 当前会话 ID
  createConversation, // 创建会话
  switchConversation, // 切换会话
  sendMessage, // 向当前会话发送消息
  abortActiveRequest, // 停止当前会话的请求
} = useConversation({
  useMessageOptions: { responseProvider: mockResponseProvider },
})

const messages = computed(() => activeConversation.value?.engine.messages.value ?? [])
const isProcessing = computed(() => activeConversation.value?.engine.isProcessing.value ?? false)
const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start' },
  user: { placement: 'end' },
}

function submit(content: string) {
  if (!content.trim()) return
  if (!activeConversation.value) createConversation({ title: content.slice(0, 16) })
  sendMessage(content)
  input.value = ''
}

function startConversation() {
  activeConversationId.value = null
  input.value = ''
}

function openConversation(item: HistoryItem) {
  if (item.id) void switchConversation(item.id)
}
</script>

<template>
  <main class="app-shell">
    <aside class="history-panel">
      <div class="history-header">
        <strong>历史会话</strong>
        <button class="new-chat" type="button" @click="startConversation">新对话</button>
      </div>
      <TrHistory
        class="history-list"
        :data="conversations as HistoryItem[]"
        :selected="activeConversationId ?? undefined"
        :menu-items="[]"
        @item-click="openConversation"
      />
    </aside>
    <header>
      <span>TinyRobot Kit</span>
      <small>多会话</small>
    </header>
    <TrBubbleList class="messages" :messages="messages" :role-configs="roles" auto-scroll />
    <TrSender
      class="sender"
      v-model="input"
      :loading="isProcessing"
      :placeholder="isProcessing ? '正在生成…' : '输入问题体验流式回复'"
      @submit="submit"
      @cancel="abortActiveRequest"
    />
  </main>
</template>
<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(1040px, calc(100% - 32px));
  height: min(680px, calc(100vh - 64px));
  margin: 32px auto;
  overflow: hidden;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px #23395d14;
}

.history-panel {
  grid-row: 1 / -1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  padding: 20px 16px;
  background: #f7f8fa;
  border-right: 1px solid #e4e7ec;
}

.history-header,
.app-shell > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header {
  padding: 0 8px 16px;
}

.new-chat {
  padding: 6px 10px;
  color: white;
  font: inherit;
  background: #1476ff;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.history-list {
  min-height: 0;
  overflow: auto;
}

.history-list :deep(.tr-history__item-actions) {
  display: none;
}

.app-shell > header {
  grid-column: 2;
  padding: 24px 24px 0;
  font-weight: 700;
}

.app-shell > header small {
  color: #667085;
  font-weight: 400;
}

.messages {
  grid-column: 2;
  min-height: 0;
  overflow: auto;
  padding: 16px 24px;
}

.sender {
  grid-column: 2;
  margin: 0 24px 24px;
}

@media (max-width: 700px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-rows: 180px auto minmax(0, 1fr) auto;
  }

  .history-panel {
    grid-row: auto;
    border-right: 0;
    border-bottom: 1px solid #e4e7ec;
  }

  .app-shell > header,
  .messages,
  .sender {
    grid-column: 1;
  }
}
</style>
