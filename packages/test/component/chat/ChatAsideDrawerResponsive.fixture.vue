<script setup lang="ts">
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'
import ChatUI from '../../../chat/src/ChatUI.vue'

const data: ChatUIData = { mcp: {} }
const ui: ChatUIOptions = {
  header: false,
  sender: false,
  layout: {
    mobileBreakpoint: 600,
    surface: { mode: 'normal' },
    leftAside: { mode: 'drawer', defaultOpen: false },
    rightAside: { mode: 'drawer' },
  },
}
</script>

<template>
  <ChatUI :data="data" :ui="ui" :default-right-aside-open="true" />
</template>
