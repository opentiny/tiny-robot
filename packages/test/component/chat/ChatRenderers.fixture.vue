<script setup lang="ts">
import { shallowRef } from 'vue'
import ChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{
    useVueSlot?: boolean
    throwRenderer?: boolean
  }>(),
  {
    useVueSlot: false,
    throwRenderer: false,
  },
)

const data = shallowRef<ChatUIData>({
  conversation: { title: 'Initial conversation' },
  bubble: { messages: [{ role: 'assistant', content: 'First message' }] },
  request: { state: 'idle' },
})
const ui: ChatUIOptions = {
  layout: {
    leftAside: false,
    rightAside: {
      panels: [{ id: 'details', title: 'Details' }],
    },
  },
}
const chatUI = shallowRef<InstanceType<typeof ChatUI>>()
const calls = shallowRef(0)
const aborts = shallowRef(0)
const rendererError = shallowRef('')
const shouldThrow = shallowRef(props.throwRenderer)
const lifecycleState = { aborts: 0 }

;(window as typeof window & { __chatRendererLifecycle?: typeof lifecycleState }).__chatRendererLifecycle =
  lifecycleState

const renderers = {
  'layout-main': (
    context: {
      messages: readonly unknown[]
      request?: { state: string }
      conversation: { title?: string }
    },
    lifecycle: { signal: AbortSignal },
  ) => {
    calls.value += 1
    lifecycle.signal.addEventListener(
      'abort',
      () => {
        aborts.value += 1
        lifecycleState.aborts += 1
      },
      { once: true },
    )

    if (shouldThrow.value) {
      throw new Error('native renderer failed')
    }

    const element = document.createElement('div')
    element.dataset.testid = 'layout-main-renderer'
    element.textContent = [
      context.conversation.title,
      context.request?.state,
      context.messages.length,
      `aborts:${lifecycleState.aborts}`,
    ].join('|')
    return element
  },
  'layout-right-aside-panel': (context: { panelId?: string }, lifecycle: { signal: AbortSignal }) => {
    lifecycle.signal.addEventListener(
      'abort',
      () => {
        lifecycleState.aborts += 1
      },
      { once: true },
    )
    const element = document.createElement('div')
    element.dataset.testid = 'right-aside-renderer'
    element.textContent = `panel:${context.panelId}`
    return element
  },
}

function replaceData() {
  data.value = {
    conversation: { title: 'Updated conversation' },
    bubble: {
      messages: [
        { role: 'assistant', content: 'First message' },
        { role: 'user', content: 'Second message' },
      ],
    },
    request: { state: 'processing' },
  }
}

function recoverRenderer() {
  shouldThrow.value = false
  replaceData()
}
</script>

<template>
  <div style="width: 960px; height: 640px">
    <button type="button" data-testid="replace-data" @click="replaceData">Replace data</button>
    <button type="button" data-testid="recover-renderer" @click="recoverRenderer">Recover renderer</button>
    <button type="button" data-testid="open-details" @click="chatUI?.openRightAside('details')">Open details</button>
    <output data-testid="renderer-calls">{{ calls }}</output>
    <output data-testid="renderer-aborts">{{ aborts }}</output>
    <output data-testid="renderer-error">{{ rendererError }}</output>

    <ChatUI
      ref="chatUI"
      :data="data"
      :ui="ui"
      :renderers="renderers"
      @renderer-error="rendererError = ($event as Error).message"
    >
      <template v-if="props.useVueSlot" #layout-main="slotProps">
        <div data-testid="layout-main-slot">
          {{ slotProps.conversation.title }}|{{ slotProps.request?.state }}|{{ slotProps.messages.length }}
        </div>
      </template>
    </ChatUI>
  </div>
</template>
