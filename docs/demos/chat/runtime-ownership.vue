<script setup lang="ts">
import { nextTick, onUnmounted, shallowRef } from 'vue'
import type { ChatCompletion, ResponseProvider } from '@opentiny/tiny-robot-kit'
import { TrChat, useChatRuntime, type ChatRuntime, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createMockConversationStorage } from './shared/mockConversationStorage'

const completion = (content: string): ChatCompletion => ({
  id: `ownership-${content}`,
  object: 'chat.completion',
  created: 1,
  model: 'mock',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})
let runtimeASignal: AbortSignal | undefined
const longProvider: ResponseProvider = async (_request, signal) => {
  runtimeASignal = signal
  await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
  return completion('Runtime A 已停止')
}
const provider =
  (label: string): ResponseProvider =>
  async (request) =>
    completion(`${label} 已收到：${String(request.messages.at(-1)?.content ?? '')}`)
const createRuntime = (label: string, responseProvider: ResponseProvider): ChatRuntime =>
  useChatRuntime({
    conversation: {
      storage: createMockConversationStorage(`tiny-robot-runtime-${label}-${Date.now()}-${Math.random()}`, []),
      autoSaveThrottle: 0,
      useMessageOptions: { responseProvider },
    },
  })

const runtimeA = createRuntime('a', longProvider)
const runtimeB = createRuntime('b', provider('Runtime B'))
const injectedRuntime = createRuntime('injected', provider('Injected Runtime'))
const isolatedA = createRuntime('isolated-a', provider('A'))
const isolatedB = createRuntime('isolated-b', provider('B'))
const activeRuntime = shallowRef(runtimeA)
const mode = shallowRef('owned-a')
const mounted = shallowRef(true)
const log = shallowRef('等待操作')
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}

function startLongRequest() {
  void runtimeA.actions.send({ text: '长请求' })
}

async function switchOwnedB() {
  await runtimeA.actions.abort?.()
  activeRuntime.value = runtimeB
  mode.value = 'owned-b'
  log.value = `runtime-a released: ${Boolean(runtimeASignal?.aborted)}`
}

function injectRuntime() {
  activeRuntime.value = injectedRuntime
  mode.value = 'injected'
}

function sendCurrent() {
  void activeRuntime.value.actions.send({ text: '所有权验证' })
}

async function remount() {
  mounted.value = false
  await nextTick()
  mounted.value = true
  await nextTick()
  const survives = await injectedRuntime.actions.send({ text: '重连验证' })
  log.value = `injected survives: ${survives}`
}

async function verifyStorage() {
  await isolatedA.actions.send({ text: 'only-a' })
  log.value = `storage isolated: ${isolatedA.conversations.value.length === 1 && isolatedB.conversations.value.length === 0}`
}

onUnmounted(() => {
  for (const runtime of [runtimeA, runtimeB, injectedRuntime, isolatedA, isolatedB]) {
    void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
  }
})
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <button class="runtime-demo__button" type="button" @click="startLongRequest">启动长请求</button>
      <button class="runtime-demo__button" type="button" @click="switchOwnedB">切换 owned-b</button>
      <button class="runtime-demo__button" type="button" @click="injectRuntime">注入 Runtime</button>
      <button class="runtime-demo__button" type="button" @click="sendCurrent">发送到当前 Runtime</button>
      <button class="runtime-demo__button" type="button" @click="remount">移除并恢复</button>
      <button class="runtime-demo__button" type="button" @click="verifyStorage">验证多实例存储</button>
    </div>
    <p class="runtime-demo__status" role="status">
      {{ mode }} · {{ activeRuntime.activeConversation.value?.requestState ?? 'idle' }}
    </p>
    <p class="runtime-demo__status">{{ log }}</p>
    <div class="runtime-demo__chat"><TrChat v-if="mounted" :runtime="activeRuntime" :ui="ui" /></div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
