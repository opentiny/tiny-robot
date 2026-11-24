<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import TrChat from '../../../chat/src/Chat.vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type {
  ChatBubbleMessageActionPayload,
  ChatMessageItem,
  ChatRuntime,
  ChatRuntimeActionErrorPayload,
  ChatUIData,
  ChatUIOptions,
} from '../../../chat/src/types'

const props = defineProps<{ controlled?: boolean; conversationId?: string; rejectEdit?: boolean }>()
const messages: ChatMessageItem[] = [
  { id: 'u1', role: 'user', content: 'Original question', metadata: { id: 42 } },
  { id: 'a1', role: 'assistant', content: 'Answer' },
]
const capabilities = {
  u1: { canEdit: true, canRegenerate: false, turnState: 'completed' },
  a1: { canEdit: false, canRegenerate: true, turnState: 'completed' },
} as const
const activeId = computed(() => props.conversationId ?? 'first')
const data = computed<ChatUIData>(() => ({
  conversation: { activeId: activeId.value },
  bubble: { messages, actions: capabilities },
}))
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  sender: false,
  bubble: { actions: { display: 'always', user: ['edit'], assistant: ['regenerate'] } },
}
const runtime: ChatRuntime = {
  conversations: shallowRef([]),
  activeConversation: computed(() => ({ id: activeId.value, title: 'Edit test', messages, requestState: 'completed' })),
  composer: {},
  actions: {
    send: async () => true,
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
    getMessageCapabilities: ({ userMessageId }) =>
      capabilities[userMessageId as keyof typeof capabilities] ?? capabilities.u1,
    editMessage: () => {
      const error = new Error('Edit failed')
      if (props.rejectEdit) return Promise.reject(error)
      throw error
    },
    regenerateMessage: () => {
      throw new Error('Regenerate failed')
    },
  },
}
const editPayload = shallowRef<ChatBubbleMessageActionPayload>()
const regeneratePayload = shallowRef<ChatBubbleMessageActionPayload>()
const errorPayload = shallowRef<ChatRuntimeActionErrorPayload>()
</script>

<template>
  <main>
    <TrChatUI
      v-if="controlled"
      :data="data"
      :ui="ui"
      @edit-message="editPayload = $event"
      @regenerate-message="regeneratePayload = $event"
    />
    <TrChat
      v-else
      :runtime="runtime"
      :ui="ui"
      @edit-message="editPayload = $event"
      @regenerate-message="regeneratePayload = $event"
      @runtime-action-error="errorPayload = $event"
    />
    <button v-if="editPayload?.complete" type="button" @click="editPayload.complete(true)">Accept edit</button>
    <output data-testid="edit">{{ editPayload?.messageId }}:{{ editPayload?.text }}</output>
    <output data-testid="regenerate">{{ regeneratePayload?.messageId }}</output>
    <output data-testid="runtime-error">{{ errorPayload?.action }}:{{ String(errorPayload?.error ?? '') }}</output>
  </main>
</template>
