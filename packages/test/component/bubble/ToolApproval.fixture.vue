<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleEvent } from '../../../components/src/bubble/index.type'
import { computed, ref } from 'vue'

const toolCalls = [
  {
    id: 'call-tool-approval-test',
    type: 'function',
    function: {
      name: 'send_email',
      arguments: JSON.stringify({ to: 'team@example.com' }),
    },
  },
]

const approvalState = {
  toolCall: {
    'call-tool-approval-test': {
      status: 'awaiting-approval',
      open: false,
    },
  },
}

const completedState = {
  toolCall: {
    'call-tool-approval-test': {
      status: 'success',
      open: false,
    },
  },
}

const events = ref<BubbleEvent[]>([])
const lastEvent = computed(() => JSON.stringify(events.value.at(-1) ?? null))

const handleBubbleEvent = (event: BubbleEvent) => {
  events.value.push(event)
}
</script>

<template>
  <main>
    <Bubble
      data-testid="approval-bubble"
      role="assistant"
      content="请确认发送邮件。"
      :tool_calls="toolCalls"
      :state="approvalState"
      @bubble-event="handleBubbleEvent"
    />
    <Bubble
      data-testid="completed-bubble"
      role="assistant"
      content="邮件已发送。"
      :tool_calls="toolCalls"
      :state="completedState"
    />
    <output data-testid="last-event">{{ lastEvent }}</output>
  </main>
</template>
