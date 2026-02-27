# tiny-robot-kit

@opentiny/tiny-robot-kit 是 TinyRobot 提供的数据层工具包，用于统一处理 AI 大模型调用、消息状态与多会话管理。
它帮助你在任意 UI 上快速实现聊天、流式响应和会话持久化等常见 AI 交互能力。

## 功能概览

- **消息管理**：`useMessage` 管理消息状态与模型交互流程。
- **会话管理**：`useConversation` 在 useMessage 之上提供多会话能力。
- **工具函数（Utils）**：处理 SSE、消息格式与响应解析。

完整 API 请参考文档：

- `useMessage`：`docs/src/tools/message.md`
- `useConversation`：`docs/src/tools/conversation.md`
- 工具函数：`docs/src/tools/utils.md`

## 安装

```bash
pnpm add @opentiny/tiny-robot-kit
# 或
npm install @opentiny/tiny-robot-kit
yarn add @opentiny/tiny-robot-kit
```

## 基本用法

### useMessage —— 管理 AI 消息

`useMessage` 管理消息列表、请求/处理状态、流式响应、插件体系以及工具调用逻辑，而真正的 HTTP 请求由你提供的 `responseProvider` 负责。

```ts
import { useMessage } from '@opentiny/tiny-robot-kit'

const message = useMessage({
  // responseProvider 负责调用你的后端 / 模型接口
  async responseProvider(requestBody, abortSignal) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      signal: abortSignal,
      headers: { 'Content-Type': 'application/json' },
    })

    return await res.json()
  },
})
```

更多进阶用法（流式响应、插件、自定义分块（chunk）处理、工具调用等），请查看 `docs/src/tools/message.md`。

### useConversation —— 管理多会话

`useConversation` 基于 `useMessage` 之上，提供多会话管理能力，并支持多种存储策略（LocalStorage、IndexedDB、自定义等）。

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

const { conversations, activeConversation, createConversation, switchConversation } = useConversation({
  useMessageOptions: {
    async responseProvider(requestBody, abortSignal) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        signal: abortSignal,
        headers: { 'Content-Type': 'application/json' },
      })
      return await res.json()
    },
  },
})
```

例如 `localStorageStrategyFactory` 和 `indexedDBStorageStrategyFactory` 等存储策略的详细用法，请参考 `docs/src/tools/conversation.md`。

### 工具函数 Utils —— 处理 SSE 与响应

Utils 模块提供了一些与 `useMessage` 搭配使用的常用工具函数：

- `sseStreamToGenerator`：把 SSE `Response` 转换为异步生成器。
- `formatMessages`：将多种形式的消息统一为 `ChatMessage[]`。
- `extractTextFromResponse`：从大模型响应中提取纯文本内容。
- `handleSSEStream`：通过回调方式消费 SSE 流式响应。

详细函数签名与行为说明，请查看 `docs/src/tools/utils.md`。
