<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import type { ChatCompletionChunk, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { TrChat, useChatRuntime, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createMockConversationStorage } from './shared/mockConversationStorage'

const eventState = shallowRef('等待状态变化')
const responseProvider: ResponseProvider = async function* (_request, signal) {
  const chunks = ['Vue ', '流式响应', '已完成']
  for (const [index, content] of chunks.entries()) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, 150)
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          reject(new DOMException('Request aborted', 'AbortError'))
        },
        { once: true },
      )
    })
    yield {
      id: 'vue-runtime-subscription',
      object: 'chat.completion.chunk',
      created: 1,
      model: 'mock',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content },
          finish_reason: index === chunks.length - 1 ? 'stop' : null,
        },
      ],
    } as ChatCompletionChunk
  }
}
const runtime = useChatRuntime({
  conversation: {
    storage: createMockConversationStorage(`tiny-robot-runtime-subscription-${Date.now()}`, []),
    autoSaveThrottle: 0,
    useMessageOptions: { responseProvider },
  },
})
const state = computed(() => runtime.activeConversation.value?.requestState)
const status = computed(() => {
  const label =
    { processing: '生成中', completed: '已完成', aborted: '已停止', error: '失败' }[state.value ?? ''] ?? '空闲'
  return `${label} · ${runtime.conversations.value.length} 个会话`
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}

async function send() {
  const pending = runtime.actions.send({ text: '订阅状态验证' })
  eventState.value = 'runtime state: processing'
  await pending
  eventState.value = `runtime state: ${runtime.activeConversation.value?.requestState}`
}

async function stop() {
  await runtime.actions.abort?.()
  eventState.value = 'runtime state: aborted'
}

onUnmounted(() => void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined))
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <button class="runtime-demo__button" type="button" :disabled="state === 'processing'" @click="send">
        发送预设问题
      </button>
      <button class="runtime-demo__button" type="button" :disabled="state !== 'processing'" @click="stop">
        停止回答
      </button>
    </div>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <p class="runtime-demo__status">{{ eventState }}</p>
    <div class="runtime-demo__chat"><TrChat :runtime="runtime" :ui="ui" /></div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
