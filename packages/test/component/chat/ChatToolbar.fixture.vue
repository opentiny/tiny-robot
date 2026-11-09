<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatSenderToolbarItem, ChatUIData, ChatUIOptions } from '../../../chat/src/types'

const props = defineProps<{ empty?: boolean; itemDisabled?: boolean; senderDisabled?: boolean }>()
const active = shallowRef(false)

const data = computed<ChatUIData>(() => ({
  sender: { disabled: props.senderDisabled },
  model: { options: [{ id: 'assistant', label: 'Assistant' }], selectedId: 'assistant' },
  mcp: { servers: [] },
}))
const ui = computed<ChatUIOptions>(() => ({
  history: false,
  welcome: false,
  layout: { leftAside: false },
  sender: {
    toolbar(defaults) {
      if (props.empty) return []
      const custom: ChatSenderToolbarItem = {
        type: 'custom',
        id: 'generate-ui',
        label: 'Generate UI',
        active: active.value,
        disabled: props.itemDisabled,
        onClick: () => {
          active.value = !active.value
        },
      }
      return [...defaults.slice().reverse(), custom, ...defaults]
    },
  },
}))
</script>

<template>
  <TrChatUI :data="data" :ui="ui">
    <template #sender-footer><span data-testid="footer">Footer</span></template>
    <template #sender-footer-right><span data-testid="footer-right">Right footer</span></template>
  </TrChatUI>
</template>
