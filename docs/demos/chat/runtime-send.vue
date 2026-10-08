<script setup lang="ts">
import { shallowRef } from 'vue'
import { useConversation, type ResponseProvider } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const defaultResult = shallowRef('尚未发送')
const customResult = shallowRef('尚未发送')
const responseProvider: ResponseProvider = async () => ({
  id: 'runtime-send-demo',
  object: 'chat.completion',
  created: 0,
  model: 'runtime-send-demo',
  system_fingerprint: null,
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: '' },
      delta: undefined,
      logprobs: null,
      finish_reason: 'stop',
    },
  ],
})

function createDemoConversation() {
  return useConversation({
    useMessageOptions: { responseProvider },
  })
}

const defaultRuntime = useChatRuntimeFromConversation({ conversation: createDemoConversation() })
const customRuntime = useChatRuntimeFromConversation({
  conversation: createDemoConversation(),
  send: ({ text }) => {
    customResult.value = `自定义 send 收到 text: ${JSON.stringify(text)}`
  },
})

async function sendDefaultEmptyText() {
  defaultResult.value = String(await defaultRuntime.actions.send({ text: '' }))
}

async function sendCustomEmptyText() {
  const sent = await customRuntime.actions.send({ text: '' })
  customResult.value = `${customResult.value}，结果: ${sent}`
}
</script>

<template>
  <section class="runtime-send-demo">
    <div class="runtime-send-demo__item">
      <h3>默认发送</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendDefaultEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ defaultResult }}</p>
    </div>
    <div class="runtime-send-demo__item">
      <h3>自定义 send</h3>
      <button class="runtime-send-demo__button" type="button" @click="sendCustomEmptyText">发送空文本</button>
      <p aria-live="polite">结果：{{ customResult }}</p>
    </div>
  </section>
</template>

<style scoped>
.runtime-send-demo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.runtime-send-demo__item {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tr-common-border-color);
}

.runtime-send-demo__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #2f6fad;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  background: #2f6fad;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}

.runtime-send-demo__button:hover {
  border-color: #24598d;
  background: #24598d;
}

.runtime-send-demo__button:focus-visible {
  outline: 2px solid #8ab8df;
  outline-offset: 2px;
}

.runtime-send-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.runtime-send-demo__item h3,
.runtime-send-demo__item p {
  margin: 0 0 12px;
}

@media (max-width: 640px) {
  .runtime-send-demo {
    grid-template-columns: 1fr;
  }
}
</style>
