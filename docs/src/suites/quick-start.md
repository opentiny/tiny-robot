---
outline: [1, 3]
---

# 快速上手

`TrChat` 是用于 Vue 应用的 AI 聊天页面组件，提供会话列表、消息展示和输入区，可接入模型服务发送消息，适用于独立聊天页面和应用内嵌 AI 助手。

## 安装

在已有 Vue 项目中安装 Chat 套件：

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-chat
```

```bash [yarn]
yarn add @opentiny/tiny-robot-chat
```

```bash [npm]
npm install @opentiny/tiny-robot-chat
```

:::

## 引入样式

在应用入口（如 `main.ts`）引入基础组件和 Chat 的样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

## 基础案例

`TrChat` 推荐通过 `useChatRuntime` 接入模型服务。[`useChatRuntime`](./chat-runtime#usechatruntime-配置) 是 Chat 套件提供的聊天功能配置函数，负责连接模型服务、管理会话和发送请求，无需自行编写这些聊天逻辑。

将返回的 `runtime` 对象传给 `TrChat`，即可使用发送消息、取消请求和切换会话等功能，可参考以下最小接入示例：

```vue
<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

// 模型服务配置数组，每项配置一个服务及其可用模型
const modelProviders: ChatProviderConfig[] = [
  {
    // 必填，无默认值；可选 'openai'、'deepseek'、'qwen'
    // 本例服务兼容 OpenAI /chat/completions 接口，因此使用 'openai'
    type: 'openai',

    // 替换为实际服务地址，以下地址仅作占位，不能直接使用
    // 可填服务根地址或完整 /chat/completions 地址；省略时使用对应服务的预设地址
    apiUrl: 'https://your-service.example.com/v1/chat/completions',

    // 该服务下的模型列表；id 和 label 均为必填，无默认值
    models: [
      {
        id: 'your-model-id', // 替换为服务支持的模型 ID
        label: '应用助手', // 模型在界面中显示的名称
      },
    ],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <main class="chat-page">
    <TrChat :runtime="runtime" />
  </main>
</template>

<style scoped>
.chat-page {
  --tr-layout-height: 100%;
  height: 600px;
}
</style>
```

::: tip 容器高度
为父容器设置明确高度，并通过 `--tr-layout-height: 100%` 让聊天界面填满容器。示例使用 `600px`，可根据页面布局调整；未设置该变量时，聊天界面默认使用浏览器视口高度。
:::

以下演示使用本地模拟服务，无需配置真实模型服务，可体验发送消息和查看回答：

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="完整聊天页面"
  description="输入消息并发送，查看模拟服务返回的回答。"
/>

生产环境应通过服务端转发请求并保管模型密钥，不要将长期密钥写入前端代码。更多配置见 [模型服务](./chat-runtime#模型服务)。

项目已使用 TinyRobot Kit 的会话管理工具 `useConversation` 时，可以保留原有会话和请求配置，并接入 `TrChat`，详见[复用已有会话](./chat-runtime#复用已有会话)。

## 下一步

- [界面与交互配置](./chat)：调整布局、输入区和消息展示，使用插槽定制界面。
- [数据与逻辑配置](./chat-runtime)：配置模型服务、管理会话和接入 MCP 工具。
