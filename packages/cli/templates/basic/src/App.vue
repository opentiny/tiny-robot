<template>
  <TrTheme>
    <main class="app chat-card">
      <ConversationHistory />

      <section class="chat-panel">
        <div class="chat-panel-content">
          <p v-if="!hasApiConfig" class="config-warning">
            缺少 API 配置，请在 <code>.env</code> 中设置当前模型服务商对应的 Key。
          </p>
          <header class="chat-header">
            <HistoryDrawerButton @click="historyDrawerOpen = true" />
            <h3 v-if="currentConversationTitle">{{ currentConversationTitle }}</h3>
            <ThemeToggleButton v-if="isWelcomePage" />
          </header>

          <ChatList />

          <ChatSender />
        </div>
      </section>
    </main>
  </TrTheme>
</template>

<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { computed, provide, ref } from 'vue'
import ChatList from './components/ChatList.vue'
import ChatSender from './components/ChatSender.vue'
import ConversationHistory from './components/ConversationHistory.vue'
import HistoryDrawerButton from './components/HistoryDrawerButton.vue'
import ThemeToggleButton from './components/ThemeToggleButton.vue'
import { useChat } from './composables/useChat'
import { useModel } from './composables/useModel'

const { activeConversation, messages } = useChat()
const { hasApiConfig } = useModel()
const historyDrawerOpen = ref(false)
provide('historyDrawerOpen', historyDrawerOpen)

const isWelcomePage = computed(() => {
  return messages.value.filter((item) => item.role !== 'system').length === 0
})

const currentConversationTitle = computed(() => {
  return activeConversation.value?.title
})
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 0;
}

.chat-card {
  width: 100%;
  height: 100vh;
  display: flex;
  gap: 0;
  overflow: hidden;
  align-items: stretch;
  flex-direction: row;
  padding: 0;
  margin: 0;
  border-radius: 0;
  background: var(--tr-container-bg-default);
  box-shadow: none;
}

.chat-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  padding: 12px;
}

.chat-panel-content {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.chat-header h3 {
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--tr-color-warning-light);
  color: var(--tr-color-warning);
  font-size: 14px;
}

@media (max-width: 959px) {
  .chat-header {
    position: relative;
    justify-content: center;
    min-height: 32px;
  }

  .chat-header h3 {
    width: 100%;
    text-align: center;
    padding: 0 48px;
    flex: none;
  }
}
</style>
