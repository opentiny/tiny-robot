<script setup lang="ts">
import { computed, defineComponent, onBeforeUnmount, shallowRef } from 'vue'
import {
  TrChat,
  useChatRuntimeAdapter,
  type ChatHistoryData,
  type ChatPromptClickPayload,
  type ChatRuntimeActionErrorPayload,
} from '@opentiny/tiny-robot-chat'
import DouBaoHeader from './DouBaoHeader.vue'
import DouBaoSidebar from './DouBaoSidebar.vue'
import { useChatCaseRuntime } from '../shared/createChatRuntime'
import { formatChatActionError } from '../shared/formatChatActionError'
import {
  douBaoConversationPrompts,
  douBaoConversationStorageKey,
  douBaoConversationWelcome,
  douBaoMockConversations,
  douBaoNavigation,
  douBaoWorkPrompts,
  douBaoWorkWelcome,
} from './config'

type DouBaoNavigation = (typeof douBaoNavigation)[keyof typeof douBaoNavigation]

const runtime = useChatCaseRuntime({
  storageKey: douBaoConversationStorageKey,
  initialConversations: douBaoMockConversations,
})
const actionErrorMessage = shallowRef('')
const promptAdapter = useChatRuntimeAdapter({
  runtime,
  onActionError: handleRuntimeActionError,
})
const historyData = computed<ChatHistoryData>(() => {
  const items = runtime.conversations.value

  return items.length ? [{ group: '最近', items }] : []
})
// Avoid rendering the default IconAi twice; its fixed SVG IDs collide with the welcome icon.
const emptyBrandLogo = defineComponent({
  name: 'DouBaoEmptyBrandLogo',
  render: () => null,
})
const isFloatingSidebarVisible = shallowRef(false)
const activeNavigation = shallowRef<DouBaoNavigation>(douBaoNavigation.chat)
const chatContainer = shallowRef<HTMLElement | null>(null)
let floatingHideTimer: ReturnType<typeof setTimeout> | undefined

