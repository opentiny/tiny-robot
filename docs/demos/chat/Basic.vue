<script setup lang="ts">
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { TrChat, useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const apiUrl = `${import.meta.env.BASE_URL}api`

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl,
    models: [
      { id: 'qwen3.7-flash', label: 'Qwen3.7 Flash', capabilities: { thinking: true, search: true } },
      { id: 'qwen3.7-plus', label: 'Qwen3.7 Plus', capabilities: { thinking: true, search: true } },
    ],
  },
]

const runtime = useLocalChatRuntime({ modelProviders })
</script>

<template>
  <TrTheme>
    <div class="chat-basic-demo">
      <tr-chat :runtime="runtime" />
    </div>
  </TrTheme>
</template>

<style scoped>
.chat-basic-demo {
  --tr-layout-height: 100%;
  box-sizing: border-box;
  height: min(620px, calc(100vh - 240px));
  min-height: 480px;
}

.chat-basic-demo :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}

.chat-basic-demo :deep(.tr-welcome__title-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .chat-basic-demo {
    height: 560px;
  }
}
</style>
