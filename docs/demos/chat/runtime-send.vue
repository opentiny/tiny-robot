<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime } from '@opentiny/tiny-robot-chat'

const defaultResult = shallowRef('尚未发送')
const customResult = shallowRef('尚未发送')
const defaultRuntime = useKitChatRuntime({ conversation: useConversation() })
const customRuntime = useKitChatRuntime({
  conversation: useConversation(),
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
  <TrTheme>
    <section class="runtime-send-demo">
      <div class="runtime-send-demo__item">
        <h3>默认发送</h3>
        <button type="button" @click="sendDefaultEmptyText">发送空文本</button>
        <p aria-live="polite">结果：{{ defaultResult }}</p>
      </div>
      <div class="runtime-send-demo__item">
        <h3>自定义 send</h3>
        <button type="button" @click="sendCustomEmptyText">发送空文本</button>
        <p aria-live="polite">结果：{{ customResult }}</p>
      </div>
    </section>
  </TrTheme>
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
