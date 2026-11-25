<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref } from 'vue'
import { TrBubbleList, TrMcpExtensionDetail, TrSender, type BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { createWebMcpAdapter } from '@opentiny/tiny-robot'
import { toolPlugin, useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import type { ChatCompletionMessageToolCall, MessageRequestBody } from '@opentiny/tiny-robot-kit'
import { createSdkPageTools } from './sdk-page-tools'

const pageTools = createSdkPageTools()
const adapter = createWebMcpAdapter({
  getContext: pageTools.context,
  server: { id: 'page-webmcp', name: '页面工具' },
})
const input = ref('')
const statusToolAdded = pageTools.statusToolAdded
const registrationError = pageTools.registrationError
const pageServer = computed(() => adapter.runtime.servers.value.find((server) => server.id === 'page-webmcp'))
const pageToolsInKit = computed(() => adapter.runtime.tools.value['page-webmcp'] ?? [])
const error = ref('')

onBeforeUnmount(() => {
  pageTools.dispose()
  void adapter.close?.()
})

const message = useMessage({
  responseProvider: async (requestBody: MessageRequestBody, abortSignal) => {
    const response = await fetch(`${import.meta.env.BASE_URL}api/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...requestBody, stream: true }),
      signal: abortSignal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    return sseStreamToGenerator(response, { signal: abortSignal })
  },
  plugins: [
    toolPlugin({
      getTools: async () => {
        await adapter.refresh?.()
        const server = adapter.runtime.servers.value[0]
        const tools = pageToolsInKit.value.filter((tool) => tool.enabled)
        if (!server?.enabled) return []
        const definitions = await adapter.listTools(['page-webmcp'], {
          'page-webmcp': tools.map((tool) => tool.id),
        })
        return definitions.map((tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description ?? '',
            parameters: tool.inputSchema ?? { type: 'object', properties: {} },
          },
        }))
      },
      callTool: async (toolCall: ChatCompletionMessageToolCall) => {
        const name = toolCall.function?.name ?? ''
        const definition = (
          await adapter.listTools(['page-webmcp'], {
            'page-webmcp': pageToolsInKit.value.filter((tool) => tool.enabled).map((tool) => tool.id),
          })
        ).find((tool) => tool.name === name)
        if (!definition) throw new Error(`Tool is not enabled: ${name}`)
        const args = JSON.parse(toolCall.function?.arguments || '{}') as Record<string, unknown>
        return adapter.callTool(definition.serverId, definition.originalName, args)
      },
    }),
  ],
})

const roles: Record<string, BubbleRoleConfig> = {
  assistant: { placement: 'start', avatar: h(IconAi, { style: { fontSize: '28px' } }) },
  user: { placement: 'end', avatar: h(IconUser, { style: { fontSize: '28px' } }) },
}

async function handleSubmit(text: string) {
  if (!text.trim()) return
  error.value = ''
  input.value = ''
  try {
    await message.sendMessage(text)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function handleServerToggle() {
  const server = pageServer.value
  if (!server || server.loading) return

  try {
    await adapter.runtime.setServerEnabled(server.id, !server.enabled)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function handleToolToggle({ toolId, enabled }: { toolId: string; enabled: boolean }) {
  try {
    await adapter.runtime.setToolEnabled('page-webmcp', toolId, enabled)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}
</script>

<template>
  <section class="webmcp-kit-demo">
    <div class="webmcp-kit-demo__tools">
      <TrMcpExtensionDetail
        id="page-webmcp"
        name="页面工具"
        description="由 OpenTiny WebMCP SDK 注册的页面工具"
        :tools="pageToolsInKit"
        @tool-toggle="handleToolToggle"
      />
      <button type="button" :disabled="!pageServer || pageServer.loading" @click="handleServerToggle">
        {{ pageServer?.enabled ? '禁用页面 MCP Server' : '启用页面 MCP Server' }}
      </button>
      <button
        type="button"
        @click="statusToolAdded ? pageTools.unregisterStatusTool() : pageTools.registerStatusTool()"
      >
        {{ statusToolAdded ? '注销动态工具' : '注册动态工具' }}
      </button>
      <p v-if="registrationError" role="alert">页面工具注册失败：{{ registrationError }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </div>
    <div class="webmcp-kit-demo__messages">
      <TrBubbleList :messages="message.messages.value" :role-configs="roles" />
      <TrSender
        v-model="input"
        :loading="message.isProcessing.value"
        placeholder="让模型读取或切换页面区域"
        @submit="handleSubmit"
        @cancel="message.abortRequest"
      />
    </div>
  </section>
</template>

<style scoped>
.webmcp-kit-demo {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 16px;
  min-height: 520px;
}

.webmcp-kit-demo__messages {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 520px;
}

.webmcp-kit-demo__messages :deep(.tr-bubble-list) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.webmcp-kit-demo__tools button {
  margin-top: 12px;
}

.webmcp-kit-demo__tools p {
  color: #c0392b;
}
</style>
