<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import TrChat from '../../../chat/src/Chat.vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatRequestState, ChatRuntime } from '../../../chat/src/types'

const props = defineProps<{
  mode: 'single' | 'multiple'
  withoutAbort?: boolean
  delayedAbort?: boolean
  placeholder?: string
  standalone?: boolean
  requestState?: ChatRequestState
  omitRequest?: boolean
}>()
const state = shallowRef<ChatRequestState>('paused')
const aborts = shallowRef(0)
const sends = shallowRef(0)
let finishAbort: (() => void) | undefined
const ui = computed(() => ({
  layout: { leftAside: false as const, rightAside: false as const },
  sender: { mode: props.mode, toolbar: [], placeholder: props.placeholder },
}))
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
    abort: props.withoutAbort
      ? undefined
      : async () => {
          aborts.value++
          if (props.delayedAbort)
            await new Promise<void>((resolve) => {
              finishAbort = resolve
            })
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
    <button v-if="props.delayedAbort" data-testid="finish-abort" @click="finishAbort?.()">Finish cleanup</button>
    <TrChatUI
      v-if="props.standalone"
      :data="{
        sender: { loading: true },
        request: props.omitRequest ? undefined : { state: props.requestState ?? 'paused' },
      }"
      :ui="ui"
    />
    <TrChat v-else :runtime="runtime" :ui="ui" />
  </div>
</template>
