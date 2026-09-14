<script setup lang="ts">
import { TrHistory, type HistoryMenuItem } from '@opentiny/tiny-robot'
import {
  useChatHistoryData,
  type ChatHistoryItem,
  type ChatConversationInfo,
  type ChatConversationView,
  type ChatHistoryData,
} from '@opentiny/tiny-robot-chat'
import squarePenIcon from './icons/square-pen.svg'
import { douBaoNavigation } from './config'

const props = defineProps<{
  variant: 'fixed' | 'floating'
  conversation: ChatConversationView
  historyData: ChatHistoryData
  activeNavigation: string
}>()

const emit = defineEmits<{
  createConversation: []
  navigationChange: [item: string]
  conversationSelect: [id: string]
  conversationTitleChange: [title: string, id: string]
  conversationAction: [action: HistoryMenuItem, id: string]
}>()

const navigationItems = [
  { id: douBaoNavigation.work, label: '新工作任务', icon: squarePenIcon },
  { id: douBaoNavigation.chat, label: '新对话', icon: squarePenIcon },
]

const historyItems = useChatHistoryData({
  conversations: () => props.conversation.items,
  history: () => props.historyData,
  defaultTitle: '新对话',
})

function handleNavigationChange(item: string) {
  emit('navigationChange', item)

  if (item === douBaoNavigation.chat) {
    emit('createConversation')
  }
}

function handleConversationSelect(item: ChatHistoryItem) {
  emit('conversationSelect', item.raw.id)
}

function handleConversationTitleChange(title: string, item: ChatHistoryItem) {
  emit('conversationTitleChange', title, item.raw.id)
}

function handleConversationAction(action: HistoryMenuItem, item: ChatHistoryItem) {
  emit('conversationAction', action, item.raw.id)
}

function getAvatarColor(item: ChatConversationInfo) {
  const color = item.metadata?.color

  if (color === 'green' || color === 'pink') {
    return color
  }

  return item.id.charCodeAt(0) % 2 === 0 ? 'green' : 'pink'
}
</script>

<template>
  <aside class="doubao-sidebar" :class="`doubao-sidebar--${variant}`">
    <div class="doubao-sidebar__brand">DouBao</div>

    <nav class="doubao-sidebar__navigation" aria-label="主导航">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="doubao-sidebar__nav-item"
        :class="{ 'is-active': props.activeNavigation === item.id }"
        type="button"
        :aria-pressed="props.activeNavigation === item.id"
        @click="handleNavigationChange(item.id)"
      >
        <img class="doubao-sidebar__nav-icon" :src="item.icon" alt="" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <section class="doubao-sidebar__recent" aria-label="最近会话">
      <!-- @vue-generic {ChatHistoryItem} -->
      <TrHistory
        class="doubao-sidebar__history"
        :data="historyItems as never"
        :selected="props.conversation.activeId ?? undefined"
        @item-click="handleConversationSelect"
        @item-title-change="handleConversationTitleChange"
        @item-action="handleConversationAction"
      >
        <template #item-prefix="{ item }">
          <span
            class="doubao-sidebar__avatar"
            :class="`doubao-sidebar__avatar--${getAvatarColor(item)}`"
            aria-hidden="true"
          >
            <span></span>
          </span>
        </template>
      </TrHistory>
    </section>
  </aside>
</template>

<style scoped>
.doubao-sidebar {
  box-sizing: border-box;
  width: 280px;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default-2);
}

.doubao-sidebar--fixed {
  width: 100%;
  height: 100%;
}

.doubao-sidebar--floating {
  height: 100%;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 16px;
  box-shadow: var(--tr-layout-floating-shadow, var(--tr-shadow-sm));
}

.doubao-sidebar__history {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  --tr-history-item-padding: 6px 8px;
  --tr-history-item-padding-editing: 6px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-hover-bg: var(--tr-container-bg-hover);
  --tr-history-item-selected-bg: var(--tr-color-primary-light);
  --tr-history-item-space-y: 2px;
}

.doubao-sidebar__brand {
  height: 28px;
  color: var(--tr-text-primary);
  font-size: 17px;
  line-height: 28px;
}

.doubao-sidebar__navigation {
  flex-shrink: 0;
  display: grid;
  gap: 4px;
  margin-top: 22px;
}

.doubao-sidebar__nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 4px 0;
  border: 0;
  color: var(--tr-text-primary);
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.doubao-sidebar__nav-item:hover {
  color: var(--tr-color-primary);
}

.doubao-sidebar__nav-item:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.doubao-sidebar__nav-item.is-active {
  color: var(--tr-color-primary);
}

.doubao-sidebar__nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.doubao-sidebar__recent {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-top: 22px;
}

.doubao-sidebar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.doubao-sidebar__avatar--pink {
  color: #f3a8bb;
  background: #fff1f5;
}

.doubao-sidebar__avatar--green {
  color: #a9d96d;
  background: #f3fbe9;
}

.doubao-sidebar__avatar span {
  width: 8px;
  height: 5px;
  border: 1px solid currentColor;
  border-radius: 50%;
}
</style>
