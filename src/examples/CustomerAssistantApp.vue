<script setup lang="ts">
import { useTheme } from '@opentiny/tiny-robot'
import { computed, ref } from 'vue'
import ChatHistory from '../components/ChatHistory.vue'
import ChatMessages from '../components/ChatMessages.vue'
import ChatSender from '../components/ChatSender.vue'
import IconMoon from '../components/icons/IconMoon.vue'
import IconSun from '../components/icons/IconSun.vue'
import { useChatConversation } from '../composables/useChatConversation'

const { activeConversation, createConversation, sendMessage, abortActiveRequest, updateConversationTitle } =
  useChatConversation()
const { resolvedColorMode, toggleColorMode } = useTheme()

const activeEngine = computed(() => activeConversation.value?.engine)
const activeTitle = computed(() => activeConversation.value?.title || 'TinyRobot AI 智能客服')
const messages = computed(() => activeEngine.value?.messages.value ?? [])
const isProcessing = computed(() => activeEngine.value?.isProcessing.value ?? false)
const isDark = computed(() => resolvedColorMode?.value === 'dark')
const historyDrawerOpen = ref(false)

const openHistoryDrawer = () => {
  historyDrawerOpen.value = true
}

const closeHistoryDrawer = () => {
  historyDrawerOpen.value = false
}

const handleSendMessage = (content: string) => {
  const message = content.trim()

  if (!message) {
    return
  }

  if (!activeConversation.value) {
    const conversation = createConversation({
      useMessageOptions: {
        initialMessages: [],
      },
      title: message.slice(0, 24),
    })

    conversation.engine.sendMessage(message)
    return
  }

  const hasUserMessage = activeEngine.value?.messages.value.some((item) => item.role === 'user')

  if (!hasUserMessage) {
    updateConversationTitle(activeConversation.value.id, message.slice(0, 24))
  }

  sendMessage(message)
}

const resendUserMessage = (userMessageIndex: number) => {
  const content = messages.value[userMessageIndex]?.content

  if (typeof content === 'string') {
    messages.value.splice(userMessageIndex)
    sendMessage(content)
  }
}
</script>

<template>
  <div class="chat-app">
    <header class="app-header">
      <div class="header-title">
        <button type="button" class="history-button" aria-label="打开历史会话" @click="openHistoryDrawer">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h3>{{ activeTitle }}</h3>
      </div>
      <button
        type="button"
        class="theme-button"
        :aria-label="isDark ? '切换到亮色模式' : '切换到深色模式'"
        :title="isDark ? '切换到亮色模式' : '切换到深色模式'"
        @click="toggleColorMode"
      >
        <IconSun v-if="isDark" />
        <IconMoon v-else />
      </button>
    </header>
    <aside class="app-aside">
      <ChatHistory />
    </aside>
    <div v-if="historyDrawerOpen" class="drawer-mask" @click="closeHistoryDrawer">
      <aside class="history-drawer" @click.stop>
        <ChatHistory @select="closeHistoryDrawer" />
      </aside>
    </div>
    <main class="app-main">
      <ChatMessages
        :messages="messages"
        :isProcessing="isProcessing"
        @regenerate="resendUserMessage"
        @follow-up="handleSendMessage"
      />
    </main>
    <footer class="app-footer">
      <ChatSender :processing="isProcessing" @send="handleSendMessage" @stop="abortActiveRequest" />
    </footer>
  </div>
</template>

<style scoped>
.chat-app {
  --aside-width: 300px;
  --app-divider-color: color-mix(in srgb, var(--tr-border-color-default) 45%, transparent);

  height: 100vh;
  background: var(--tr-page-bg-default);
  color: var(--tr-text-primary);

  display: grid;
  grid-template-areas:
    'aside header'
    'aside main'
    'aside footer';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: var(--aside-width) 1fr;
}

.app-header,
.app-aside,
.app-main,
.app-footer {
  background: var(--tr-container-bg-default);
}

.app-header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--app-divider-color);
  padding: 0 20px;
}

.app-header h3 {
  margin: 16px 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-size: var(--tr-font-size-md);
  font-weight: var(--tr-font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.history-button {
  display: none;
}

.theme-button {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--tr-radius-full);
  padding: 0;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.theme-button:hover {
  background: var(--tr-container-bg-active);
}

.theme-button svg {
  width: 18px;
  height: 18px;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: var(--tr-z-index-modal-backdrop);
  background: rgba(0, 0, 0, 0.35);
}

.history-drawer {
  width: min(300px, 85vw);
  height: 100%;
  background: var(--tr-container-bg-default);
  box-shadow: 12px 0 32px rgba(0, 0, 0, 0.18);
}

.app-aside {
  grid-area: aside;
  border-right: 1px solid var(--app-divider-color);
  background: var(--tr-page-bg-default);
}

.app-main {
  grid-area: main;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0, color-mix(in srgb, var(--tr-color-primary) 8%, transparent), transparent 32%),
    var(--tr-page-bg-default);
}

.app-footer {
  grid-area: footer;
  border-top: 1px solid var(--app-divider-color);
  padding: 16px 20px 20px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 92%, transparent);
}

@media (max-width: 768px) {
  .chat-app {
    grid-template-areas:
      'header'
      'main'
      'footer';
    grid-template-columns: 1fr;
  }

  .app-header {
    padding-inline: 12px;
  }

  .app-aside {
    display: none;
  }

  .history-button {
    display: inline-flex;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 0;
    border-radius: var(--tr-radius-full);
    padding: 0;
    background: transparent;
    color: var(--tr-text-primary);
    cursor: pointer;
  }

  .history-button:hover {
    background: var(--tr-container-bg-active);
  }

  .history-button span {
    width: 16px;
    height: 2px;
    border-radius: var(--tr-radius-full);
    background: currentColor;
  }

  .app-footer {
    padding: 12px;
  }
}
</style>
