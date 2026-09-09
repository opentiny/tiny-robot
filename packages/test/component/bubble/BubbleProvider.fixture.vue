<script setup lang="ts">
import { markRaw, ref } from 'vue'
import Bubble from '../../../components/src/bubble/Bubble.vue'
import BubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import type {
  BubbleBoxRendererMatch,
  BubbleContentRendererMatch,
  BubbleEvent,
  BubbleMessage,
} from '../../../components/src/bubble/index.type'
import FallbackBoxRenderer from './FallbackBoxRenderer.vue'
import FallbackContentRenderer from './FallbackContentRenderer.vue'
import SecondaryContentRenderer from './SecondaryContentRenderer.vue'
import TestBoxRenderer from './TestBoxRenderer.vue'
import TestContentRenderer from './TestContentRenderer.vue'

const customContent: BubbleMessage['content'] = [{ type: 'custom', text: 'Provider content' }]
const unknownContent: BubbleMessage['content'] = [{ type: 'unknown', label: 'Unknown content' }]
const sourceContent: BubbleMessage['content'] = [{ type: 'source', text: 'Source content' }]

const contentMatches: BubbleContentRendererMatch[] = [
  {
    find: (_message, content) => content.type === 'custom',
    renderer: markRaw(SecondaryContentRenderer),
    priority: 20,
  },
  {
    find: (_message, content) => content.type === 'custom',
    renderer: markRaw(TestContentRenderer),
    priority: -10,
    attributes: { 'data-match-attribute': 'content-priority' },
  },
]

const boxMatches: BubbleBoxRendererMatch[] = [
  {
    find: (_messages, content) => content?.type === 'custom',
    renderer: markRaw(TestBoxRenderer),
    priority: -10,
    attributes: { 'data-match-attribute': 'box-priority' },
  },
]

const lastStateChange = ref('')
const lastBubbleEvent = ref('')

const recordState = (payload: unknown) => {
  lastStateChange.value = JSON.stringify(payload)
}

const recordBubbleEvent = (payload: BubbleEvent & { messageIndex: number; contentIndex: number }) => {
  lastBubbleEvent.value = JSON.stringify(payload)
}
</script>

<template>
  <main>
    <section data-testid="matched-provider">
      <BubbleProvider
        :box-renderer-matches="boxMatches"
        :content-renderer-matches="contentMatches"
        :box-attributes="(_messages, _content, index) => ({ 'data-provider-box-index': String(index) })"
        :content-attributes="(_message, _content, index) => ({ 'data-provider-content-index': String(index) })"
        :store="{ label: 'provider-store' }"
      >
        <Bubble
          role="assistant"
          :content="customContent"
          content-render-mode="split"
          @state-change="recordState"
          @bubble-event="recordBubbleEvent"
        />
      </BubbleProvider>
      <output data-testid="state-output">{{ lastStateChange }}</output>
      <output data-testid="event-output">{{ lastBubbleEvent }}</output>
    </section>

    <section data-testid="provider-fallbacks">
      <BubbleProvider
        :fallback-box-renderer="FallbackBoxRenderer"
        :fallback-content-renderer="SecondaryContentRenderer"
      >
        <Bubble role="assistant" :content="unknownContent" />
        <Bubble
          data-testid="prop-fallback-bubble"
          role="assistant"
          :content="unknownContent"
          :fallback-content-renderer="FallbackContentRenderer"
        />
      </BubbleProvider>
    </section>

    <section data-testid="nested-provider">
      <BubbleProvider :content-renderer-matches="contentMatches" :store="{ label: 'outer-store' }">
        <BubbleProvider :content-renderer-matches="contentMatches" :store="{ label: 'inner-store' }">
          <Bubble role="assistant" :content="customContent" />
        </BubbleProvider>
      </BubbleProvider>
    </section>

    <section data-testid="resolved-provider">
      <BubbleProvider :content-renderer-matches="contentMatches">
        <Bubble
          role="assistant"
          :content="sourceContent"
          :content-resolver="() => [{ type: 'custom', text: 'Resolved provider content' }]"
        />
      </BubbleProvider>
    </section>
  </main>
</template>
