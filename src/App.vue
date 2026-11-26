<script setup lang="ts">
import {
  TrChat,
  useChatRuntime,
  type ChatMcpServers,
  type ChatMessageItem,
  type ChatProviderConfig,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import { TrThemeProvider as TrTheme } from '@opentiny/tiny-robot'
import { IconBailian, IconDeepseek, IconGenerativeUi } from '@opentiny/tiny-robot-svgs'
import { computed, markRaw, provide, shallowRef } from 'vue'
import SchemaContent from './components/SchemaContent.vue'
import { createGenuiPlugin } from './genui/prompt'
import { splitContent } from './genui/schema'
import { queryContextKey } from './genui/context'

const reasoningFields: ChatProviderConfig['models'][number]['features'] = [
  {
    key: 'reasoning',
    label: '思考强度',
    type: 'select',
    defaultValue: 'off',
    options: [
      { value: 'off', label: '关闭' },
      { value: 'low', label: '低' },
      { value: 'high', label: '高' },
      { value: 'max', label: '最高' },
    ],
  },
]
const qwenFields: ChatProviderConfig['models'][number]['features'] = [
  ...reasoningFields,
  { key: 'search', label: '联网搜索', type: 'switch' },
]

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: 'DashScope',
    apiUrl: import.meta.env.VITE_QWEN_API_URL?.trim() || undefined,
    apiKey: import.meta.env.VITE_ALIYUN_DASHSCOPE_KEY?.trim(),
    models: [
      {
        id: 'qwen3.8-flash',
        label: 'Qwen3.8 Flash',
        icon: IconBailian,
        features: qwenFields,
      },
      {
        id: 'qwen3.7-plus',
        label: 'Qwen3.7 Plus',
        icon: IconBailian,
        features: qwenFields,
      },
      {
        id: 'qwen3.7-max',
        label: 'Qwen3.7 Max',
        icon: IconBailian,
        features: qwenFields,
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
        icon: IconDeepseek,
        features: reasoningFields,
      },
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        icon: IconDeepseek,
        features: reasoningFields,
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
] satisfies ChatMcpServers

const genuiEnabled = shallowRef(false)
const genuiPlugin = createGenuiPlugin(() => genuiEnabled.value)
const runtime = useChatRuntime({
  mcpServers,
  modelProviders,
  conversation: {
    useMessageOptions: { plugins: [genuiPlugin] },
  },
})

const busy = computed(() => runtime.activeConversation.value?.requestState === 'processing')

provide(queryContextKey, {
  busy,
  submit: (fields) => runtime.actions.send({ text: '提交订单查询：' + JSON.stringify(fields) }),
})

const chatUi = computed<ChatUIOptions>(() => ({
  sender: {
    toolbar: (defaults) => [
      ...defaults,
      {
        type: 'custom',
        id: 'genui',
        label: '生成式 UI',
        icon: IconGenerativeUi,
        active: genuiEnabled.value,
        disabled: busy.value,
        onClick: () => {
          if (!busy.value) genuiEnabled.value = !genuiEnabled.value
        },
      },
    ],
  },
  bubble: {
    bubbleList: {
      contentRenderMode: 'split',
      contentResolver: (message) => {
        const source = message.state?.content ?? message.content
        if (typeof source !== 'string') return message.content
        return message.role === 'assistant' && (message as ChatMessageItem).metadata?.genuiEnabled === true
          ? splitContent(source)
          : source
      },
    },
    bubbleProvider: {
      contentRendererMatches: [
        {
          find: (message, content) =>
            (message as ChatMessageItem).metadata?.genuiEnabled === true && content.type === 'schema-json',
          renderer: markRaw(SchemaContent),
        },
      ],
    },
  },
  layout: {
    rightAside: {
      mode: 'dock',
      width: 400,
    },
  },
}))
</script>

<template>
  <TrTheme>
    <div class="chat-basic">
      <TrChat :runtime="runtime" :ui="chatUi" />
    </div>
  </TrTheme>
</template>

<style scoped>
@media (max-width: 959px) {
  .chat-basic :deep(.tr-bubble__avatar) {
    display: none;
  }
}
</style>
