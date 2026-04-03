<template>
  <div v-if="historyDrawerOpen" class="history-drawer-backdrop" @click="historyDrawerOpen = false"></div>
  <aside class="history-panel" :class="{ 'history-panel--open': historyDrawerOpen }">
    <div class="history-panel__header">
      <h2>历史会话</h2>
      <button class="new-chat-btn" type="button" @click="activeConversationId = null">新会话</button>
    </div>
    <tr-history
      class="history-panel__list"
      :data="historyData"
      :selected="activeConversationId ?? undefined"
      @item-click="handleItemClick"
      @item-title-change="handleItemTitleChange"
      @item-action="handleItemAction"
    ></tr-history>
  </aside>
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { inject, ref, type Ref, watch } from 'vue'
import { useChat } from '../composables/useChat'

type HistoryAction = {
  id: string
}

const { activeConversationId, switchConversation, updateConversationTitle, deleteConversation, conversations } =
  useChat()
const historyDrawerOpen = inject<Ref<boolean>>('historyDrawerOpen', ref(false))

const historyData = ref<Array<{ id: string; title: string }>>([])

watch(
  () => conversations.value.length,
  () => {
    const list = conversations.value
    historyData.value = list.map((item) => ({
      id: item.id,
      title: item.title || 'New Chat',
    }))
  },
  { immediate: true },
)

function handleItemClick(item: { id: string }) {
  switchConversation(item.id)
  historyDrawerOpen.value = false
}

function handleItemTitleChange(newTitle: string, item: { id: string }) {
  // Keep local list writable for TrHistory inline editing.
  const target = historyData.value.find((historyItem) => historyItem.id === item.id)
  if (target) {
    target.title = newTitle
  }
  updateConversationTitle(item.id, newTitle)
}

function handleItemAction(action: HistoryAction, item: { id: string }) {
  if (action.id === 'delete') {
    deleteConversation(item.id)
  }
}
</script>

<style scoped>
.history-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--tr-border-color-disabled);
}

.history-panel__header {
  padding: 12px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-panel__header h2 {
  margin: 0;
  font-size: var(--tr-font-size-md);
}

.new-chat-btn {
  border: none;
  border-radius: 6px;
  background: var(--tr-color-primary);
  color: #fff;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
}

.history-panel__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-space-y: 4px;
}

.history-drawer-backdrop {
  display: none;
}

@media (max-width: 959px) {
  .history-drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: var(--tr-z-index-drawer);
    background: rgba(0, 0, 0, 0.4);
  }

  .history-panel {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(300px, 80vw);
    z-index: calc(var(--tr-z-index-drawer) + 1);
    background: var(--tr-container-bg-default);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .history-panel--open {
    transform: translateX(0);
  }
}
</style>
