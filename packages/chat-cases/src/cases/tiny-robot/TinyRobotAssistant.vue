<script setup lang="ts">
import type { TemplateItem } from '@opentiny/tiny-robot'
import { TrSender } from '@opentiny/tiny-robot'
import {
  TrChat,
  useChatHistoryItems,
  useChatRuntimeAdapter,
  type ChatPromptClickPayload,
  type ChatRuntimeActionErrorPayload,
  type ChatRuntime,
} from '@opentiny/tiny-robot-chat'
import { computed, reactive, ref } from 'vue'
import TinyRobotComposerTools from './TinyRobotComposerTools.vue'
import TinyRobotWindowHeader from './TinyRobotWindowHeader.vue'
import { createTinyRobotChatUi } from './tinyRobotChatUi'
import { useTinyRobotWindow, type TinyRobotDisplayMode } from './useTinyRobotWindow'
import { formatChatActionError } from '../../shared/runtime/formatChatActionError'

const props = defineProps<{
  runtime: ChatRuntime
}>()

const currentTemplate = ref<TemplateItem[]>([])
const templateExtensions = [
  TrSender.template(
    currentTemplate as never,
    {
      appendTo: '.tiny-robot-window',
    } as never,
  ),
]
const window = reactive(useTinyRobotWindow())
const showHistory = ref(false)
const actionErrorMessage = ref('')
const historyData = useChatHistoryItems({
  conversations: () => props.runtime.conversations.value,
  defaultTitle: '',
})
const activeConversationId = computed(() => props.runtime.activeConversation.value?.id)
const chatAdapter = useChatRuntimeAdapter({
  runtime: () => props.runtime,
  historyData,
  onActionError: handleRuntimeActionError,
})
const chatUi = computed(() =>
  createTinyRobotChatUi({
    floatingOptions: window.floatingOptions,
    templateExtensions,
  }),
)

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

function handleNewSession() {
  void chatAdapter.createConversation()
  showHistory.value = false
}

function handlePromptClick(payload: ChatPromptClickPayload) {
  void chatAdapter.send({ text: payload.item.description ?? payload.item.label })
}

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionErrorMessage.value = formatChatActionError(payload.action)
}

function handleHistorySelect(item: { raw: { id: string } }) {
  void chatAdapter.switchConversation(item.raw.id)
  showHistory.value = false
}

function handleHistoryTitleChange(title: string, item: { raw: { id: string } }) {
  void chatAdapter.renameConversation(item.raw.id, title)
}

function handleHistoryAction(action: { id: string }, item: { raw: { id: string } }) {
  if (action.id === 'delete') {
    void chatAdapter.deleteConversation(item.raw.id)
  }
}
</script>

<template>
  <div class="tiny-robot-assistant">
    <div v-if="actionErrorMessage" class="tiny-robot-assistant__action-error" role="alert" aria-live="polite">
      {{ actionErrorMessage }}
    </div>
    <TrChat
      v-if="window.show"
      :class="['tiny-robot-window', `tiny-robot-window--${window.displayMode}`]"
      :style="window.layoutStyle"
      :runtime="props.runtime"
      :ui="chatUi"
      v-model:floating-state="window.floatingState"
      @prompt-click="handlePromptClick"
      @runtime-action-error="handleRuntimeActionError"
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
  position: relative;
  container-type: inline-size;
  display: flex;
  box-sizing: border-box;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.tiny-robot-assistant__action-error {
  position: fixed;
  top: 16px;
  left: 50%;
  z-index: 50;
  padding: 8px 14px;
  border: 1px solid #f3b4b4;
  border-radius: 8px;
  color: #9f1d1d;
  background: #fff5f5;
  box-shadow: 0 4px 12px rgb(31 35 41 / 12%);
  font-size: 13px;
  transform: translateX(-50%);
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
