<script setup lang="ts">
import { computed, h } from 'vue'
import TrChat from '../../../chat/src/Chat.vue'
import type { ChatMessageItem, ChatRuntime, ChatUIOptions } from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{ width?: number; height?: number; hoverExpandDelay?: number; messageCount?: number }>(),
  {
    width: 420,
    height: 400,
  },
)
const messages = computed<ChatMessageItem[]>(() =>
  Array.from({ length: 22 }, (_, index) => [
    { id: `user-${index}`, role: 'user', content: `第 ${index + 1} 轮：发布检查需要确认哪些内容？` },
    { id: `assistant-${index}`, role: 'assistant', content: '请检查版本、验证记录、操作手册和回退方案。' },
  ])
    .flat()
    .slice(0, props.messageCount),
)
const runtime: ChatRuntime = {
  conversations: computed(() => [{ id: 'anchor-test', title: '发布检查' }]),
  activeConversation: computed(() => ({
    id: 'anchor-test',
    title: '发布检查',
    messages: messages.value,
    requestState: 'completed' as const,
  })),
  composer: {},
  actions: {
    send: async () => true,
    createConversation() {},
    clearActiveConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  anchor: { hoverExpandDelay: props.hoverExpandDelay },
  bubble: { bubbleList: { roleConfigs: { user: { avatar: h('span', 'U') }, assistant: { avatar: h('span', 'A') } } } },
}
</script>
<template>
  <div data-testid="chat-frame" :style="{ width: `${width}px`, '--tr-layout-height': `${height}px` }">
    <TrChat :ui="ui" :runtime="runtime" />
  </div>
</template>
