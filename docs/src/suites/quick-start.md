---
outline: [1, 3]
---

# 快速上手

`TrChat` 是用于 Vue 应用的 AI 聊天页面组件，提供会话列表、消息展示和输入区，可接入模型服务发送消息，适用于独立聊天页面和应用内嵌 AI 助手。

## 安装

在 Vue 3.3.11 及以上的 Vue 3 项目中安装 Chat 套件及基础组件包，后者用于引入基础组件样式。

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-chat @opentiny/tiny-robot
```

```bash [yarn]
yarn add @opentiny/tiny-robot-chat @opentiny/tiny-robot
```

```bash [npm]
npm install @opentiny/tiny-robot-chat @opentiny/tiny-robot
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

通过 `modelProviders` 数组配置服务地址和模型列表，将其传给 `useChatRuntime`，再将返回的 `runtime` 对象传给 `TrChat`，即可使用发送消息、取消请求和切换会话等功能。

下面的 `App.vue` 包含组件和样式导入、模型服务配置及界面绑定。替换服务地址和模型 ID 后即可使用，示例中的占位值不能直接使用：

```vue
<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'

const modelProviders: ChatProviderConfig[] = [
  {
    // 接入兼容 OpenAI /chat/completions 接口的服务
    type: 'openai',
    // 替换为实际服务地址或兼容该接口的后端转发地址
    apiUrl: 'https://your-service.example.com/v1/chat/completions',
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
  <TrChat :runtime="runtime" />
</template>
```

::: warning 服务认证
需要 API Key 的服务，可在配置对象中添加与 `models` 同级的 `apiKey`，前端配置密钥仅限本地临时体验，生产环境应由服务端保管密钥并转发请求。服务类型、默认地址及认证配置见 [模型服务](./chat-runtime#模型服务)。
:::

外层容器样式仅用于限制文档中的展示高度，接入项目时仍需配置真实服务：

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="['../../demos/chat/basic.vue']"
  title="完整聊天页面"
  description="输入消息并发送，查看模拟服务返回的回答。"
/>

项目已使用 TinyRobot Kit 的会话管理工具 `useConversation` 时，可以保留原有会话和请求配置，并接入 `TrChat`，详见[复用已有会话](./chat-runtime#复用已有会话)。

## 下一步

- [界面与交互配置](./chat)：调整布局、输入区和消息展示，使用插槽定制界面。
- [数据与逻辑配置](./chat-runtime)：配置模型服务、管理会话和接入 MCP 工具。
