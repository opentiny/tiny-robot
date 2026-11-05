<script setup lang="ts">
import { h, markRaw } from 'vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatMessageItem, ChatUIOptions } from '../../../chat/src/types'

const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  sender: false,
  bubble: {
    bubbleProvider: {
      contentRendererMatches: [
        {
          find: (message) => message.id === 'custom',
          renderer: markRaw(() => h('section', 'Custom weather summary')),
        },
      ],
    },
  },
}

const messages: ChatMessageItem[] = [
  {
    id: 'search',
    role: 'assistant',
    content: 'Checking the forecast.',
    reasoning_content: 'Look up the latest weather.',
    tool_calls: [
      { id: 'weather', type: 'function', function: { name: 'get_weather_forecast', arguments: '{}' } },
      { id: 'forecast', type: 'function', function: { name: 'forecast', arguments: '{}' } },
    ],
    state: { open: false, toolCall: { weather: { status: 'success' }, forecast: { status: 'success' } } },
  },
  { id: 'custom', role: 'assistant', content: 'Custom weather summary' },
  { id: 'answer', role: 'assistant', content: 'Cloudy today.' },
]
</script>

<template>
  <main data-testid="chat-bubble-layout">
    <TrChatUI :data="{ bubble: { messages } }" :ui="ui" />
  </main>
</template>
