<script setup lang="ts">
import { h } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import BubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import type { BubbleMessage } from '../../../components/src/bubble/index.type'
import FallbackContentRenderer from './FallbackContentRenderer.vue'

const avatar = h('span', { 'data-testid': 'bubble-avatar', 'aria-hidden': 'true' }, 'U')
const splitContent: BubbleMessage['content'] = [
  { type: 'text', text: 'First segment' },
  { type: 'text', text: 'Second segment' },
]
const unresolvedContent: BubbleMessage['content'] = [{ type: 'unknown', label: 'Unknown segment' }]
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
    <Bubble data-testid="hidden-bubble" role="assistant" content="Hidden text" hidden />

    <Bubble data-testid="split-bubble" role="assistant" :content="splitContent" content-render-mode="split">
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
