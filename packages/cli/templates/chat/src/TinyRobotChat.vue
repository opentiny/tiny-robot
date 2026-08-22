<script setup lang="ts">
import type { HistoryMenuItem, PromptProps, TemplateItem } from '@opentiny/tiny-robot'
import { TrSender, TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot/dist/style.css'
import { TrChat, useChatHistoryItems, useLocalChatRuntime, type ChatHistoryItem } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, reactive, ref } from 'vue'
import ComposerTools from './tiny-robot-chat/components/ComposerTools.vue'
import WindowHeader from './tiny-robot-chat/components/WindowHeader.vue'
import { createChatUi, templateCategories } from './tiny-robot-chat/config/chat-ui'
import { mcpServers, modelProviders } from './tiny-robot-chat/config/chat-runtime'
import { useWindow } from './tiny-robot-chat/composables/useWindow'

const runtime = useLocalChatRuntime({ modelProviders, mcpServers })
const window = reactive(useWindow())
const chatRef = ref<{ send: (payload: { text: string }) => Promise<boolean> } | null>(null)
const currentTemplate = ref<TemplateItem[]>([])
const showHistory = ref(false)
const historyData = useChatHistoryItems({ conversations: () => runtime.conversations.value, defaultTitle: '' })
const activeConversationId = computed(() => runtime.activeConversation.value?.id)
const templateExtensions = [TrSender.template(currentTemplate as never, { appendTo: '.chat-add-window' })]
const chatUi = computed(() => createChatUi({ floatingOptions: window.floatingOptions, templateExtensions }))

function handlePromptClick({ item }: { item: PromptProps }): void {
  if (item.description) void chatRef.value?.send({ text: item.description })
}

function handleNewSession(): void {
  void runtime.actions.createConversation()
  showHistory.value = false
}

function handleHistorySelect(item: ChatHistoryItem): void {
  void runtime.actions.switchConversation(item.raw.id)
  showHistory.value = false
}

function handleHistoryRename(title: string, item: ChatHistoryItem): void {
  void runtime.actions.renameConversation(item.raw.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatHistoryItem): void {
  if (action.id === 'delete') void runtime.actions.deleteConversation(item.raw.id)
}
</script>

<template>
  <TrTheme>
    <button
      v-if="!window.show"
      class="chat-add-launcher"
      type="button"
      title="打开 TinyRobot"
      aria-label="打开 TinyRobot"
      @click="window.open"
    >
      <IconAi style="font-size: 32px" />
    </button>
    <TrChat
      v-if="window.show"
      ref="chatRef"
      :class="['chat-add-window', `chat-add-window--${window.displayMode}`]"
      :style="window.layoutStyle"
      :runtime="runtime"
      :ui="chatUi"
      v-model:floating-state="window.floatingState"
      @prompt-click="handlePromptClick"
    >
      <template #layout-header>
        <WindowHeader
          :display-mode="window.displayMode"
          :show-history="showHistory"
          :history-data="historyData"
          :active-conversation-id="activeConversationId"
          @new-session="handleNewSession"
          @select-history="handleHistorySelect"
          @rename-history="handleHistoryRename"
          @history-action="handleHistoryAction"
          @update:show-history="showHistory = $event"
          @change-mode="window.setDisplayMode"
          @close="window.close"
        />
      </template>
      <template #composer-before>
        <ComposerTools v-model:current-template="currentTemplate" :template-categories="templateCategories" />
      </template>
    </TrChat>
  </TrTheme>
</template>

<style scoped>
.chat-add-launcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: var(--tr-z-index-popover, 1000);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--tr-container-bg-default);
  color: var(--tr-color-primary);
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
  cursor: pointer;
}
.chat-add-launcher:hover {
  background: var(--tr-color-primary-light);
}
.chat-add-launcher:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 3px;
}
@media (max-width: 519px) {
  .chat-add-launcher {
    right: 16px;
    bottom: 16px;
  }
}
</style>

<style>
.chat-add-window {
  --chat-prompt-min-width: 280px;
  --tr-layout-bg-default: #f5f5f7;
  --tr-chat-ui-header-bg: #f5f5f7;
  --tr-chat-ui-main-bg: #f5f5f7;
  --tr-chat-ui-footer-bg: #f5f5f7;
  min-width: 0;
}
.chat-add-window .tr-welcome {
  box-sizing: border-box;
  width: 100%;
  padding: 24px 24px 0;
}
.chat-add-window .tr-welcome__title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-add-window .tr-prompts {
  --tr-prompts-gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px 24px;
}
.chat-add-window .tr-prompts .tr-prompts__list-container.wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(var(--chat-prompt-min-width), 1fr));
}
.chat-add-window .tr-prompts__list-container > .prompt-item {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
@container (max-width: 623px) {
  .chat-add-window .tr-prompts .tr-prompts__list-container.wrap {
    grid-template-columns: minmax(0, 1fr);
  }
}
@container (max-width: 519px) {
  .chat-add-window .tr-welcome {
    padding-inline: 12px;
  }
  .chat-add-window .tr-prompts {
    padding-inline: 12px;
  }
  .chat-add-window .tr-bubble__avatar {
    display: none;
  }
}
</style>
