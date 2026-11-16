<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import TrChat from '../../../chat/src/Chat.vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatBubbleActionSlotProps, ChatRuntime, ChatUIData, ChatUIOptions } from '../../../chat/src/types'

const props = defineProps<{ standalone?: boolean; disabled?: boolean }>()
const open = shallowRef(false)
const source = shallowRef('')
function toggleSource({ context, setOpen }: ChatBubbleActionSlotProps) {
  open.value = !open.value
  setOpen(open.value)
  source.value = String(context.message.metadata?.source)
}
const messages = [{ role: 'assistant', content: 'Answer', metadata: { source: 'Guide' } }]
const data: ChatUIData = { bubble: { messages } }
const runtime: ChatRuntime = {
  conversations: shallowRef([]),
  activeConversation: shallowRef({ id: 'slot-test', title: 'Slot test', messages, requestState: 'completed' }),
  composer: {},
  actions: {
    send: async () => true,
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
const ui = computed<ChatUIOptions>(() => ({
  layout: { leftAside: false, rightAside: false },
  sender: false,
  bubble: {
    actions: {
      display: 'always',
      assistant: [{ type: 'slot', id: 'source', disabled: props.disabled }],
    },
  },
}))
</script>

<template>
  <component :is="standalone ? TrChatUI : TrChat" v-bind="standalone ? { data } : { runtime }" :ui="ui">
    <template #bubble-action="scope">
      <button v-if="scope.item.id === 'source'" type="button" :disabled="scope.disabled" @click="toggleSource(scope)">
        {{ open ? 'Close source' : 'View source' }}
      </button>
      <p v-if="open" role="status">{{ source }}</p>
    </template>
  </component>
</template>
