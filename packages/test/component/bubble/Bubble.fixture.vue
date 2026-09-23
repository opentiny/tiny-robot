<script setup lang="ts">
import { defineComponent, h, reactive } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import BubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import type { BubbleContentRendererMatch, BubbleMessage, ToolCall } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const avatar = h('span', { 'data-testid': 'bubble-avatar', 'aria-hidden': 'true' }, 'U')
const splitContent: BubbleMessage['content'] = [
  { type: 'text', text: 'First segment' },
  { type: 'text', text: 'Second segment' },
]
const unresolvedContent: BubbleMessage['content'] = [{ type: 'unknown', label: 'Unknown segment' }]

const reasoningMessage = reactive<BubbleMessage>({
  role: 'assistant',
  content: '',
  reasoning_content: '第一段思考',
  state: { thinking: true, open: true },
})

const appendReasoning = () => {
  reasoningMessage.reasoning_content += '\n第二段思考'
}

const finishReasoning = () => {
  reasoningMessage.content = '最终回答'
  reasoningMessage.state = { ...reasoningMessage.state, thinking: false }
}

const toolCalls: ToolCall[] = [
  {
    id: 'tool-1',
    type: 'function',
    function: { name: 'search', arguments: '{}' },
  },
]

const MessageOnlyRenderer = defineComponent({
  props: {
    message: { type: Object, required: true },
    contentIndex: { type: Number, required: true },
  },
  setup() {
    return () => h('div', { 'data-testid': 'message-only-renderer' }, 'Message renderer')
  },
})

const messageOnlyMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => message.state?.messageOnly === true,
    renderer: MessageOnlyRenderer,
  },
]
</script>

<template>
  <main>
    <Bubble
      data-testid="presentation-bubble"
      role="user"
      content="Hello bubble"
      placement="end"
      shape="rounded"
      :avatar="avatar"
    >
      <template #prefix="{ role, messages }">
        <span data-testid="bubble-prefix">{{ role }}:{{ messages.length }}</span>
      </template>
      <template #suffix="{ role, messages }">
        <span data-testid="bubble-suffix">{{ role }}:{{ messages.length }}</span>
      </template>
      <template #after="{ role, messages }">
        <span data-testid="bubble-after">{{ role }}:{{ messages.length }}</span>
      </template>
      <template #content-footer="{ role, messages, contentIndex }">
        <span data-testid="bubble-footer">{{ role }}:{{ messages.length }}:{{ String(contentIndex) }}</span>
      </template>
    </Bubble>

    <Bubble data-testid="empty-bubble" role="assistant" />
    <Bubble data-testid="empty-array-bubble" role="assistant" :content="[]" />
    <Bubble data-testid="empty-split-array-bubble" role="assistant" :content="[]" content-render-mode="split" />
    <Bubble data-testid="hidden-bubble" role="assistant" content="Hidden text" hidden />
    <Bubble data-testid="reasoning-bubble" v-bind="reasoningMessage" />
    <button data-testid="append-reasoning" @click="appendReasoning">Append reasoning</button>
    <button data-testid="finish-reasoning" @click="finishReasoning">Finish reasoning</button>
    <Bubble data-testid="loading-only-bubble" role="assistant" content="" loading />
    <Bubble
      data-testid="tools-only-bubble"
      role="assistant"
      content=""
      :tool_calls="toolCalls"
      :state="{ toolCall: { 'tool-1': { status: 'running' } } }"
    />
    <BubbleProvider :content-renderer-matches="messageOnlyMatches">
      <Bubble data-testid="message-only-bubble" role="assistant" content="" :state="{ messageOnly: true }" />
      <Bubble
        data-testid="empty-array-message-only-bubble"
        role="assistant"
        :content="[]"
        content-render-mode="split"
        :state="{ messageOnly: true }"
      />
    </BubbleProvider>
    <Bubble
      data-testid="content-error-bubble"
      id="content-error"
      role="assistant"
      content="Partial answer"
      :state="{ error: { message: 'Provider failed' } }"
    />
    <Bubble
      data-testid="error-only-bubble"
      id="error-only"
      role="assistant"
      content=""
      :state="{ error: { message: 'Only failure' } }"
    />
    <Bubble data-testid="false-error-bubble" role="assistant" content="" :state="{ error: false }" />
    <Bubble data-testid="zero-error-bubble" role="assistant" content="" :state="{ error: 0 }" />
    <Bubble data-testid="empty-error-bubble" role="assistant" content="" :state="{ error: '' }" />
    <Bubble data-testid="null-error-bubble" role="assistant" content="" :state="{ error: null }" />
    <Bubble data-testid="undefined-error-bubble" role="assistant" content="" :state="{ error: undefined }" />

    <Bubble
      data-testid="split-bubble"
      role="assistant"
      :content="splitContent"
      :state="{ error: { message: 'Split failed' } }"
      content-render-mode="split"
    >
      <template #content-footer="{ contentIndex }">
        <span data-testid="split-footer">footer-{{ contentIndex }}</span>
      </template>
    </Bubble>

    <Bubble
      data-testid="resolved-bubble"
      role="assistant"
      content="Original content"
      :content-resolver="() => 'Resolved content'"
    />

    <BubbleProvider>
      <Bubble
        data-testid="fallback-bubble"
        role="assistant"
        :content="unresolvedContent"
        :fallback-content-renderer="FallbackContentRenderer"
      />
    </BubbleProvider>
  </main>
</template>
