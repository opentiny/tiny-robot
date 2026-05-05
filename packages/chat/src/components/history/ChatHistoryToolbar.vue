<script setup lang="ts">
import ChatHistoryManageButton from './ChatHistoryManageButton.vue'
import ChatHistorySearch from './ChatHistorySearch.vue'

defineOptions({ name: 'TrChatHistoryToolbar' })
</script>

<template>
  <div class="tr-chat-history-toolbar">
    <ChatHistorySearch />
    <ChatHistoryManageButton />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-history-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 10px;
  flex-shrink: 0;

  :deep(.tr-chat-history-search) {
    flex: 1;
    min-width: 0;
    padding: 0;
  }
}
</style>
