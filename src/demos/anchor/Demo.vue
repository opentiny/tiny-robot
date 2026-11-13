<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { TrChat, useChatRuntime } from '@opentiny/tiny-robot-chat'
import { createDemoStorage } from '../../fixtures/data'

const error = ref('')
const runtime = useChatRuntime({
  modelProviders: [
    {
      type: 'openai',
      apiUrl: new URL('/api/demo/chat/completions', location.origin).href,
      models: [{ id: 'demo', label: '本地模拟模型' }],
    },
  ],
  conversation: {
    storage: createDemoStorage(true),
    onLoad: () => {
      void runtime.actions.switchConversation('launch')
    },
  },
})
onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="chat-scene">
    <p v-if="error" role="alert" class="error-message">{{ error }}</p>
    <TrChat
      :runtime="runtime"
      :ui="{ anchor: {}, layout: { leftAside: false, contentMaxWidth: 720 } }"
      @runtime-action-error="error = String($event.error)"
    />
  </section>
</template>
