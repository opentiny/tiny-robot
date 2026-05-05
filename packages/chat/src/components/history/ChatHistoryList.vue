<script setup lang="ts">
import { syncRef } from '@vueuse/core'
import { computed, ref } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import type { HistoryItem, HistoryMenuItem } from '@opentiny/tiny-robot'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, CHAT_UI_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

const historyState = useRequiredInject(CHAT_HISTORY_KEY, 'history state')
const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const chatUi = useRequiredInject(CHAT_UI_KEY, 'chat ui')
const chatMessages = useResolvedChatMessages()

const filteredHistoryData = computed<HistoryItem[]>(() => {
  const data = chatKit.conversations.value.map((conversation) => ({
    id: conversation.id,
    title: conversation.title || chatMessages.value.history.defaultConversationTitle,
  }))

  if (!historyState.searchQuery.value) {
    return data
  }

  return data.filter((item) => item.title.toLowerCase().includes(historyState.searchQuery.value.toLowerCase()))
})

const historyData = ref<HistoryItem[]>([])
syncRef(filteredHistoryData, historyData, { direction: 'ltr' })

async function handleItemClick(item: HistoryItem) {
  if (historyState.isManagementMode.value) {
    historyState.toggleItemSelection(item.id!)
    return
  }

  try {
    await chatKit.switchConversation(item.id!)

    if (!chatUi.workspace.enabled.value || chatUi.workspace.isMobile.value) {
      chatUi.history.close()
    }
  } catch (error) {
    console.error('[TrChatHistoryList] Failed to switch conversation', error)
  }
}

function handleItemTitleChange(newTitle: string, item: HistoryItem) {
  chatKit.updateConversationTitle(item.id!, newTitle)
}

async function handleItemAction(action: HistoryMenuItem, item: HistoryItem) {
  if (action.id === 'delete') {
    await chatKit.deleteConversation(item.id!)
  }
}

const activeConversationId = computed<string | undefined>(() => chatKit.activeConversationId.value ?? undefined)

function isItemSelected(itemId: string): boolean {
  return historyState.selectedItems.value.includes(itemId)
}
</script>

<template>
  <div class="tr-chat-history-list" :class="{ compressed: historyState.isManagementMode.value }">
    <TrHistory
      :data="historyData"
      :selected="historyState.isManagementMode.value ? undefined : activeConversationId"
      @item-click="handleItemClick"
      @item-title-change="handleItemTitleChange"
      @item-action="handleItemAction"
    >
      <template v-if="historyState.isManagementMode.value" #item-prefix="{ item }">
        <input
          type="checkbox"
          :checked="isItemSelected(item.id!)"
          @change="historyState.toggleItemSelection(item.id!)"
          class="item-checkbox"
          :data-item-id="item.id"
        />
      </template>

      <template #item-title="{ item }">
        <span class="item-title-text">{{ item.title }}</span>
      </template>
    </TrHistory>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s ease;
  padding-right: 8px;

  &.compressed {
    padding-bottom: 10px;
  }

  :deep(.tr-history__item) {
    margin: 8px auto;
    border: 2px solid transparent;

    &:has(input[type='checkbox']:checked) {
      border: 2px solid var(--tr-color-primary);
      background-color: var(--tr-color-primary-light);
    }
  }

  &.compressed :deep(.tr-history__item-actions > .menu) {
    display: none;
  }
}

.item-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--tr-color-primary);
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }
}

.item-title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
