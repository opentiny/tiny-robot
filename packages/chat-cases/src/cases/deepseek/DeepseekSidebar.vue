<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TrHistory, type HistoryGroup, type HistoryItem, type HistoryMenuItem } from '@opentiny/tiny-robot'
import { IconMore } from '@opentiny/tiny-robot-svgs'
import type { ChatConversationInfo, ChatConversationView } from '@opentiny/tiny-robot-chat'
import deepseekMark from './icons/deepseek-mark.svg'
import deepseekWordmark from './icons/deepseek-wordmark.svg'
import newChatIcon from './icons/new-chat.svg'
import searchIcon from './icons/search.svg'
import sidebarToggleIcon from './icons/sidebar-toggle.svg'

type HistoryDisplayItem = ChatConversationInfo & {
  raw: ChatConversationInfo
}

const props = defineProps<{
  conversation: ChatConversationView
}>()

const emit = defineEmits<{
  createConversation: []
  close: []
  conversationSelect: [id: string]
  conversationTitleChange: [title: string, id: string]
  conversationAction: [action: HistoryMenuItem, id: string]
}>()

const historyItemCache = new Map<string, HistoryDisplayItem>()
const historyItems = ref<HistoryDisplayItem[]>([])
const groups = ['置顶', '昨天', '30天内'] as const

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

const groupedHistory = computed(() => {
  const grouped = new Map<string, HistoryDisplayItem[]>()

  for (const group of groups) {
    grouped.set(group, [])
  }

  for (const item of historyItems.value) {
    const group = typeof item.metadata?.group === 'string' ? item.metadata.group : '30天内'
    grouped.set(group, [...(grouped.get(group) ?? []), item])
  }

  return [...grouped.entries()]
    .filter(([, items]) => items.length > 0)
    .map(([group, items]) => ({ group, items })) as HistoryGroup<HistoryDisplayItem>[]
})

function syncHistoryItem(item: ChatConversationInfo) {
  const cached = historyItemCache.get(item.id)
  const nextItem = cached ?? ({ id: item.id, title: item.title || '新对话', raw: item } as HistoryDisplayItem)

  Object.assign(nextItem, item, {
    id: item.id,
    title: item.title || '新对话',
    raw: item,
  })
  historyItemCache.set(item.id, nextItem)

  return nextItem
}

function handleConversationSelect(item: HistoryItem) {
  emit('conversationSelect', (item as HistoryDisplayItem).raw.id)
}

function handleConversationTitleChange(title: string, item: HistoryItem) {
  emit('conversationTitleChange', title, (item as HistoryDisplayItem).raw.id)
}

function handleConversationAction(action: HistoryMenuItem, item: HistoryItem) {
  emit('conversationAction', action, (item as HistoryDisplayItem).raw.id)
}
</script>

<template>
  <aside class="deepseek-sidebar">
    <header class="deepseek-sidebar__brand">
      <div class="deepseek-sidebar__brand-mark">
        <img class="deepseek-sidebar__mark" :src="deepseekMark" alt="" />
        <img class="deepseek-sidebar__wordmark" :src="deepseekWordmark" alt="DeepSeek" />
      </div>
      <div class="deepseek-sidebar__brand-actions">
        <button class="deepseek-sidebar__icon-button" type="button" aria-label="搜索会话" title="搜索会话">
          <img class="deepseek-sidebar__asset-icon" :src="searchIcon" alt="" />
        </button>
        <button
          class="deepseek-sidebar__icon-button"
          type="button"
          aria-label="收起侧栏"
          title="收起侧栏"
          @click="emit('close')"
        >
          <img class="deepseek-sidebar__asset-icon" :src="sidebarToggleIcon" alt="" />
        </button>
      </div>
    </header>

    <div class="deepseek-sidebar__actions">
      <button class="deepseek-sidebar__new" type="button" @click="emit('createConversation')">
        <img class="deepseek-sidebar__asset-icon" :src="newChatIcon" alt="" />
        <span>开启新对话</span>
      </button>
    </div>

    <section class="deepseek-sidebar__history" aria-label="会话列表">
      <TrHistory
        :data="groupedHistory"
        :selected="props.conversation.activeId ?? undefined"
        @item-click="handleConversationSelect"
        @item-title-change="handleConversationTitleChange"
        @item-action="handleConversationAction"
      />
    </section>

    <footer class="deepseek-sidebar__awake">
      <span class="deepseek-sidebar__awake-avatar" />
      <span>Awake</span>
      <button class="deepseek-sidebar__awake-more" type="button" aria-label="更多操作" title="更多操作">
        <IconMore :size="18" />
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.deepseek-sidebar {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 18px 12px 12px;
  color: #262626;
  background: #f7f8fa;
}

.deepseek-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

.deepseek-sidebar__brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.deepseek-sidebar__mark {
  width: 27px;
  height: 27px;
}

.deepseek-sidebar__wordmark {
  width: 108px;
  height: auto;
}

.deepseek-sidebar__icon-button,
.deepseek-sidebar__new {
  display: inline-flex;
  align-items: center;
  border: 0;
  font: inherit;
  cursor: pointer;
}

.deepseek-sidebar__icon-button {
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  color: #7b7f87;
  background: transparent;
}

.deepseek-sidebar__icon-button:hover {
  color: #4d6bfe;
  background: #eceef2;
}

.deepseek-sidebar__asset-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex: none;
}

.deepseek-sidebar__brand-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.deepseek-sidebar__actions {
  display: flex;
  margin-top: 18px;
}

.deepseek-sidebar__new {
  justify-content: center;
  gap: 9px;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e3e6eb;
  border-radius: 22px;
  color: #262626;
  background: #fff;
  font-size: 14px;
  box-shadow: 0 1px 2px rgb(31 35 41 / 6%);
}

.deepseek-sidebar__new:hover {
  border-color: #cbd3e8;
  background: #fff;
}

.deepseek-sidebar__history {
  width: 100%;
  max-width: 100%;
  min-height: 0;
  flex: 1;
  margin-top: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  --tr-history-group-space-y: 14px;
  --tr-history-group-title-font-size: 12px;
  --tr-history-group-title-line-height: 18px;
  --tr-history-group-title-padding: 0 8px 6px;
  --tr-history-group-title-color: #9297a1;
  --tr-history-item-padding: 7px 8px;
  --tr-history-item-padding-editing: 7px 8px;
  --tr-history-item-border-radius: 8px;
  --tr-history-item-hover-bg: #eceef2;
  --tr-history-item-selected-bg: #e4eaff;
  --tr-history-item-selected-color: #263d9e;
  --tr-history-item-space-y: 2px;
}

.deepseek-sidebar__history :deep(.tr-history) {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.deepseek-sidebar__history :deep(.tr-history__group-title) {
  display: flex;
  align-items: center;
  min-width: 0;
}

.deepseek-sidebar__history :deep(.tr-history__group-title::after) {
  width: 1px;
  height: 18px;
  margin-left: auto;
  background: #dfe2e8;
  content: '';
}

.deepseek-sidebar__history :deep(.tr-history__item) {
  min-width: 0;
}

.deepseek-sidebar__history :deep(.tr-history__item > .text) {
  min-width: 0;
}

.deepseek-sidebar__awake {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 38px;
  margin-top: 10px;
  padding: 0 8px;
  color: #6f747d;
  font-size: 13px;
}

.deepseek-sidebar__awake-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #6e7c98;
  background: #f1d9b2;
}

.deepseek-sidebar__awake-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 7px;
  color: #8b9098;
  background: transparent;
  cursor: pointer;
}

.deepseek-sidebar__awake-more:hover {
  background: #eceef2;
}
</style>
