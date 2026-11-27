<script setup lang="ts">
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'
import ChatUI from '../../../chat/src/ChatUI.vue'

const data: ChatUIData = { mcp: {} }
const ui: ChatUIOptions = {
  header: false,
  sender: false,
  layout: {
    mobileBreakpoint: 600,
    surface: {
      mode: 'floating',
      floatingOptions: { minWidth: 360, maxWidth: 900 },
    },
    leftAside: { width: 280, collapsedWidth: 48, defaultOpen: false },
    rightAside: { width: 320 },
  },
}

const floatingState = {
  placement: 'top-left',
  offsetX: 16,
  offsetY: 16,
  width: 900,
  height: 700,
} as const
</script>

<template>
  <ChatUI :data="data" :ui="ui" :floating-state="floatingState" :default-right-aside-open="true" />
</template>
