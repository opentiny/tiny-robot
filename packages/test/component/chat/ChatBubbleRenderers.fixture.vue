<script setup lang="ts">
import { computed, h, reactive, ref, shallowRef } from 'vue'
import {
  BubbleRenderers,
  type BubbleContentRendererProps,
  type BubbleMessage,
  type ChatMessageContentItem,
} from '@opentiny/tiny-robot'
import ChatUI from '../../../chat/src/ChatUI.vue'
import type {
  ChatBubbleContentRendererContext,
  ChatBubbleRenderers,
  ChatUIData,
  ChatUIOptions,
} from '../../../chat/src/types'

const rendererError = ref('')
const aborts = ref(0)

const data = reactive<ChatUIData>({
  conversation: { title: 'Bubble renderers' },
  bubble: {
    messages: [
      {
        id: 'content-message',
        role: 'assistant',
        content: [
          { type: 'text', text: '## Built-in Markdown\n\n**Rendered safely.**' },
          { type: 'status-card', title: 'Deployment', status: 'ready' },
        ],
      },
      {
        id: 'plain-message',
        role: 'user',
        content: 'Plain unmatched text',
      },
      {
        id: 'tool-message',
        role: 'assistant',
        content: 'Tool completed.',
        tool_calls: [
          {
            id: 'tool-call-1',
            type: 'function',
            function: { name: 'lookup_release', arguments: '{"version":"1.0.0"}' },
          },
        ],
        state: {
          toolCall: {
            'tool-call-1': { status: 'success', open: false, description: 'Release lookup' },
          },
        },
      },
    ],
  },
})

const VueStatusRenderer = (_props: BubbleContentRendererProps) =>
  h('div', { 'data-testid': 'vue-status-renderer' }, 'Vue renderer must not win')

const ui: ChatUIOptions = {
  layout: { leftAside: false },
  bubble: {
    bubbleList: { contentRenderMode: 'split' },
    bubbleProvider: {
      fallbackContentRenderer: BubbleRenderers.Text,
      contentRendererMatches: [
        {
          find: (message) => Boolean(message.tool_calls?.length),
          renderer: BubbleRenderers.Text,
          priority: -1,
        },
        {
          find: (_message, content) => content.type === 'status-card',
          renderer: VueStatusRenderer,
          priority: 10,
        },
      ],
    },
  },
}

function statusRenderer(context: ChatBubbleContentRendererContext, lifecycle: { signal: AbortSignal }) {
  const card = document.createElement('article')
  card.dataset.testid = 'dom-status-renderer'
  card.textContent = `${String(context.content.title)}|${context.contentIndex}|${String(context.content.status)}`
  lifecycle.signal.addEventListener('abort', () => (aborts.value += 1), { once: true })
  return card
}

function replacementRenderer(context: ChatBubbleContentRendererContext) {
  const card = document.createElement('article')
  card.dataset.testid = 'replacement-status-renderer'
  card.textContent = `${String(context.content.status)}|${context.contentIndex}`
  return card
}

function createBubbleRenderers(): ChatBubbleRenderers {
  return {
    contentRendererMatches: [
      {
        find: (message) => Boolean(message.tool_calls?.length),
        renderer: 'tools',
        priority: -2,
      },
      {
        find: (message, content, contentIndex) =>
          message.id === 'content-message' && content.type === 'text' && contentIndex === 0,
        renderer: 'markdown',
        priority: -2,
      },
      {
        find: (_message, content) => content.type === 'status-card',
        renderer: statusRenderer,
        priority: 10,
        attributes: { 'data-match': 'status-card' },
      },
    ],
    boxRendererMatches: [
      {
        find: (_messages, content) => content?.type === 'status-card',
        renderer: (context, lifecycle) => {
          const box = document.createElement('section')
          box.dataset.testid = 'dom-status-box'
          box.dataset.placement = context.placement ?? ''
          box.dataset.shape = context.shape ?? ''
          box.append(context.contentRoot)
          lifecycle.signal.addEventListener('abort', () => (aborts.value += 1), { once: true })
          return box
        },
        priority: 10,
      },
    ],
  }
}

const bubbleRenderers = shallowRef<ChatBubbleRenderers>(createBubbleRenderers())

function replaceMatches() {
  bubbleRenderers.value = {
    contentRendererMatches: [
      {
        find: (_message, content) => content.type === 'status-card',
        renderer: replacementRenderer,
        priority: 10,
      },
    ],
  }
}

function updateMessage() {
  const content = data.bubble?.messages?.[0]?.content
  if (Array.isArray(content)) content[1] = { ...content[1], status: 'streaming' }
}

function installUnknownRenderer() {
  bubbleRenderers.value = {
    contentRendererMatches: [
      {
        find: (_message: BubbleMessage, content: ChatMessageContentItem) => content.type === 'status-card',
        renderer: 'unknown-renderer',
        priority: 10,
      },
    ],
  } as unknown as ChatBubbleRenderers
}

function installThrowingMatch() {
  bubbleRenderers.value = {
    contentRendererMatches: [
      {
        find: () => {
          throw new Error('bubble match failed')
        },
        renderer: 'markdown',
      },
    ],
  }
}

const abortText = computed(() => String(aborts.value))
</script>

<template>
  <div style="width: 960px; height: 700px">
    <button type="button" data-testid="replace-matches" @click="replaceMatches">Replace matches</button>
    <button type="button" data-testid="update-message" @click="updateMessage">Update message</button>
    <button type="button" data-testid="unknown-renderer" @click="installUnknownRenderer">Unknown renderer</button>
    <button type="button" data-testid="throwing-match" @click="installThrowingMatch">Throwing match</button>
    <button type="button" data-testid="recover-renderers" @click="bubbleRenderers = createBubbleRenderers()">
      Recover renderers
    </button>
    <output data-testid="bubble-renderer-aborts">{{ abortText }}</output>
    <output data-testid="bubble-renderer-error">{{ rendererError }}</output>

    <ChatUI
      :data="data"
      :ui="ui"
      :bubble-renderers="bubbleRenderers"
      @renderer-error="rendererError = ($event as Error).message"
    />
  </div>
</template>
