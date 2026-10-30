<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import TrChat from '../../../chat/src/Chat.vue'
import type { ChatRequestState, ChatRuntime } from '../../../chat/src/types'

const props = defineProps<{ mode: 'single' | 'multiple' }>()
const state = shallowRef<ChatRequestState>('paused')
const aborts = shallowRef(0)
const sends = shallowRef(0)
const runtime: ChatRuntime = {
  conversations: shallowRef([{ id: 'turn', title: 'Tool approval' }]),
  activeConversation: computed(() => ({
    id: 'turn',
    title: 'Tool approval',
    messages: [],
    requestState: state.value,
  })),
  composer: {
    submitDisabled: computed(() => state.value === 'processing' || state.value === 'paused'),
  },
  actions: {
    send: async () => {
      sends.value++
      state.value = 'completed'
      return true
    },
    abort: () => {
      aborts.value++
      state.value = 'aborted'
    },
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
</script>

<template>
  <div>
    <output data-testid="request-state">{{ state }}</output>
    <output data-testid="aborts">{{ aborts }}</output>
    <output data-testid="sends">{{ sends }}</output>
    <TrChat
      :runtime="runtime"
      :ui="{ layout: { leftAside: false, rightAside: false }, sender: { mode: props.mode, toolbar: [] } }"
    />
  </div>
</template>
