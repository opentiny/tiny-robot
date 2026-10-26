<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'

const runtimeOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
const modelProviders: ChatProviderConfig[] = [
  {
    type: 'openai',
    // 文档通过模拟服务返回回答；接入项目时替换为实际服务地址
    apiUrl: new URL(`${import.meta.env.BASE_URL}api`, runtimeOrigin).toString(),
    models: [
      {
        id: 'your-model-id',
        label: '应用助手',
      },
    ],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <div class="chat-basic-demo">
    <TrChat :runtime="runtime" />
  </div>
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
