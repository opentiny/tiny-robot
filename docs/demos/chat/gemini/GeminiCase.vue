<script setup lang="ts">
import { computed, defineComponent, h, shallowRef } from 'vue'
import {
  TrChat,
  useChatRuntimeAdapter,
  type ChatHistoryData,
  type ChatRuntimeActionErrorPayload,
} from '@opentiny/tiny-robot-chat'
import { IconNewSession, IconPlus, IconSearch, IconSetting, IconTypeAll } from '@opentiny/tiny-robot-svgs'
import GeminiComposer from './GeminiComposer.vue'
import GeminiHeader from './GeminiHeader.vue'
import GeminiRail from './GeminiRail.vue'
import geminiMask from './icons/gemini-mask.svg'
import { geminiConversationStorageKey, geminiMockConversations, geminiWelcome } from './config'
import { useChatCaseRuntime } from '../shared/createChatRuntime'
import { formatChatActionError } from '../shared/formatChatActionError'

const GeminiLogo = defineComponent({
  name: 'GeminiLogo',
  setup() {
    return () => h('img', { src: geminiMask, alt: 'Gemini' })
  },
})

const EmptyWelcomeIcon = defineComponent({
  name: 'GeminiEmptyWelcomeIcon',
  render: () => null,
})

const runtime = useChatCaseRuntime({
  storageKey: geminiConversationStorageKey,
  initialConversations: geminiMockConversations,
})

const historyData = computed<ChatHistoryData>(() => {
  const items = runtime.conversations.value

  return items.length ? [{ group: '最近', items }] : []
})

const actionErrorMessage = shallowRef('')

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionErrorMessage.value = formatChatActionError(payload.action)
}

const modelAdapter = useChatRuntimeAdapter({
  runtime,
  onActionError: handleRuntimeActionError,
})

const chatUi = {
  brand: { name: 'Gemini', logo: GeminiLogo },
  layout: {
    composer: {
      welcome: 'center' as const,
    },
    contentMaxWidth: 760,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 288,
      collapsedWidth: 56,
      defaultOpen: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  welcome: { ...geminiWelcome, icon: h(EmptyWelcomeIcon) as any },
  prompts: false as const,
  model: false as const,
  mcp: false as const,
}
</script>

<template>
  <div class="gemini-case">
    <div v-if="actionErrorMessage" class="gemini-case__action-error" role="alert" aria-live="polite">
      {{ actionErrorMessage }}
    </div>
    <main class="gemini-case__chat">
      <TrChat
        :runtime="runtime"
        :ui="chatUi"
        :history-data="historyData"
        @runtime-action-error="handleRuntimeActionError"
      >
        <template #layout-header="{ isEmpty }">
          <GeminiHeader :is-empty="isEmpty" />
        </template>

        <template #layout-footer="slotProps">
          <GeminiComposer
            v-bind="slotProps"
            :model="runtime.composer.model!"
            :select-model="modelAdapter.selectModel"
          />
        </template>

        <template #layout-left-aside-rail="{ isOpen, conversation, openLeftAside, createConversation }">
          <GeminiRail
            :is-open="isOpen"
            :is-new-conversation-active="!conversation.activeId"
            @open="openLeftAside"
            @create="createConversation"
          />
        </template>

        <template #layout-left-aside-brand="{ closeLeftAside }">
          <div id="gemini-sidebar-panel" class="gemini-left-brand">
            <div class="gemini-left-brand__mark">
              <img :src="geminiMask" alt="Gemini" />
              <span>Gemini</span>
            </div>
            <button
              class="gemini-left-brand__toggle"
              type="button"
              aria-label="收起边栏"
              title="收起边栏"
              @click="closeLeftAside"
            >
              <span class="gemini-sidebar-icon gemini-sidebar-icon--menu" aria-hidden="true" />
              <span class="gemini-sidebar-icon gemini-sidebar-icon--left" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #layout-left-aside-actions="{ conversation, createConversation }">
          <nav class="gemini-left-navigation" aria-label="Gemini 导航">
            <button
              class="gemini-left-action"
              :class="{ 'is-active': !conversation.activeId }"
              type="button"
              @click="createConversation"
            >
              <IconNewSession :size="18" aria-hidden="true" />
              <span>发起新对话</span>
            </button>

            <button class="gemini-left-action" type="button" aria-label="搜索对话内容" title="搜索对话内容" disabled>
              <IconSearch :size="18" aria-hidden="true" />
              <span>搜索对话内容</span>
            </button>

            <button class="gemini-left-action" type="button" aria-label="库" title="库" disabled>
              <IconTypeAll :size="18" aria-hidden="true" />
              <span>库</span>
            </button>
          </nav>

          <section class="gemini-left-section" aria-labelledby="gemini-notebooks-title">
            <h2 id="gemini-notebooks-title" class="gemini-left-section__title">笔记本</h2>
            <button class="gemini-left-action" type="button" aria-label="新建笔记本" title="新建笔记本" disabled>
              <IconPlus :size="18" aria-hidden="true" />
              <span>新建笔记本</span>
            </button>
          </section>
        </template>

        <template #layout-left-aside-footer>
          <div class="gemini-left-footer">
            <button class="gemini-left-footer__profile" type="button" aria-label="用户账户" title="用户账户" disabled>
              <span class="gemini-avatar" aria-hidden="true">sl</span>
              <span class="gemini-left-footer__name">song lii</span>
            </button>
            <button class="gemini-left-footer__settings" type="button" aria-label="设置" title="设置" disabled>
              <IconSetting :size="18" />
            </button>
          </div>
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.gemini-case {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--gemini-sidebar-text);
  background: var(--gemini-sidebar-bg);
  --gemini-sidebar-bg: var(--tr-container-bg-default);
  --gemini-sidebar-text: var(--tr-text-primary);
  --gemini-sidebar-muted: var(--tr-text-secondary);
  --gemini-sidebar-hover-bg: var(--tr-container-bg-hover);
  --gemini-sidebar-selected-bg: var(--tr-color-primary-light);
  --gemini-sidebar-selected-text: var(--tr-text-primary);
  --gemini-sidebar-focus-ring: color-mix(in srgb, var(--tr-color-primary) 52%, transparent);
  --gemini-avatar-bg: #d8e5f8;
  --gemini-avatar-text: #4268a8;
  --gemini-sidebar-footer-bg: var(--gemini-sidebar-bg);
  --gemini-sidebar-footer-text: var(--gemini-sidebar-text);
  --gemini-sidebar-footer-hover-bg: var(--gemini-sidebar-hover-bg);
  --tr-chat-ui-left-aside-bg: var(--gemini-sidebar-bg);
  --tr-chat-ui-header-bg: var(--gemini-sidebar-bg);
  --tr-chat-ui-main-bg: var(--gemini-sidebar-bg);
  --tr-chat-ui-footer-bg: var(--gemini-sidebar-bg);
}

