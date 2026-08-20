<script setup lang="ts">
import { TrChat, useLocalChatRuntime, type ChatMcpServers, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: import.meta.env.VITE_QWEN_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    models: [
      {
        id: 'qwen3.7-flash',
        label: 'Qwen3.7 Flash',
        capabilities: {
          thinking: true,
          search: true,
        },
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        capabilities: {
          thinking: true,
          search: true,
        },
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        capabilities: {
          thinking: true,
          search: true,
        },
      },
    ],
  },
  {
    type: 'deepseek',
    apiUrl: import.meta.env.VITE_DEEPSEEK_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY?.trim(),
    models: [
      {
        id: 'deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        capabilities: {
          thinking: true,
        },
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        capabilities: {
          thinking: true,
        },
      },
    ],
  },
]

const amapMcpApiKey = import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim()

const mcpServers = [
  {
    id: 'amap-maps',
    name: '高德地图',
    description: '覆盖地图、导航、地理编码、天气、路径规划、距离测量、关键词搜索和周边搜索等地理信息服务。',
    baseUrl: import.meta.env.VITE_AMAP_MCP_URL?.trim() || 'https://dashscope.aliyuncs.com/api/v1/mcps/amap-maps/mcp',
    icon: 'https://img.alicdn.com/imgextra/i4/O1CN01iPPabT1EGRN6uatHP_!!6000000000324-0-tps-512-512.jpg',
    headers: amapMcpApiKey ? { Authorization: `Bearer ${amapMcpApiKey}` } : undefined,
  },
  {
    id: 'model-context-protocol-mcp',
    name: 'Model Context Protocol MCP',
    description: 'MCP Server',
    baseUrl: '/modelcontextprotocol-mcp',
    icon: '/modelcontextprotocol.png',
    installed: true,
  },
] satisfies ChatMcpServers

const runtime = useLocalChatRuntime({
  mcpServers,
  modelProviders,
})
</script>

<template>
  <div class="chat-basic">
    <TrChat :runtime="runtime" />
  </div>
</template>

<style scoped>
@media (max-width: 959px) {
  .chat-basic :deep(.tr-bubble__avatar) {
    display: none;
  }
}
</style>
