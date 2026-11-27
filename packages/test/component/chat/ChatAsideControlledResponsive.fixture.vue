<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'
import ChatUI from '../../../chat/src/ChatUI.vue'

const data: ChatUIData = { mcp: {} }
const mobileBreakpoint = ref(600)
const rightAsideOpen = ref(true)
const rightAsideOpenChangeCount = ref(0)
const ui = computed<ChatUIOptions>(() => ({
  header: false,
  sender: false,
  layout: {
    mobileBreakpoint: mobileBreakpoint.value,
    surface: { mode: 'normal' },
    leftAside: { mode: 'drawer', defaultOpen: false },
    rightAside: { mode: 'drawer' },
  },
}))

function updateBreakpointAndCloseAside() {
  mobileBreakpoint.value = 800
  rightAsideOpen.value = false
}
</script>

<template>
  <button data-testid="update-breakpoint-and-close-aside" type="button" @click="updateBreakpointAndCloseAside">
    Update breakpoint and close aside
  </button>
  <output data-testid="right-aside-open-change-count">{{ rightAsideOpenChangeCount }}</output>
  <ChatUI
    :data="data"
    :ui="ui"
    :right-aside-open="rightAsideOpen"
    @update:right-aside-open="rightAsideOpen = $event"
    @right-aside-open-change="rightAsideOpenChangeCount++"
  />
</template>