.gemini-case__action-error {
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

.gemini-case__chat {
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.gemini-case__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.gemini-case__chat :deep(.chat-panel-content--header) {
  position: relative;
  z-index: 20;
  height: auto;
  min-height: 0;
  padding: 0;
  overflow: visible;
}

.gemini-case__chat :deep(.chat-left-aside-logo) {
  display: none;
}

.gemini-case__chat :deep(.chat-left-aside-rail) {
  padding: 14px 8px 16px;
  color: var(--gemini-sidebar-text);
  background: var(--gemini-sidebar-bg);
}

.gemini-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
  background: var(--gemini-sidebar-bg);
}

.gemini-case__chat :deep(.chat-left-aside-brand) {
  min-height: 56px;
  padding: 14px 8px 0;
}

.gemini-left-brand,
.gemini-left-brand__mark,
.gemini-left-footer,
.gemini-left-footer__profile {
  display: flex;
  align-items: center;
}

.gemini-left-brand {
  justify-content: space-between;
  width: 100%;
  padding: 0 4px 0 8px;
}

.gemini-left-brand__mark {
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.gemini-left-brand__mark img {
  display: block;
  width: 24px;
  height: 24px;
}

.gemini-left-brand__toggle,
.gemini-left-footer__settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: var(--gemini-sidebar-text);
  background: transparent;
  cursor: pointer;
}

.gemini-left-footer__settings {
  flex: 0 0 32px;
  margin-left: auto;
  color: var(--gemini-sidebar-footer-text);
}

.gemini-left-brand__toggle .gemini-sidebar-icon--left {
  display: none;
}

.gemini-left-brand__toggle:hover,
.gemini-left-brand__toggle:focus-visible {
  background: var(--gemini-sidebar-hover-bg);
}

.gemini-left-brand__toggle:hover .gemini-sidebar-icon--menu,
.gemini-left-brand__toggle:focus-visible .gemini-sidebar-icon--menu {
  display: none;
}

.gemini-left-brand__toggle:hover .gemini-sidebar-icon--left,
.gemini-left-brand__toggle:focus-visible .gemini-sidebar-icon--left {
  display: block;
}

.gemini-sidebar-icon {
  display: block;
  flex: none;
  width: 18px;
  height: 18px;
  background-color: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.gemini-sidebar-icon--menu {
  -webkit-mask-image: url('./icons/sidebar-toggle-menu.svg');
  mask-image: url('./icons/sidebar-toggle-menu.svg');
}

.gemini-sidebar-icon--left {
  -webkit-mask-image: url('./icons/sidebar-toggle-left.svg');
  mask-image: url('./icons/sidebar-toggle-left.svg');
}

.gemini-left-action:hover,
.gemini-left-action:focus-visible {
  background: var(--gemini-sidebar-hover-bg);
}

.gemini-left-action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.gemini-left-action.is-active {
  color: var(--gemini-sidebar-selected-text);
  background: var(--gemini-sidebar-selected-bg);
}

.gemini-left-action.is-active:hover,
.gemini-left-action.is-active:focus-visible {
  background: var(--gemini-sidebar-selected-bg);
}

.gemini-case__chat :deep(.chat-left-aside-actions) {
  margin-top: 18px;
  padding: 0 8px;
}

.gemini-left-navigation {
  display: grid;
  gap: 2px;
}

.gemini-left-action {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 34px;
  padding: 6px 12px;
  border: 0;
  border-radius: 18px;
  color: var(--gemini-sidebar-text);
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.gemini-left-section {
  margin-top: 22px;
}

.gemini-left-section__title {
  margin: 0 10px 8px;
  color: var(--gemini-sidebar-muted);
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
}

.gemini-case__chat :deep(.chat-left-aside-content) {
  margin-top: 22px;
  padding: 0 8px;
  min-width: 0;
}

.gemini-case__chat :deep(.chat-left-aside-history) {
  min-width: 0;
  --tr-history-group-space-y: 14px;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-line-height: 18px;
  --tr-history-group-title-padding: 0 12px 6px;
  --tr-history-group-title-color: var(--gemini-sidebar-muted);
  --tr-history-item-padding: 6px 12px;
  --tr-history-item-padding-editing: 6px 12px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-color: var(--gemini-sidebar-text);
  --tr-history-item-hover-bg: var(--gemini-sidebar-hover-bg);
  --tr-history-item-selected-bg: var(--gemini-sidebar-selected-bg);
  --tr-history-item-selected-color: var(--gemini-sidebar-selected-text);
  --tr-history-item-space-y: 2px;
  --tr-history-item-font-size: 13px;
}

.gemini-case__chat :deep(.chat-left-aside-footer) {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0 6px;
  color: var(--gemini-sidebar-footer-text);
  background: var(--gemini-sidebar-footer-bg);
}

.gemini-left-footer {
  box-sizing: border-box;
  height: 48px;
  min-height: 48px;
  width: 100%;
  padding: 4px 0;
  gap: 8px;
}

.gemini-left-footer__profile {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  min-width: 0;
  width: auto;
  max-width: 100%;
  flex: 0 1 auto;
  gap: 9px;
  height: 40px;
  padding: 0 8px;
  border: 0;
  border-radius: 18px;
  color: var(--gemini-sidebar-footer-text);
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}

.gemini-left-footer__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gemini-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 50%;
  color: var(--gemini-avatar-text);
  background: var(--gemini-avatar-bg);
  font-size: 11px;
  font-weight: 600;
}

.gemini-left-footer__profile:hover,
.gemini-left-footer__profile:focus-visible,
.gemini-left-footer__settings:hover,
.gemini-left-footer__settings:focus-visible {
  background: var(--gemini-sidebar-footer-hover-bg);
}

.gemini-left-footer__profile:disabled,
.gemini-left-footer__settings:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.gemini-left-brand__toggle:focus-visible,
.gemini-left-action:focus-visible,
.gemini-left-footer__profile:focus-visible,
.gemini-left-footer__settings:focus-visible {
  outline: 2px solid var(--gemini-sidebar-focus-ring);
  outline-offset: 2px;
}

.gemini-case__chat :deep(.chat-panel) {
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--tr-color-primary-light) 70%, var(--tr-container-bg-default)) 0,
    var(--tr-container-bg-default-2) 36%,
    var(--tr-container-bg-default) 70%
  );
}

.gemini-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
}

.gemini-case__chat :deep(.tr-welcome__title) {
  color: var(--tr-text-primary);
  font-size: 40px;
  font-weight: 400;
  line-height: 56px;
}

.gemini-case__chat :deep(.tr-welcome__description) {
  display: none;
}

.gemini-case__chat :deep(.chat-welcome-composer) {
  box-sizing: border-box;
  width: 100%;
  max-width: 660px;
  margin: 24px auto 0;
}

.gemini-case__chat :deep(.chat-panel-content--footer) {
  max-width: 660px;
}

.gemini-case__chat :deep(.chat-panel-content--main.is-message-state) {
  padding-top: 8px;
}

.gemini-case__chat :deep(.chat-panel-content--main.is-message-state .tr-chat-messages__bubble-list) {
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 0 32px;
}

@media (max-width: 959px) {
  .gemini-case__chat :deep(.chat-welcome-composer),
  .gemini-case__chat :deep(.chat-panel-content--footer) {
    max-width: none;
  }

  .gemini-case__chat :deep(.chat-welcome-composer) {
    padding: 0 8px;
  }

  .gemini-case__chat :deep(.tr-welcome__title) {
    font-size: 30px;
    line-height: 42px;
  }
}
</style>
