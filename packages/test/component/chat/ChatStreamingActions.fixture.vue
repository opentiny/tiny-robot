<script setup lang="ts">
import { computed, ref } from 'vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatMessageItem, ChatRequestView, ChatUIData, ChatUIOptions } from '../../../chat/src/types'

const messages = ref<ChatMessageItem[]>([
  { id: 'assistant-streaming', role: 'assistant', content: 'Partial answer', streamState: 'streaming' },
])
const request = ref<ChatRequestView>({ state: 'processing' })
const status = computed(() => request.value.state)
const data = computed<ChatUIData>(() => ({
  conversation: { activeId: 'streaming-conversation' },
  bubble: { messages: messages.value },
  request: request.value,
}))
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  sender: false,
  bubble: { actions: { display: 'always', assistant: ['copy'] } },
}

function finishResponse() {
  messages.value[0]!.streamState = 'finished'
  request.value = { state: 'completed' }
}
</script>

<template>
  <main>
    <TrChatUI :data="data" :ui="ui" />
    <output data-testid="request-state">{{ status }}</output>
    <button type="button" @click="finishResponse">Finish response</button>
  </main>
</template>
