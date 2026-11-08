<script setup lang="ts">
import { defineComponent, h, markRaw, type PropType } from 'vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import ChatMessages from '../../../chat/src/ui/messages/ChatMessages.vue'
import { resolveChatUIOptions } from '../../../chat/src/ui/resolveOptions'
import type { ChatMessageItem } from '../../../chat/src/types'

const resolvedOptions = resolveChatUIOptions(undefined)
const messages: ChatMessageItem[] = [
  {
    id: 'chat-error-message',
    role: 'assistant',
    content: 'Partial chat response',
    state: { error: { message: 'Chat provider failed' } },
  },
]

const CustomErrorRenderer = markRaw(
  defineComponent({
    props: {
      message: {
        type: Object as PropType<BubbleMessage>,
        required: true,
      },
    },
    setup(props) {
      return () =>
        h(
          'div',
          { 'data-testid': 'custom-chat-error' },
          String((props.message.state?.error as { message?: unknown })?.message ?? ''),
        )
    },
  }),
)

const customRendererOptions = {
  ...resolvedOptions.bubble,
  bubbleProvider: {
    errorRenderer: CustomErrorRenderer,
  },
}

const disabledRendererOptions = {
  ...resolvedOptions.bubble,
  bubbleProvider: {
    errorRenderer: null,
  },
}
</script>

<template>
  <main>
    <section data-testid="default-chat-messages">
      <ChatMessages
        :messages="messages"
        :scroll-target="null"
        :options="resolvedOptions.bubble"
        :welcome="false"
        :prompts="false"
        :labels="resolvedOptions.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </section>

    <section data-testid="custom-chat-messages">
      <ChatMessages
        :messages="messages"
        :scroll-target="null"
        :options="customRendererOptions"
        :welcome="false"
        :prompts="false"
        :labels="resolvedOptions.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </section>

    <section data-testid="disabled-chat-messages">
      <ChatMessages
        :messages="messages"
        :scroll-target="null"
        :options="disabledRendererOptions"
        :welcome="false"
        :prompts="false"
        :labels="resolvedOptions.labels"
        :is-empty="false"
        :center-empty-state="false"
        :center-welcome-composer="false"
      />
    </section>
  </main>
</template>
