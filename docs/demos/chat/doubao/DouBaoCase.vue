<script setup lang="ts">
import { computed, defineComponent, onBeforeUnmount, shallowRef } from 'vue'
import {
  TrChat,
  useChatRuntimeAdapter,
  type ChatHistoryData,
  type ChatPromptClickPayload,
  type ChatRuntimeActionErrorPayload,
} from '@opentiny/tiny-robot-chat'
import DouBaoIcon from './DouBaoIcon.vue'
import DouBaoHeader from './DouBaoHeader.vue'
import DouBaoSidebar from './DouBaoSidebar.vue'
import { formatChatActionError } from '../shared/formatChatActionError'
import { douBaoConversationPrompts, douBaoConversationWelcome } from './config'
import { useDouBaoRuntime } from './runtime'

const { runtime, startBlank } = useDouBaoRuntime()
const actionErrorMessage = shallowRef('')
const promptAdapter = useChatRuntimeAdapter({
  runtime,
  onActionError: handleRuntimeActionError,
})
const historyData = computed<ChatHistoryData>(() => {
  const items = runtime.conversations.value

  return items.length ? [{ group: '最近', items }] : []
})
const headerTitle = computed(() => runtime.activeConversation.value?.title ?? '新对话')
// Avoid rendering the default IconAi twice; its fixed SVG IDs collide with the welcome icon.
const emptyVisual = defineComponent({
  name: 'DouBaoEmptyVisual',
  render: () => null,
})
const isFloatingSidebarVisible = shallowRef(false)
const chatContainer = shallowRef<HTMLElement | null>(null)
let floatingHideTimer: ReturnType<typeof setTimeout> | undefined

const senderTools = [
  { id: 'chat', label: '对话', icon: 'new-chat' },
  { id: 'image', label: '图像生成', icon: 'image' },
  { id: 'ppt', label: 'PPT生成', icon: 'ppt' },
  { id: 'write', label: '帮我写作', icon: 'write' },
  { id: 'video', label: '视频生成', icon: 'video' },
  { id: 'translate', label: '翻译', icon: 'translate' },
  { id: 'more', label: '更多', icon: 'more' },
] as const

const chatUi = computed(() => ({
  brand: { name: '豆包', logo: emptyVisual },
  layout: {
    contentMaxWidth: 900,
    panelPadding: 0,
    panelGap: 0,
    leftAside: {
      mode: 'dock' as const,
      width: 238,
      collapsedWidth: 0,
      defaultOpen: true,
    },
  },
  history: { menuItems: [] },
  bubble: {
    autoScroll: true,
    bubbleList: {
      roleConfigs: {
        assistant: { placement: 'start' as const, shape: 'none' as const, avatar: emptyVisual },
        user: { placement: 'end' as const, shape: 'rounded' as const, avatar: emptyVisual },
      },
    },
  },
  model: false as const,
  mcp: false as const,
  welcome: douBaoConversationWelcome,
  prompts: douBaoConversationPrompts,
  sender: {
    placeholder: '发消息或按住空格说...',
    showWordLimit: false,
  },
}))

function showFloatingSidebar(isSidebarOpen: boolean) {
  if (isSidebarOpen) return
  clearFloatingHideTimer()
  isFloatingSidebarVisible.value = true
}

function scheduleHideFloatingSidebar() {
  clearFloatingHideTimer()
  floatingHideTimer = setTimeout(() => {
    isFloatingSidebarVisible.value = false
  }, 120)
}

function clearFloatingHideTimer() {
  if (floatingHideTimer !== undefined) {
    clearTimeout(floatingHideTimer)
    floatingHideTimer = undefined
  }
}

function toggleSidebar(toggleLeftAside: () => void) {
  clearFloatingHideTimer()
  isFloatingSidebarVisible.value = false
  toggleLeftAside()
}

function handlePromptClick(payload: ChatPromptClickPayload) {
  void promptAdapter.send({ text: payload.item.description ?? payload.item.label })
}

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionErrorMessage.value = formatChatActionError(payload.action)
}

function handleConversationSelect(id: string, switchConversation: (id: string) => void) {
  switchConversation(id)
}

function handleCreateConversation() {
  startBlank()
}

onBeforeUnmount(() => {
  clearFloatingHideTimer()
})
</script>

