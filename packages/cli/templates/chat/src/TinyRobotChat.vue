<script setup lang="ts">
import type { ChatMcpServerConfig, ChatModelOption } from '@opentiny/tiny-robot/experimental'
import { TrThemeProvider } from '@opentiny/tiny-robot'
import { TrChat } from '@opentiny/tiny-robot/experimental'
import { ref } from 'vue'

const show = ref(false)
const fullscreen = ref(false)

const chatModelOptions: ChatModelOption[] = [
  {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'DeepSeek V4 Flash',
    model: 'deepseek-v4-flash',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  },
]

const chatMcpServers: Record<string, ChatMcpServerConfig> = {}
</script>

<template>
  <TrThemeProvider>
    <TrChat
      v-model:show="show"
      v-model:fullscreen="fullscreen"
      title="TrChat Preview"
      system-prompt="You are a helpful assistant."
      :model-options="chatModelOptions"
      :mcp-servers="chatMcpServers"
    />
  </TrThemeProvider>
</template>
