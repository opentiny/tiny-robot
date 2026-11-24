<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { TrChat, useChatRuntime, type ChatMcpServers } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createSdkPageTools } from './sdk-page-tools'
import { modelProviders } from '../../chat/shared/modelProviders'

const pageTools = createSdkPageTools()
const webmcpAdapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: { id: 'page-webmcp', name: '页面工具' },
})

const externalMcpServers: ChatMcpServers = [
  {
    id: 'project-knowledge',
    name: '项目知识库',
    description: '外部 MCP 项目知识库。',
    baseUrl: `${import.meta.env.BASE_URL}api/mcp/project-knowledge`,
    installed: false,
  },
]

const runtime = useChatRuntime({
  modelProviders,
  mcp: {
    servers: externalMcpServers,
    adapters: [webmcpAdapter],
  },
})

const registrationError = pageTools.registrationError

onBeforeUnmount(() => {
  pageTools.dispose()
  void webmcpAdapter.close?.()
})
</script>

<template>
  <section class="webmcp-demo">
    <div class="webmcp-demo__hint">页面 WebMCP 与外部 MCP 位于同一个 MCP 面板中。</div>
    <p v-if="registrationError" class="webmcp-demo__error" role="alert">页面工具注册失败：{{ registrationError }}</p>
    <div class="webmcp-demo__chat">
      <TrChat :runtime="runtime" />
    </div>
  </section>
</template>

<style scoped>
.webmcp-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.webmcp-demo__hint {
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.webmcp-demo__error {
  margin: 0;
  color: var(--tr-color-danger, #c0392b);
  font-size: 13px;
}

.webmcp-demo__chat {
  width: 100%;
  height: clamp(420px, 58vh, 520px);
}

.webmcp-demo__chat :deep(.tr-chat-ui) {
  height: 100%;
  min-height: 0;
}
</style>
