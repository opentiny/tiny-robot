<script setup lang="ts">
import { computed, markRaw, shallowRef } from 'vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatMessageItem, ChatRequestState, ChatUIOptions } from '../../../chat/src/types'
import RenderContextProbe from './RenderContextProbe.vue'

const props = withDefaults(
  defineProps<{
    anchor?: boolean
    consecutiveUsers?: boolean
    customMain?: boolean
    callerAnchors?: boolean
    callbackAttributes?: boolean
    floating?: boolean
    width?: number
    contentMaxWidth?: number
    contentPaddingInline?: string
    scrollButtonAlign?: 'flex-start' | 'center' | 'flex-end'
    hideSender?: boolean
  }>(),
  { anchor: true },
)
const thread = shallowRef('thread-a')
const senderHeader = shallowRef(false)
const requests = shallowRef<Record<string, { state: ChatRequestState }>>({
  'thread-a': { state: 'idle' },
  'thread-b': { state: 'processing' },
})
const messages = shallowRef<ChatMessageItem[]>(
  props.consecutiveUsers
    ? [
        { id: 'adjacent-user-1', role: 'user', content: 'Adjacent question one' },
        { id: 'adjacent-user-2', role: 'user', content: 'Adjacent question two' },
      ]
    : Array.from({ length: 6 }, (_, index) => [
        {
          id: `user-${index}`,
          role: 'user',
          content: [
            { type: 'text', text: `Question ${index}` },
            { type: 'text', text: 'part two' },
          ],
          state: { content: `Displayed question ${index}` },
        },
        {
          id: `answer-${index}`,
          renderKey: `answer-${index}`,
          role: 'assistant',
          content: 'Answer',
          ...(index === 5 ? { streamState: 'streaming' as const } : {}),
        },
      ]).flat(),
)
const data = computed(() => ({
  conversation: { activeId: thread.value },
  bubble: { messages: messages.value },
  request: requests.value[thread.value],
}))
const ui = computed<ChatUIOptions>(() => ({
  anchor: props.anchor ? {} : false,
  layout: {
    leftAside: false,
    rightAside: false,
    contentMaxWidth: props.contentMaxWidth,
    ...(props.floating ? { surface: { mode: 'floating', floatingOptions: { minWidth: 320 } } } : {}),
  },
  sender: props.hideSender ? false : {},
  bubble: {
    bubbleList: {
      contentRenderMode: 'split',
      ...(props.consecutiveUsers ? { groupStrategy: 'consecutive' as const } : {}),
    },
    bubbleProvider: {
      fallbackContentRenderer: markRaw(RenderContextProbe),
      boxAttributes:
        props.callbackAttributes || props.callerAnchors
          ? (group, _content, index) => ({
              'data-business': 'kept',
              'data-business-index': index,
              class: 'business-box',
              style: { border: '3px solid currentColor' },
              ...(props.callerAnchors ? { 'data-anchor-id': `business-${group[0].id}-${index}` } : {}),
            })
          : { 'data-business': 'kept', class: 'business-box', style: { border: '3px solid currentColor' } },
      contentAttributes: { 'data-business-content': 'kept' },
    },
  },
}))

function grow() {
  messages.value = messages.value.map((message, index) =>
    index === messages.value.length - 1
      ? {
          ...message,
          id: 'server-answer',
          content: String(message.content).padEnd(String(message.content).length + 500, 'x'),
        }
      : { ...message },
  )
}

function finish() {
  messages.value = messages.value.map<ChatMessageItem>((message) => ({ ...message, streamState: 'finished' }))
}

function startAutomaticStream() {
  requests.value = { ...requests.value, 'thread-a': { state: 'processing' } }
  messages.value = [
    ...messages.value,
    { id: 'automatic', renderKey: 'automatic', role: 'assistant', content: 'first', loading: false },
  ]
}

function growAutomaticStream() {
  messages.value = messages.value.map((message) =>
    message.renderKey === 'automatic'
      ? { ...message, id: 'automatic-server', content: `${message.content} update` }
      : message,
  )
}

function growAutomaticTable() {
  messages.value = messages.value.map((message) =>
    message.renderKey === 'automatic'
      ? {
          ...message,
          id: 'automatic-server',
          content: `${message.content}\n| column | value |\n| --- | --- |\n| row | update |`,
        }
      : message,
  )
}

function finishAutomaticStream() {
  requests.value = { ...requests.value, 'thread-a': { state: 'completed' } }
}

function switchAutomaticStream() {
  thread.value = 'thread-b'
  messages.value = [...messages.value, { id: 'other', role: 'assistant', content: 'other' }]
}
</script>

<template>
  <div class="render-context-fixture">
    <button data-testid="grow" @click="grow">Grow</button>
    <button data-testid="finish" @click="finish">Finish</button>
    <button data-testid="thread" @click="thread = 'thread-b'">Switch</button>
    <button data-testid="auto-start" @click="startAutomaticStream">Start automatic stream</button>
    <button data-testid="auto-grow" @click="growAutomaticStream">Grow automatic stream</button>
    <button data-testid="auto-table" @click="growAutomaticTable">Grow automatic table</button>
    <button data-testid="auto-finish" @click="finishAutomaticStream">Finish automatic stream</button>
    <button data-testid="auto-switch" @click="switchAutomaticStream">Switch automatic stream</button>
    <button data-testid="sender-header" @click="senderHeader = !senderHeader">Toggle sender header</button>
    <TrChatUI
      :data="data"
      :ui="ui"
      :is-empty="false"
      :floating-state="
        floating ? { placement: 'top-left', offsetX: 16, offsetY: 16, width: width ?? 600, height: 500 } : undefined
      "
      :style="{
        width: floating ? undefined : width ? `${width}px` : undefined,
        '--tr-chat-ui-content-padding-inline': contentPaddingInline,
        '--tr-chat-scroll-button-align': scrollButtonAlign,
      }"
    >
      <template v-if="customMain" #layout-main>Custom main</template>
      <template #sender-header><div v-if="senderHeader" style="height: 72px">Attachment preview</div></template>
    </TrChatUI>
  </div>
</template>

<style scoped>
.render-context-fixture {
  --tr-layout-height: 500px;
  height: 550px;
}
</style>
