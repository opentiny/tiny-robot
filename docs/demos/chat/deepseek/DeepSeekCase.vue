<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { TrChat } from '@opentiny/tiny-robot-chat'
import DeepSeekHeader from './DeepSeekHeader.vue'
import deepseekMark from './icons/deepseek-mark.svg'
import deepseekWordmark from './icons/deepseek-wordmark.svg'
import newChatIcon from './icons/new-chat.svg'
import searchIcon from './icons/search.svg'
import sidebarToggleIcon from './icons/sidebar-toggle.svg'
import { deepseekConversationStorageKey, deepseekMockConversations, deepseekWelcome } from './config'
import { useChatCaseRuntime } from '../shared/createChatRuntime'

const DeepSeekLogo = defineComponent({
  name: 'DeepSeekLogo',
  setup() {
    return () => h('img', { src: deepseekMark, alt: 'DeepSeek' })
  },
})

const runtime = useChatCaseRuntime({
  storageKey: deepseekConversationStorageKey,
  initialConversations: deepseekMockConversations,
})

const historyData = computed(() => {
  const groups = ['置顶', '昨天', '30天内'] as const
  const grouped = new Map<string, typeof runtime.conversations.value>()

  for (const group of groups) {
    grouped.set(group, [])
  }

  for (const item of runtime.conversations.value) {
    const group = typeof item.metadata?.group === 'string' ? item.metadata.group : '30天内'
    grouped.set(group, [...(grouped.get(group) ?? []), item])
  }

  return [...grouped.entries()].filter(([, items]) => items.length > 0).map(([group, items]) => ({ group, items }))
})

