<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { TrChat, useChatRuntime, type ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { createSdkPageTools } from './sdk-page-tools'
import { modelProviders } from '../../chat/shared/modelProviders'

const pageTools = createSdkPageTools()
const webmcpAdapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: {
    id: 'page-webmcp',
    name: '页面工具',
    description: '当前 Demo 提供的页面 WebMCP 工具',
  },
})

const runtime = useChatRuntime({
  modelProviders,
  mcp: { adapters: [webmcpAdapter] },
})

const actionStatus = ref('页面工具已接入，等待 Chat 调用。')
const section = pageTools.section
const statusToolAdded = pageTools.statusToolAdded
const registrationError = pageTools.registrationError
const pageToolsInChat = computed(() => runtime.composer.mcp?.tools.value['page-webmcp'] ?? [])

onBeforeUnmount(() => {
  pageTools.dispose()
  void webmcpAdapter.close?.()
})

function handleRuntimeActionError(payload: ChatRuntimeActionErrorPayload) {
  actionStatus.value = `运行时操作失败：${payload.action}`
}
</script>

<template>
  <section class="webmcp-demo">
    <div class="webmcp-demo__toolbar">
      <span>当前页面区域：{{ section }}</span>
      <button
        type="button"
        @click="statusToolAdded ? pageTools.unregisterStatusTool() : pageTools.registerStatusTool()"
      >
        {{ statusToolAdded ? '重置页面工具' : '注册一个新页面工具' }}
      </button>
    </div>
    <div class="webmcp-demo__status">
      <span>{{ actionStatus }}</span>
      <span>已发现 {{ pageToolsInChat.length }} 个工具</span>
      <span v-if="registrationError" role="alert">页面工具注册失败：{{ registrationError }}</span>
    </div>
    <ul class="webmcp-demo__tools">
      <li v-for="tool in pageToolsInChat" :key="tool.id">
        <code>{{ tool.name }}</code>
        <span>{{ tool.description || '暂无描述' }}</span>
      </li>
    </ul>
    <div class="webmcp-demo__chat">
      <TrChat :runtime="runtime" @runtime-action-error="handleRuntimeActionError" />
    </div>
  </section>
</template>

<style scoped>
.webmcp-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.webmcp-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.webmcp-demo__toolbar button {
  border: 1px solid var(--tr-border-color-default, #d9d9d9);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--tr-text-primary, #191919);
  background: var(--tr-container-bg-default, #fff);
  cursor: pointer;
}

.webmcp-demo__status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 12px;
}

.webmcp-demo__tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.webmcp-demo__tools li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--tr-border-color-default, #d9d9d9);
  border-radius: 6px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 12px;
}

.webmcp-demo__tools code {
  color: var(--tr-text-primary, #191919);
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
