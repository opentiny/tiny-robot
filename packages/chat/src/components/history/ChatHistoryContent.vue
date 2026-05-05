<script setup lang="ts">
import ChatHistoryList from './ChatHistoryList.vue'
import ChatHistoryNewSession from './ChatHistoryNewSession.vue'
import ChatHistoryPanel from './ChatHistoryPanel.vue'
import ChatHistoryToolbar from './ChatHistoryToolbar.vue'

defineOptions({ name: 'TrChatHistoryContent' })
</script>

<template>
  <ChatHistoryNewSession />
  <ChatHistoryToolbar />
  <ChatHistoryList />
  <ChatHistoryPanel />
</template>