<template>
  <div class="doubao-case">
    <div v-if="actionErrorMessage" class="doubao-case__action-error" role="alert" aria-live="polite">
      {{ actionErrorMessage }}
    </div>
    <main ref="chatContainer" class="doubao-case__chat">
      <TrChat
        :runtime="runtime"
        :ui="chatUi"
        :history-data="historyData"
        @prompt-click="handlePromptClick"
        @runtime-action-error="handleRuntimeActionError"
      >
        <template #layout-header="{ isLeftAsideOpen, toggleLeftAside }">
          <DouBaoHeader
            :is-sidebar-open="isLeftAsideOpen"
            :title="headerTitle"
            @toggle="toggleSidebar(toggleLeftAside)"
            @menu-enter="showFloatingSidebar"
            @menu-leave="scheduleHideFloatingSidebar"
          />
        </template>

        <template #layout-left-aside="{ conversation, isOpen, switchConversation }">
          <DouBaoSidebar
            variant="fixed"
            :conversation="conversation"
            :history-data="historyData"
            @create-conversation="handleCreateConversation"
            @conversation-select="handleConversationSelect($event, switchConversation)"
          />
          <Teleport v-if="chatContainer" :to="chatContainer">
            <Transition name="doubao-sidebar-slide" :css="!isOpen">
              <div
                v-if="!isOpen && isFloatingSidebarVisible"
                class="doubao-case__floating-sidebar"
                @mouseenter="clearFloatingHideTimer"
                @mouseleave="scheduleHideFloatingSidebar"
              >
                <DouBaoSidebar
                  variant="floating"
                  :conversation="conversation"
                  :history-data="historyData"
                  @create-conversation="handleCreateConversation"
                  @conversation-select="handleConversationSelect($event, switchConversation)"
                />
              </div>
            </Transition>
          </Teleport>
        </template>

        <template #welcome-footer>
          <div class="doubao-prompts-title">为你推荐</div>
        </template>

        <template #sender-footer>
          <div class="doubao-sender-tools" aria-label="创作工具（展示）">
            <span class="doubao-sender-tools__add" aria-hidden="true">
              <DouBaoIcon name="plus" :size="20" />
            </span>
            <span class="doubao-sender-tools__divider" aria-hidden="true"></span>
            <span v-for="tool in senderTools" :key="tool.id" class="doubao-sender-tools__item">
              <DouBaoIcon class="doubao-sender-tools__icon" :name="tool.icon" :size="15" />
              <span>{{ tool.label }}</span>
            </span>
          </div>
        </template>

        <template #sender-footer-right>
          <span class="doubao-sender-voice" aria-hidden="true">
            <DouBaoIcon name="audio-lines" :size="19" />
          </span>
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.doubao-case {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #17191c;
  background: #fff;
  --tr-chat-ui-left-aside-bg: #f7f8fa;
  --tr-chat-ui-header-bg: #fff;
  --tr-chat-ui-main-bg: #fff;
  --tr-chat-ui-footer-bg: #fff;
}

.doubao-case__action-error {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 50;
  padding: 8px 14px;
  border: 1px solid var(--tr-color-error-light);
  border-radius: 8px;
  color: var(--tr-color-error);
  background: var(--tr-color-error-light);
  box-shadow: var(--tr-shadow-sm);
  font-size: 13px;
  transform: translateX(-50%);
}

.doubao-case__floating-sidebar {
  position: absolute;
  top: 56px;
  bottom: 0;
  left: 0;
  z-index: 30;
}

.doubao-sidebar-slide-enter-active,
.doubao-sidebar-slide-leave-active {
  transition: transform 180ms ease;
  will-change: transform;
}

.doubao-sidebar-slide-enter-from,
.doubao-sidebar-slide-leave-to {
  transform: translateX(calc(-100% - 8px));
}

.doubao-case__chat {
  position: relative;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.doubao-case__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.doubao-case__chat :deep(.chat-panel-content--header) {
  max-width: none;
  padding: 0;
}

.doubao-case__chat :deep(.chat-panel) {
  padding: 0;
}

.doubao-case__chat :deep(.chat-panel-content--footer) {
  max-width: 900px;
  padding: 0 0 38px;
}

.doubao-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: clamp(150px, 28vh, 230px) 0 0;
}

.doubao-case__chat :deep(.tr-welcome__title) {
  color: #050505;
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.6px;
}

