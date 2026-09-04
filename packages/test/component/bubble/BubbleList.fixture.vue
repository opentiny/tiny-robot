<script setup lang="ts">
import { markRaw, ref } from 'vue'
import BubbleList from '../../../components/src/bubble/BubbleList.vue'
import BubbleProvider from '../../../components/src/bubble/BubbleProvider.vue'
import type {
  BubbleContentRendererMatch,
  BubbleEvent,
  BubbleMessage,
  BubbleMessageGroup,
} from '../../../components/src/bubble/index.type'
import TestContentRenderer from './TestContentRenderer.vue'

const dividerMessages: BubbleMessage[] = [
  { id: 'u1', role: 'user', content: 'Question one' },
  { id: 'a1', role: 'assistant', content: 'Answer one' },
  { id: 'a2', role: 'assistant', content: 'Answer continued' },
  { id: 'u2', role: 'user', content: 'Question two' },
  { id: 'a3', role: 'assistant', content: 'Answer two' },
]

const consecutiveMessages: BubbleMessage[] = [
  { id: 'a1', role: 'assistant', content: 'Assistant one' },
  { id: 'a2', role: 'assistant', content: 'Assistant two' },
  { id: 's1', role: 'secret', content: 'Hidden one' },
  { id: 'h1', role: 'hidden-tool', content: 'Hidden two' },
  { id: 'u1', role: 'user', content: 'User one' },
]

const fallbackMessages: BubbleMessage[] = [{ id: 'fallback', content: 'Ignored fallback content' }]

const eventMessages: BubbleMessage[] = [
  { id: 'm0', role: 'assistant', content: [{ type: 'custom', text: 'Message zero' }] },
  { id: 'm1', role: 'assistant', content: [{ type: 'custom', text: 'Message one' }] },
  { id: 'm2', role: 'assistant', content: [{ type: 'custom', text: 'Message two' }] },
]

const customGroup = (messages: BubbleMessage[]): BubbleMessageGroup[] => [
  {
    role: 'assistant',
    messages: [messages[2], messages[0]],
    messageIndexes: [2, 0],
  },
]

const contentMatches: BubbleContentRendererMatch[] = [
  {
    find: (_message, content) => content.type === 'custom',
    renderer: markRaw(TestContentRenderer),
    priority: -10,
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

const scrollMessages = ref<BubbleMessage[]>(
  Array.from({ length: 12 }, (_, index) => ({
    id: `scroll-${index}`,
    role: 'assistant',
    content: `Scrollable message ${index}`,
  })),
)
const scrollList = ref<{ scrollToBottom: (behavior?: ScrollBehavior) => Promise<void> } | null>(null)

const appendUserMessage = () => {
  scrollMessages.value.push({ id: 'latest-user', role: 'user', content: 'Latest user message' })
}
</script>

<template>
  <main>
    <section data-testid="divider-list">
      <BubbleList :messages="dividerMessages">
        <template #prefix="{ role, messages, messageIndexes }">
          <span data-testid="list-prefix">{{ role }}:{{ messageIndexes.join(',') }}:{{ messages.length }}</span>
        </template>
        <template #suffix="{ role, messageIndexes }">
          <span data-testid="list-suffix">{{ role }}:{{ messageIndexes.join(',') }}</span>
        </template>
        <template #after="{ role, messageIndexes }">
          <span data-testid="list-after">{{ role }}:{{ messageIndexes.join(',') }}</span>
        </template>
        <template #content-footer="{ role, messageIndexes, contentIndex }">
          <span data-testid="list-footer"> {{ role }}:{{ messageIndexes.join(',') }}:{{ String(contentIndex) }} </span>
        </template>
      </BubbleList>
    </section>

    <section data-testid="consecutive-list">
      <BubbleList
        :messages="consecutiveMessages"
        group-strategy="consecutive"
        :role-configs="{ secret: { hidden: true }, 'hidden-tool': { hidden: true } }"
      >
        <template #prefix="{ role, messageIndexes }">
          <span data-testid="consecutive-group">{{ role }}:{{ messageIndexes.join(',') }}</span>
        </template>
      </BubbleList>
    </section>

    <section data-testid="fallback-list">
      <BubbleList
        :messages="fallbackMessages"
        fallback-role="assistant"
        :role-configs="{ assistant: { placement: 'end', shape: 'rounded' } }"
        :content-resolver="(message) => `Resolved ${message.id}`"
      />
    </section>

    <section data-testid="custom-list">
      <BubbleProvider :content-renderer-matches="contentMatches">
        <BubbleList
          :messages="eventMessages"
          :group-strategy="customGroup"
          @state-change="recordState"
          @bubble-event="recordBubbleEvent"
        >
          <template #prefix="{ messageIndexes }">
            <span data-testid="custom-indexes">{{ messageIndexes.join(',') }}</span>
          </template>
        </BubbleList>
      </BubbleProvider>
      <output data-testid="list-state-output">{{ lastStateChange }}</output>
      <output data-testid="list-event-output">{{ lastBubbleEvent }}</output>
    </section>

    <section data-testid="scroll-section">
      <button type="button" @click="scrollList?.scrollToBottom('auto')">Scroll to bottom</button>
      <button type="button" @click="appendUserMessage">Append user message</button>
      <BubbleList
        ref="scrollList"
        data-testid="scroll-list"
        class="scroll-list"
        :messages="scrollMessages"
        :auto-scroll="true"
      />
    </section>
  </main>
</template>

<style scoped>
.scroll-list {
  height: 100px;
}

.scroll-list :deep([data-type='text']) {
  min-height: 24px;
}
</style>
