<script setup lang="ts">
import { CHAT_HISTORY_KEY, useRequiredInject } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'

defineOptions({ name: 'TrChatHistorySearch' })

const historyState = useRequiredInject(CHAT_HISTORY_KEY, 'history state')
const chatMessages = useResolvedChatMessages()
</script>

<template>
  <div class="tr-chat-history-search">
    <input
      v-model="historyState.searchQuery.value"
      type="text"
      :placeholder="chatMessages.history.searchPlaceholder"
      class="search-input"
    />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-search {
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--chat-history-search-border);
  border-radius: 12px;
  font-size: 14px;
  color: var(--chat-history-search-text);
  background: var(--chat-history-search-bg);
  box-shadow: var(--chat-history-search-shadow);
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--chat-history-search-placeholder);
  }

  &:focus {
    background: var(--chat-history-search-bg-focus);
    border-color: var(--chat-history-search-border-focus);
    box-shadow: 0 0 0 3px var(--chat-history-search-focus-ring);
  }
}
</style>
