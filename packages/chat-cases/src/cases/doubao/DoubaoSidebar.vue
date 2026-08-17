<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrHistory, type HistoryMenuItem } from '@opentiny/tiny-robot'
import type { ChatConversationInfo, ChatConversationView } from '@opentiny/tiny-robot-chat'
import squarePenIcon from './icons/square-pen.svg'
import { doubaoNavigation } from './config'

type HistoryDisplayItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

const props = defineProps<{
  variant: 'fixed' | 'floating'
  conversation: ChatConversationView
}>()

const emit = defineEmits<{
  createConversation: []
  navigationChange: [item: string]
  conversationSelect: [id: string]
  conversationTitleChange: [title: string, id: string]
  conversationAction: [action: HistoryMenuItem, id: string]
}>()

const navigationItems = [
  { id: doubaoNavigation.work, label: '新工作任务', icon: squarePenIcon },
  { id: doubaoNavigation.chat, label: '新对话', icon: squarePenIcon },
]

const historyItemCache = new Map<string, HistoryDisplayItem>()
const historyItems = ref<HistoryDisplayItem[]>([])

watch(
  () => props.conversation.items,
  (conversationItems) => {
    const activeIds = new Set<string>()
    const items = (conversationItems ?? []).map((item) => {
      activeIds.add(item.id)
      return syncHistoryItem(item)
    })

    for (const id of historyItemCache.keys()) {
      if (!activeIds.has(id)) {
        historyItemCache.delete(id)
      }
    }

    historyItems.value = items
  },
  { immediate: true, deep: true },
)

function syncHistoryItem(item: ChatConversationInfo) {
  const cached = historyItemCache.get(item.id)
  const nextItem = cached ?? ({ id: item.id, title: item.title || '新对话', raw: item } as HistoryDisplayItem)

  for (const key of Object.keys(nextItem)) {
    if (key !== 'raw' && !(key in item)) {
      delete nextItem[key]
    }
  }

  Object.assign(nextItem, item, {
    id: item.id,
    title: item.title || '新对话',
    raw: item,
  })
  historyItemCache.set(item.id, nextItem)

  return nextItem
}

function handleNavigationChange(item: string) {
  emit('navigationChange', item)

  if (item === doubaoNavigation.chat) {
    emit('createConversation')
  }
}

function handleConversationSelect(item: HistoryDisplayItem) {
  emit('conversationSelect', item.raw.id)
}

function handleConversationTitleChange(title: string, item: HistoryDisplayItem) {
  emit('conversationTitleChange', title, item.raw.id)
}

function handleConversationAction(action: HistoryMenuItem, item: HistoryDisplayItem) {
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
    <div class="doubao-sidebar__brand">豆包</div>

    <nav class="doubao-sidebar__navigation" aria-label="主导航">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="doubao-sidebar__nav-item"
        type="button"
        @click="handleNavigationChange(item.id)"
      >
        <img class="doubao-sidebar__nav-icon" :src="item.icon" alt="" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <section class="doubao-sidebar__recent" aria-label="最近会话">
      <div class="doubao-sidebar__recent-title">最近</div>
      <TrHistory
        class="doubao-sidebar__history"
        :data="historyItems"
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
  color: #1f2329;
  background: #fafafa;
}

.doubao-sidebar--fixed {
  width: 100%;
  height: 100%;
}

.doubao-sidebar--floating {
  height: 708px;
  border: 1px solid #e5e6eb;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgb(31 35 41 / 12%);
}

.doubao-sidebar__history {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  --tr-history-item-padding: 6px 8px;
  --tr-history-item-padding-editing: 6px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-hover-bg: #f2f3f5;
  --tr-history-item-selected-bg: #e8f3ff;
  --tr-history-item-space-y: 2px;
}

.doubao-sidebar__brand {
  height: 28px;
  color: #1f2329;
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
  color: #1f2329;
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.doubao-sidebar__nav-item:hover {
  color: #3370ff;
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

.doubao-sidebar__recent-title {
  flex-shrink: 0;
  margin-bottom: 8px;
  color: #8f959e;
  font-size: 12px;
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