.doubao-case__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.doubao-case__chat :deep(.tr-welcome__description),
.doubao-case__chat :deep(.tr-welcome__icon) {
  display: none;
}

.doubao-case__chat :deep(.chat-left-aside-logo),
.doubao-case__chat :deep(.chat-left-aside-rail) {
  display: none;
}

.doubao-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
}

.doubao-case__chat :deep(.tr-prompts__list-container) {
  max-width: none;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 9px;
}

.doubao-case__chat :deep(.tr-prompts) {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 12px;
  padding: 0;
  --tr-prompt-title-font-weight: normal;
}

.doubao-case__chat :deep(.tr-prompt) {
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid #dfe2e7;
  border-radius: 10px;
  box-shadow: none;
  color: #202226;
  background: #fff;
  font-size: 14px;
}

.doubao-case__chat :deep(.tr-prompt:hover) {
  border-color: #cdd1d8;
  background: #f7f8fa;
}

.doubao-case__chat :deep(.tr-sender) {
  min-height: 98px;
  border: 1px solid #e1e3e7;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 10px 28px rgb(0 0 0 / 8%);
  --tr-sender-multi-main-padding: 14px 16px 3px;
  --tr-sender-footer-padding: 5px 10px 10px 14px;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state .tr-chat-messages__bubble-list) {
  box-sizing: border-box;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 0 120px;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state .tr-bubble__avatar) {
  display: none;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state .tr-bubble[data-role='user']) {
  --tr-bubble-max-width: 72%;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state [data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: #f4f4f5;
  --tr-bubble-box-padding: 12px 16px;
  --tr-bubble-box-shape-rounded-radius: 16px;
  --tr-bubble-box-shadow: none;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state .tr-bubble[data-role='assistant']) {
  --tr-bubble-max-width: 100%;
}

.doubao-case__chat :deep(.chat-panel-content--main.is-message-state [data-box-type='box'][data-role='assistant']) {
  --tr-bubble-box-bg: transparent;
  --tr-bubble-box-padding: 0;
  --tr-bubble-box-shadow: none;
}

.doubao-case__chat :deep(.tr-sender-footer-left) {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.doubao-prompts-title {
  box-sizing: border-box;
  width: 100%;
  align-self: flex-start;
  margin: clamp(54px, 10vh, 88px) auto 10px;
  padding: 0;
  color: #9da1a9;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
}

.doubao-case__chat :deep(.doubao-sender-tools) {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 13px;
  overflow: hidden;
  color: #25272b;
  font-size: 13px;
  white-space: nowrap;
}

.doubao-case__chat :deep(.doubao-sender-tools__item),
.doubao-case__chat :deep(.doubao-sender-tools__add) {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 5px;
  cursor: default;
}

.doubao-case__chat :deep(.doubao-sender-tools__icon) {
  width: 15px;
  height: 15px;
  flex: none;
}

.doubao-case__chat :deep(.doubao-sender-tools__add) {
  justify-content: center;
  width: 24px;
  height: 24px;
}

.doubao-case__chat :deep(.doubao-sender-tools__divider) {
  width: 1px;
  height: 19px;
  flex: none;
  background: #e5e7eb;
}

.doubao-case__chat :deep(.doubao-sender-voice) {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #22252a;
  background: #f3f4f6;
  cursor: default;
}

@media (max-width: 1100px) {
  .doubao-case__chat :deep(.chat-panel-content--footer) {
    padding-right: 20px;
    padding-left: 20px;
  }

  .doubao-case__chat :deep(.tr-prompts),
  .doubao-prompts-title {
    max-width: calc(100% - 40px);
  }

  .doubao-case__chat :deep(.doubao-sender-tools) {
    gap: 9px;
  }

  .doubao-case__chat :deep(.doubao-sender-tools__item:nth-last-child(-n + 3)) {
    display: none;
  }
}

@media (max-width: 720px) {
  .doubao-case__chat :deep(.tr-welcome) {
    padding-top: 120px;
  }

  .doubao-case__chat :deep(.tr-welcome__title) {
    font-size: 24px;
  }

  .doubao-prompts-title {
    margin-top: 44px;
  }

  .doubao-case__chat :deep(.doubao-sender-tools__item:nth-child(n + 6)) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doubao-sidebar-slide-enter-active,
  .doubao-sidebar-slide-leave-active {
    transition: none;
  }
}
</style>
