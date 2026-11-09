<script setup lang="ts">
import Bubble from '../../../components/src/bubble/Bubble.vue'
import type { BubbleEvent } from '../../../components/src/bubble/index.type'
import { computed, ref } from 'vue'

const toolCalls = [
  {
    id: 'call-tool-edit-test',
    type: 'function',
    editable: true,
    function: {
      name: 'send_email',
      arguments: JSON.stringify({ to: 'team@example.com', subject: 'Hello' }),
    },
  },
]

const state = {
  toolCall: {
    'call-tool-edit-test': {
      open: true,
    },
  },
}

const nonEditableToolCalls = [
  {
    id: 'call-tool-readonly-test',
    type: 'function',
    function: {
      name: 'read_email',
      arguments: JSON.stringify({ id: 'message-1' }),
    },
  },
]

const nonEditableState = {
  toolCall: {
    'call-tool-readonly-test': {
      open: true,
    },
  },
}

const stringToolCalls = [
  {
    id: 'call-tool-string-test',
    type: 'function',
    editable: true,
    function: {
      name: 'echo',
      arguments: JSON.stringify('hello'),
    },
  },
]

const stringToolState = {
  toolCall: {
    'call-tool-string-test': {
      open: true,
    },
  },
}

const largeNumberToolCalls = [
  {
    id: 'call-tool-large-number-test',
    type: 'function',
    editable: true,
    function: {
      name: 'lookup_record',
      arguments: '{"id":9007199254740993}',
    },
  },
]

const largeNumberToolState = {
  toolCall: {
    'call-tool-large-number-test': {
      open: true,
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
  <Bubble
    data-testid="editing-bubble"
    role="assistant"
    content="请编辑工具参数。"
    :tool_calls="toolCalls"
    :state="state"
    @bubble-event="handleBubbleEvent"
  />
  <Bubble
    data-testid="readonly-bubble"
    role="assistant"
    content="只读工具参数。"
    :tool_calls="nonEditableToolCalls"
    :state="nonEditableState"
  />
  <Bubble
    data-testid="string-editing-bubble"
    role="assistant"
    content="请检查字符串参数。"
    :tool_calls="stringToolCalls"
    :state="stringToolState"
  />
  <Bubble
    data-testid="large-number-editing-bubble"
    role="assistant"
    content="请检查大整数参数。"
    :tool_calls="largeNumberToolCalls"
    :state="largeNumberToolState"
    @bubble-event="handleBubbleEvent"
  />
  <output data-testid="last-event">{{ lastEvent }}</output>
</template>