const chatUi = computed(() => ({
  brand: { name: 'DeepSeek', logo: DeepSeekLogo },
  layout: {
    composer: {
      welcome: 'center' as const,
    },
    contentMaxWidth: 920,
    panelPadding: 12,
    panelGap: 16,
    leftAside: {
      mode: 'dock' as const,
      width: 260,
      collapsedWidth: 0,
      defaultOpen: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  welcome: { ...deepseekWelcome, icon: h(DeepSeekLogo) as any },
  prompts: false as const,
  bubble: {
    bubbleList: {
      roleConfigs: {
        assistant: { avatar: undefined },
        user: { avatar: undefined },
      },
    },
  },
  mcp: false as const,
  sender: {
    placeholder: '给 DeepSeek 发送消息',
  },
}))
</script>

<template>
  <div class="deepseek-case">
    <main class="deepseek-case__chat">
      <TrChat :runtime="runtime" :ui="chatUi" :history-data="historyData">
        <template #layout-header="{ title, isEmpty, isLeftAsideOpen, toggleLeftAside, createConversation }">
          <DeepSeekHeader
            :title="title"
            :is-empty="isEmpty"
            :is-sidebar-open="isLeftAsideOpen"
            @toggle="toggleLeftAside"
            @create-conversation="createConversation"
          />
        </template>

        <template #layout-left-aside-brand="{ closeLeftAside }">
          <div class="deepseek-left-brand">
            <div class="deepseek-left-brand__mark">
              <img class="deepseek-left-brand__icon" :src="deepseekMark" alt="" />
              <img class="deepseek-left-brand__wordmark" :src="deepseekWordmark" alt="DeepSeek" />
            </div>
            <div class="deepseek-left-brand__actions">
              <button type="button" aria-label="搜索会话" title="搜索会话" disabled>
                <img :src="searchIcon" alt="" />
              </button>
              <button type="button" aria-label="收起侧栏" title="收起侧栏" @click="closeLeftAside">
                <img :src="sidebarToggleIcon" alt="" />
              </button>
            </div>
          </div>
        </template>

        <template #layout-left-aside-actions="{ createConversation }">
          <button class="deepseek-left-actions" type="button" @click="createConversation">
            <img :src="newChatIcon" alt="" />
            <span>开启新对话</span>
          </button>
        </template>

        <template #layout-left-aside-footer>
          <div class="deepseek-left-footer">
            <span class="deepseek-left-footer__avatar" />
            <span>Awake</span>
            <button type="button" aria-label="更多操作" title="更多操作" disabled>···</button>
          </div>
        </template>
      </TrChat>
    </main>
  </div>
</template>

<style scoped>
.deepseek-case {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  --deepseek-history-hover-bg: #f1f3f5;
  --deepseek-history-selected-bg: #e4edfd;
  --deepseek-history-selected-color: #3964fe;
  --deepseek-bubble-user-bg: #edf3fe;
  --deepseek-bubble-user-padding: 10px 16px;
  --deepseek-bubble-user-radius: 22px;
  --tr-chat-ui-left-aside-bg: var(--tr-container-bg-default-2);
  --tr-chat-ui-header-bg: var(--tr-container-bg-default);
  --tr-chat-ui-main-bg: var(--tr-container-bg-default);
  --tr-chat-ui-footer-bg: var(--tr-container-bg-default);
  --tr-bubble-error-bg: color-mix(in srgb, var(--tr-color-error) 8%, var(--tr-container-bg-default));
  --tr-bubble-error-border-radius: 12px;
}

.deepseek-case__chat {
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.deepseek-case__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.deepseek-case__chat :deep(.tr-chat-model-selector) {
  display: none;
}

.deepseek-case__chat :deep(.chat-panel-content--header) {
  position: relative;
  z-index: 10;
  max-width: none;
  height: auto;
  min-height: 0;
  padding: 0;
  overflow: visible;
}

.deepseek-case__chat :deep(.chat-left-aside-logo),
.deepseek-case__chat :deep(.chat-left-aside-rail) {
  display: none;
}

.deepseek-case__chat :deep(.chat-left-aside-panel) {
  padding: 0;
}

.deepseek-case__chat :deep(.chat-left-aside-brand) {
  min-height: 50px;
  padding: 18px 12px 0;
}

.deepseek-left-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.deepseek-left-brand__mark,
.deepseek-left-brand__actions,
.deepseek-left-brand__actions button {
  display: inline-flex;
  align-items: center;
}

.deepseek-left-brand__mark {
  min-width: 0;
  gap: 8px;
}

.deepseek-left-brand__icon {
  width: 27px;
  height: 27px;
}

.deepseek-left-brand__wordmark {
  width: 108px;
  height: auto;
}

.deepseek-left-brand__actions {
  gap: 2px;
}

.deepseek-left-brand__actions button,
.deepseek-left-footer button {
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.deepseek-left-brand__actions button:hover,
.deepseek-left-footer button:hover {
  background: var(--tr-container-bg-hover);
}

.deepseek-left-brand__actions button:disabled,
.deepseek-left-footer button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.deepseek-left-brand__actions button:focus-visible,
.deepseek-left-actions:focus-visible,
.deepseek-left-footer button:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.deepseek-left-brand__actions img {
  width: 16px;
  height: 16px;
}

.deepseek-case__chat :deep(.chat-left-aside-actions) {
  margin-top: 18px;
  padding: 0 12px;
}

.deepseek-left-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 22px;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
  font: inherit;
  cursor: pointer;
}

.deepseek-left-actions img {
  width: 16px;
  height: 16px;
}

.deepseek-case__chat :deep(.chat-left-aside-content) {
  margin-top: 20px;
  padding: 0 12px;
  --tr-history-group-space-y: 14px;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-line-height: 18px;
  --tr-history-group-title-padding: 0 8px 6px;
  --tr-history-group-title-color: var(--tr-text-tertiary);
  --tr-history-item-padding: 7px 8px;
  --tr-history-item-padding-editing: 7px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-hover-bg: var(--deepseek-history-hover-bg);
  --tr-history-item-selected-bg: var(--deepseek-history-selected-bg);
  --tr-history-item-selected-color: var(--deepseek-history-selected-color);
  --tr-history-item-space-y: 2px;
}

.deepseek-case__chat :deep(.chat-left-aside-history) {
  width: 100%;
  min-width: 0;
}

.deepseek-case__chat :deep(.chat-left-aside-footer) {
  margin: 10px 12px 12px;
}

.deepseek-left-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 8px;
  color: var(--tr-text-secondary);
  font-size: 13px;
}

.deepseek-left-footer__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f1d9b2;
}

.deepseek-left-footer button {
  margin-left: auto;
  color: var(--tr-text-secondary);
  font-size: 18px;
}

.deepseek-case__chat :deep(.tr-welcome) {
  box-sizing: border-box;
  width: 100%;
}

.deepseek-case__chat :deep(.tr-welcome__title-wrapper) {
  display: flex;
  margin-bottom: 21px;
  align-items: center;
  justify-content: center;
}

.deepseek-case__chat :deep(.tr-welcome__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.deepseek-case__chat :deep(.tr-welcome__icon img) {
  width: 32px;
  height: 32px;
}

.deepseek-case__chat :deep(.tr-welcome__title) {
  color: var(--tr-text-primary);
  font-size: 24px;
  font-weight: 600;
  line-height: 34px;
}

.deepseek-case__chat :deep(.tr-welcome__description) {
  display: none;
}

.deepseek-case__chat :deep([data-box-type='box'][data-role='user']) {
  --tr-bubble-box-bg: var(--deepseek-bubble-user-bg);
  --tr-bubble-box-padding: var(--deepseek-bubble-user-padding);
  border-radius: var(--deepseek-bubble-user-radius) !important;
}

.deepseek-case__chat :deep([data-box-type='box']:not([data-role='user'])) {
  --tr-bubble-box-bg: transparent;
}
.deepseek-case__chat :deep(.chat-welcome-composer) {
  box-sizing: border-box;
  width: 100%;
  max-width: 776px;
  margin: 0 auto;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state) {
  padding-top: 8px;
}

.deepseek-case__chat :deep(.chat-panel-content--main.is-message-state .tr-chat-messages__bubble-list) {
  box-sizing: border-box;
  width: 100%;
  margin: 0 auto;
  padding: 24px 24px 32px;
  word-break: break-word;
}

@media (max-width: 959px) {
  .deepseek-case__chat :deep(.chat-welcome-composer) {
    max-width: none;
    padding: 0 16px;
  }
}
</style>
