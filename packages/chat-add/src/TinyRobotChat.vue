<script setup lang="ts">
import type { HistoryMenuItem, PromptProps, TemplateItem } from '@opentiny/tiny-robot'
import { TrSender, TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChat, useChatHistoryItems, useLocalChatRuntime, type ChatHistoryItem } from '@opentiny/tiny-robot-chat'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { computed, reactive, ref } from 'vue'
import ComposerTools from './components/ComposerTools.vue'
import WindowHeader from './components/WindowHeader.vue'
import { composerMenus, createChatUi, templateCategories } from './config/chat-ui'
import { mcpExamples, mcpServers, modelProviders } from './config/chat-runtime'
import { useWindow } from './composables/useWindow'

const runtime = useLocalChatRuntime({ modelProviders, mcpServers })
const window = reactive(useWindow())
const currentTemplate = ref<TemplateItem[]>([])
const showHistory = ref(false)
const historyData = useChatHistoryItems({ conversations: () => runtime.conversations.value, defaultTitle: '' })
const activeConversationId = computed(() => runtime.activeConversation.value?.id)
const templateExtensions = [TrSender.template(currentTemplate as never, { appendTo: '.chat-add-window' })]
const chatUi = computed(() => createChatUi({ floatingOptions: window.floatingOptions, templateExtensions }))

function handlePromptClick({ item }: { item: PromptProps }): void {
  if (item.description) void runtime.actions.send({ text: item.description })
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
    <main class="chat-add-app">
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
        <template #composer-before="{ submit }">
          <ComposerTools
            v-model:current-template="currentTemplate"
            :template-categories="templateCategories"
            :mcp-examples="mcpExamples"
            :menus="composerMenus"
            :submit="submit"
          />
        </template>
      </TrChat>
    </main>
  </TrTheme>
</template>
