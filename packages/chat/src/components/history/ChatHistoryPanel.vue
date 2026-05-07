<script setup lang="ts">
import { computed } from 'vue'
import { IconClose, IconDelete } from '@opentiny/tiny-robot-svgs'
import { CHAT_HISTORY_KEY, CHAT_KIT_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

const historyState = useRequiredInject(CHAT_HISTORY_KEY, 'history state')
const chatKit = useRequiredInject(CHAT_KIT_KEY, 'chat kit')
const chatMessages = useResolvedChatMessages()

const selectedCount = computed(() => historyState.selectedItems.value.length)
const allConversationIds = computed(() => chatKit.conversations.value.map((conversation) => conversation.id))
const isAllSelected = computed(
  () => allConversationIds.value.length > 0 && selectedCount.value === allConversationIds.value.length,
)

async function handleBatchDelete() {
  if (selectedCount.value === 0) {
    return
  }

  await Promise.all(historyState.selectedItems.value.map((itemId) => chatKit.deleteConversation(itemId)))
  historyState.clearSelection()
}

function handleToggleSelectAll() {
  if (isAllSelected.value) {
    historyState.clearSelection()
  } else {
    historyState.selectAll(allConversationIds.value)
  }
}

function handleClosePanel() {
  historyState.isManagementMode.value = false
  historyState.clearSelection()
}
</script>

<template>
  <Transition name="tr-slide-up">
    <div v-if="historyState.isManagementMode.value" class="tr-chat-history-panel">
      <div class="panel-left">
        <input type="checkbox" :checked="isAllSelected" @change="handleToggleSelectAll" class="select-all-checkbox" />
        <span class="selected-count">{{ selectedCount }}</span>
      </div>

      <div class="panel-right">
        <button
          class="delete-icon-btn"
          :disabled="selectedCount === 0"
          @click="handleBatchDelete"
          :title="chatMessages.history.deleteSelected"
        >
          <IconDelete />
        </button>

        <div class="divider"></div>

        <button class="close-icon-btn" @click="handleClosePanel" :title="chatMessages.history.cancel">
          <IconClose />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-chat-history-panel {
  position: sticky;
  bottom: 10px;
  width: calc(100% - 20px);
  margin: 0 10px;
  background: var(--tr-container-bg-default);
  border: 1px solid var(--tr-border-color-default);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--chat-history-panel-shadow);
  z-index: 100;

  &.tr-slide-up-enter-active,
  &.tr-slide-up-leave-active {
    transition: transform 0.3s ease;
  }

  &.tr-slide-up-enter-from,
  &.tr-slide-up-leave-to {
    transform: translateY(100%);
  }
}

.panel-left {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.select-all-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--tr-color-primary);

  &:hover {
    opacity: 0.8;
  }
}

.selected-count {
  min-width: 18px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  background: var(--tr-color-primary);
  color: white;
  border-radius: 80%;
  font-weight: 600;
  font-size: 14px;
}

.panel-right {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}

.delete-icon-btn,
.close-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--tr-icon-color-default);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--tr-container-bg-hover);
    color: var(--tr-icon-color-hover);
  }
}

.delete-icon-btn {
  &:hover:not(:disabled) {
    background: var(--chat-danger-soft-bg);
    color: var(--chat-danger-text);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--tr-border-color-default);
  flex-shrink: 0;
}
</style>