const chatUi = computed(() => ({
  brand: { name: 'DouBao', logo: emptyBrandLogo },
  layout: {
    contentMaxWidth: 840,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 280,
      collapsedWidth: 0,
      defaultOpen: true,
    },
  },
  welcome: activeNavigation.value === douBaoNavigation.work ? douBaoWorkWelcome : douBaoConversationWelcome,
  prompts: activeNavigation.value === douBaoNavigation.work ? douBaoWorkPrompts : douBaoConversationPrompts,
  sender: {
    placeholder: '发消息或输入 / 选择技能',
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

function handleNavigationChange(item: string) {
  if (item === douBaoNavigation.work || item === douBaoNavigation.chat) {
    activeNavigation.value = item
  }
}

function handlePromptClick(payload: ChatPromptClickPayload) {
  void promptAdapter.send({ text: payload.item.description ?? payload.item.label })
}

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionErrorMessage.value = formatChatActionError(payload.action)
}

function handleConversationSelect(id: string, switchConversation: (id: string) => void) {
  switchConversation(id)
  activeNavigation.value = douBaoNavigation.chat
}

function handleCreateConversation(createConversation: () => void) {
  createConversation()
  activeNavigation.value = douBaoNavigation.chat
}

function handleConversationTitleChange(
  title: string,
  id: string,
  renameConversation: (id: string, title: string) => void,
) {
  renameConversation(id, title)
}

function handleConversationAction(action: { id: string }, id: string, deleteConversation: (id: string) => void) {
  if (action.id === 'delete') {
    deleteConversation(id)
  }
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
            @toggle="toggleSidebar(toggleLeftAside)"
            @menu-enter="showFloatingSidebar"
            @menu-leave="scheduleHideFloatingSidebar"
          />
        </template>

        <template
          #layout-left-aside="{
            conversation,
            isOpen,
            createConversation,
            switchConversation,
            renameConversation,
            deleteConversation,
          }"
        >
          <DouBaoSidebar
            variant="fixed"
            :conversation="conversation"
            :history-data="historyData"
            :active-navigation="activeNavigation"
            @create-conversation="handleCreateConversation(createConversation)"
            @navigation-change="handleNavigationChange"
            @conversation-select="handleConversationSelect($event, switchConversation)"
            @conversation-title-change="(title, id) => handleConversationTitleChange(title, id, renameConversation)"
            @conversation-action="(action, id) => handleConversationAction(action, id, deleteConversation)"
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
                  :active-navigation="activeNavigation"
                  @create-conversation="handleCreateConversation(createConversation)"
                  @navigation-change="handleNavigationChange"
                  @conversation-select="handleConversationSelect($event, switchConversation)"
                  @conversation-title-change="
                    (title, id) => handleConversationTitleChange(title, id, renameConversation)
                  "
                  @conversation-action="(action, id) => handleConversationAction(action, id, deleteConversation)"
                />
              </div>
            </Transition>
          </Teleport>
        </template>

        <template #welcome-footer>
          <div class="doubao-mode-switch" role="group" aria-label="模式切换">
            <button
              class="doubao-mode-switch__item"
              :class="{ 'is-active': activeNavigation === douBaoNavigation.chat }"
              type="button"
              :aria-pressed="activeNavigation === douBaoNavigation.chat"
              @click="activeNavigation = douBaoNavigation.chat"
            >
              对话
            </button>
            <button
              class="doubao-mode-switch__item"
              :class="{ 'is-active': activeNavigation === douBaoNavigation.work }"
              type="button"
              :aria-pressed="activeNavigation === douBaoNavigation.work"
              @click="activeNavigation = douBaoNavigation.work"
            >
              工作
            </button>
          </div>
          <div class="doubao-prompts-title">为你推荐</div>
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
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  --tr-chat-ui-left-aside-bg: var(--tr-container-bg-default-2);
  --tr-chat-ui-header-bg: var(--tr-container-bg-default);
  --tr-chat-ui-main-bg: var(--tr-container-bg-default);
  --tr-chat-ui-footer-bg: var(--tr-container-bg-default);
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

.doubao-case__chat :deep(.chat-panel-content--footer) {
  padding-bottom: 28px;
}

.doubao-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: 28vh 0 0;
}

.doubao-case__chat :deep(.tr-welcome__title) {
  color: var(--tr-text-primary);
  font-size: 30px;
  font-weight: 650;
}

.doubao-case__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.doubao-case__chat :deep(.tr-welcome__icon) {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.doubao-case__chat :deep(.tr-welcome__icon svg) {
  display: block;
  width: 40px;
  height: 40px;
}

.doubao-case__chat :deep(.tr-welcome__description) {
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
  justify-content: flex-start;
  max-width: none;
  gap: 10px;
}

.doubao-case__chat :deep(.tr-prompts) {
  box-sizing: border-box;
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 0 24px;
}

.doubao-case__chat :deep(.tr-prompt) {
  border-color: var(--tr-border-color-default);
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  box-shadow: none;
  background: var(--tr-container-bg-default);
}

.doubao-case__chat :deep(.tr-prompt:hover) {
  border-color: var(--tr-border-color-hover);
  background: var(--tr-color-primary-light);
}

.doubao-mode-switch {
  display: inline-flex;
  align-self: center;
  margin-top: 24px;
  padding: 3px;
  border-radius: 8px;
  background: var(--tr-container-bg-default-2);
}

.doubao-prompts-title {
  align-self: flex-start;
  box-sizing: border-box;
  width: 100%;
  max-width: 840px;
  margin-top: 112px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 24px;
  color: var(--tr-text-tertiary);
  font-size: 12px;
  line-height: 18px;
  text-align: left;
}

.doubao-mode-switch__item {
  min-width: 76px;
  padding: 7px 16px;
  border: 0;
  border-radius: 6px;
  color: var(--tr-text-secondary);
  background: transparent;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.doubao-mode-switch__item.is-active {
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  box-shadow: var(--tr-shadow-sm);
}

@media (prefers-reduced-motion: reduce) {
  .doubao-sidebar-slide-enter-active,
  .doubao-sidebar-slide-leave-active {
    transition: none;
  }
}
</style>
