<script setup lang="ts">
import type { HistoryMenuItem, PromptProps, TemplateItem } from '@opentiny/tiny-robot'
import { TrSender } from '@opentiny/tiny-robot'
import { TrChat, useChatHistoryItems, type ChatHistoryItem, type ChatRuntime } from '@opentiny/tiny-robot-chat'
import { computed, reactive, ref } from 'vue'
import TinyRobotComposerTools from './TinyRobotComposerTools.vue'
import TinyRobotWindowHeader from './TinyRobotWindowHeader.vue'
import { createTinyRobotChatUi } from './tinyRobotChatUi'
import { useTinyRobotWindow, type TinyRobotDisplayMode } from './useTinyRobotWindow'

const props = defineProps<{
  runtime: ChatRuntime
}>()

const currentTemplate = ref<TemplateItem[]>([])
const templateExtensions = [
  TrSender.template(currentTemplate as never, {
    appendTo: '.tiny-robot-window',
  }),
]
const window = reactive(useTinyRobotWindow())
const showHistory = ref(false)
const historyData = useChatHistoryItems({
  conversations: () => props.runtime.conversations.value,
  defaultTitle: '',
})
const activeConversationId = computed(() => props.runtime.activeConversation.value?.id)
const chatUi = computed(() =>
  createTinyRobotChatUi({
    floatingOptions: window.floatingOptions,
    templateExtensions,
  }),
)

async function sendMessage(text: string) {
  const value = text.trim()
  if (!value) return

  await props.runtime.actions.send({ text: value })
}

function handlePromptItemClick({ item }: { item: PromptProps }) {
  if (item.description) {
    void sendMessage(item.description)
  }
}

function handleNewSession() {
  void props.runtime.actions.createConversation()
  showHistory.value = false
}

function handleHistorySelect(item: ChatHistoryItem) {
  void props.runtime.actions.switchConversation(item.raw.id)
  showHistory.value = false
}

function handleHistoryTitleChange(title: string, item: ChatHistoryItem) {
  void props.runtime.actions.renameConversation(item.raw.id, title)
}

function handleHistoryAction(action: HistoryMenuItem, item: ChatHistoryItem) {
  if (action.id === 'delete') {
    void props.runtime.actions.deleteConversation(item.raw.id)
  }
}

function handleHistoryVisibility(value: boolean) {
  showHistory.value = value
}

function handleModeChange(mode: TinyRobotDisplayMode) {
  window.setDisplayMode(mode)
}

function handleClose() {
  showHistory.value = false
  window.close()
}
</script>

<template>
  <div class="tiny-robot-assistant">
    <TrChat
      v-if="window.show"
      :class="['tiny-robot-window', `tiny-robot-window--${window.displayMode}`]"
      :style="window.layoutStyle"
      :runtime="props.runtime"
      :ui="chatUi"
      v-model:floating-state="window.floatingState"
      @prompt-click="handlePromptItemClick"
    >
      <template #layout-header>
        <TinyRobotWindowHeader
          :display-mode="window.displayMode"
          :show-history="showHistory"
          :history-data="historyData"
          :active-conversation-id="activeConversationId"
          @new-session="handleNewSession"
          @update:show-history="handleHistoryVisibility"
          @history-select="handleHistorySelect"
          @history-title-change="handleHistoryTitleChange"
          @history-action="handleHistoryAction"
          @change-mode="handleModeChange"
          @close="handleClose"
        />
      </template>
      <template #composer-before="{ submit }">
        <TinyRobotComposerTools v-model:current-template="currentTemplate" :submit="submit" />
      </template>
    </TrChat>
  </div>
</template>

<style scoped>
.tiny-robot-assistant {
  container-type: inline-size;
  display: flex;
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
}
</style>

<style>
.tiny-robot-window {
  container-type: inline-size;

  --tr-layout-bg-default: #f5f5f7;
  --tr-suggestion-popover-width: min(440px, calc(100cqw - 16px));
  --tr-chat-ui-header-bg: var(--tr-layout-bg-default);
  --tr-chat-ui-main-bg: var(--tr-layout-bg-default);
  --tr-chat-ui-footer-bg: var(--tr-layout-bg-default);
}

.tiny-robot-window .tr-welcome {
  box-sizing: border-box;
  width: 100%;
  padding: 24px 24px 0;
}

.tiny-robot-window .tr-welcome__title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiny-robot-window .tr-prompts {
  --tr-prompts-gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px 24px;
}

.tiny-robot-window .prompt-item {
  flex: 0 0 calc((100% - 16px) / 2);
  box-sizing: border-box;
  min-width: 0;
}

@container (max-width: 519px) {
  .tiny-robot-window .prompt-item {
    flex-basis: 100%;
  }
}
</style>
