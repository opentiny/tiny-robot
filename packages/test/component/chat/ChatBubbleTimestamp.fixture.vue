<script setup lang="ts">
import { computed } from 'vue'
import ChatMessages from '../../../chat/src/ui/messages/ChatMessages.vue'
import { resolveChatUIOptions } from '../../../chat/src/ui/resolveOptions'
import type { ChatBubbleActionsOptions, ChatMessageItem } from '../../../chat/src/types'

const props = defineProps<{
  message: ChatMessageItem
  actions: false | ChatBubbleActionsOptions
  customFormat?: boolean
  throwFormat?: boolean
  historical?: boolean
}>()
const options = computed(() =>
  resolveChatUIOptions({
    bubble: {
      actions: props.actions && {
        ...props.actions,
        ...((props.customFormat || props.throwFormat) && {
          timestamp: {
            format: (timestamp, { message }) => {
              if (props.throwFormat) throw new Error('formatter failed')
              return `${message.id}: ${timestamp}`
            },
          },
        }),
      },
    },
  }),
)
const messages = computed<ChatMessageItem[]>(() => [
  props.message,
  ...(props.historical ? [{ id: 'next-user', role: 'user', content: 'Next question' }] : []),
])
</script>

<template>
  <div style="padding: 32px">
    <ChatMessages
      :messages="messages"
      :scroll-target="null"
      :options="options.bubble"
      :welcome="false"
      :prompts="false"
      :labels="options.labels"
      :is-empty="false"
      :center-empty-state="false"
      :center-welcome-composer="false"
    >
      <template #bubble-action="{ item }">
        <button type="button" :data-action="item.id">{{ item.id }}</button>
      </template>
    </ChatMessages>
  </div>
</template>
