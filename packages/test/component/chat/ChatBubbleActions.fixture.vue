<script setup lang="ts">
import { computed, h, ref } from 'vue'
import ChatMessages from '../../../chat/src/ui/messages/ChatMessages.vue'
import { resolveChatUIOptions } from '../../../chat/src/ui/resolveOptions'
import type { ChatMessageItem } from '../../../chat/src/types'
import { CHAT_ACTION_METADATA_KEY } from '../../../chat/src/runtime/useChatRuntimeFromConversation'

const messages = ref<ChatMessageItem[]>([
  {
    id: 'user-1',
    role: 'user',
    content: 'Original question',
    metadata: { [CHAT_ACTION_METADATA_KEY]: { id: 'user-1' } },
  },
  {
    id: 'assistant-1',
    role: 'assistant',
    content: 'Assistant answer',
    metadata: {
      usage: { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 },
      [CHAT_ACTION_METADATA_KEY]: { id: 'assistant-1', userMessageId: 'user-1' },
    },
  },
])
const userMessages: ChatMessageItem[] = [messages.value[0]!]
const base = resolveChatUIOptions(undefined)
const actions = computed(() => ({
  ...base.bubble,
  bubbleProvider: {
    contentRendererMatches: [
      {
        find: (message: ChatMessageItem) => message.role === 'user',
        renderer: () => h('span', 'Custom display'),
        priority: Number.NEGATIVE_INFINITY,
      },
    ],
  },
  bubbleList: {
    ...base.bubble.bubbleList,
    contentResolver: (message: ChatMessageItem) =>
      message.role === 'user'
        ? [
            { type: 'text', text: 'Original' },
            { type: 'text', text: ' question' },
          ]
        : message.content,
  },
  actions: {
    user: ['copy', 'edit'] as const,
    assistant: ['copy', 'info'] as const,
  },
}))
const infoActions = {
  ...actions.value,
  actions: { user: false as const, assistant: ['info'] as const },
}
const hiddenActions = base.bubble
</script>

<template>
  <main>
    <section data-testid="user-actions">
      <ChatMessages
        :messages="userMessages"
        :scroll-target="null"
        :options="actions"
        :welcome="false"
        :prompts="false"
        :labels="base.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
        :bubble-actions="{ 'user-1': { canEdit: true, canRegenerate: false, turnState: 'completed' } }"
      />
    </section>
    <section data-testid="actions-enabled">
      <ChatMessages
        :messages="messages"
        :scroll-target="null"
        :options="actions"
        :welcome="false"
        :prompts="false"
        :labels="base.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
        :bubble-actions="{ 'user-1': { canEdit: true, canRegenerate: false, turnState: 'completed' } }"
      />
    </section>
    <section data-testid="info-only">
      <ChatMessages
        :messages="messages.slice(1)"
        :scroll-target="null"
        :options="infoActions"
        :welcome="false"
        :prompts="false"
        :labels="base.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </section>
    <section data-testid="actions-hidden">
      <ChatMessages
        :messages="messages"
        :scroll-target="null"
        :options="hiddenActions"
        :welcome="false"
        :prompts="false"
        :labels="base.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </section>
    <output data-testid="original-message">{{ messages[0]?.content }}</output>
  </main>
</template>
