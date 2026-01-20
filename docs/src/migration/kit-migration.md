---
outline: [1, 3]
---

# Kit 迁移指南

本文档用于将 `@opentiny/tiny-robot-kit` 的用法从 **v0.3.x** 迁移到 **0.4.x**。

## 核心变化概览

- **`AIClient` 变为 deprecated**：0.4.x 仍保留 `AIClient`（用于兼容），但推荐迁移到“**responseProvider + plugins**”的模型。
- **`useMessage` 大改（最重要）**：
  - v0.3.x：`useMessage({ client, useStreamByDefault, events... })`，内部直接调用 `client.chat/chatStream`
  - 0.4.x：`useMessage({ responseProvider, plugins... })`，你提供数据源（Promise 或 AsyncGenerator），框架负责状态机/合并/扩展点
- **插件体系**：0.4.x `useMessage` 内置并开放插件能力（如 `fallbackRolePlugin / thinkingPlugin / lengthPlugin / toolPlugin`）。
- **`useConversation` 大改**：
  - v0.3.x：单一 `messageManager` + 一套会话状态（数组 + currentId）
  - 0.4.x：每个会话拥有独立的 `useMessage` engine，支持懒加载、自动保存节流、后台请求不中断等
- **包导出（exports）变化**：0.4.x 在根导出中新增/调整了 `storage`、`plugins`、`message types` 等；部分旧导出不再从根导出。

## 导出与导入路径迁移

| v0.3.x（根导出） | 0.4.x（根导出） | 备注 |
| --- | --- | --- |
| `AIClient` | `AIClient`（deprecated） | 推荐改用 `responseProvider` |
| `BaseModelProvider / OpenAIProvider` | **不再从根导出** | 如确有需要请改为内部路径导入（不推荐，可能不稳定） |
| `formatMessages / extractTextFromResponse / handleSSEStream` | **不再从根导出** | 0.4.x 根导出提供 `sseStreamToGenerator` |
| （无） | `export * from './storage'` | 新增：根导出 storage 能力 |
| `export * from './vue'` | 分拆导出 `useMessage/useConversation` + `message/types` + `plugins` | 导出粒度更清晰 |

## `useMessage` 迁移（重点）

### v0.3.x 用法（旧）

```ts
import { AIClient, useMessage } from '@opentiny/tiny-robot-kit'

const client = new AIClient({ provider: 'openai', apiKey: 'xxx' })

const {
  messages,
  messageState,
  inputMessage,
  useStream,
  sendMessage,
  abortRequest,
  retryRequest,
} = useMessage({
  client,
  useStreamByDefault: true,
  errorMessage: 'Request failed.',
})
```

### 0.4.x 用法（新）

0.4.x 的关键是你需要提供 `responseProvider(requestBody, abortSignal)`：

- **返回 `Promise<T>`**：一次性返回完整响应（非流式）
- **返回 `AsyncGenerator<T>`**：以流式/分块方式返回多个 chunk

最小示例（非流式，使用 `fetch`，仅示意）：

```ts
import { useMessage } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody } from '@opentiny/tiny-robot-kit'

const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
  // NOTE: This is just an example. Add headers/auth/model as needed.
  const resp = await fetch('/your-api/chat-completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: abortSignal,
  })
  return await resp.json()
}

const { messages, requestState, processingState, isProcessing, sendMessage, send, abortRequest } = useMessage({
  initialMessages: [],
  responseProvider,
})
```

流式示例（SSE → AsyncGenerator）：使用 `sseStreamToGenerator`

```ts
import { sseStreamToGenerator, useMessage } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody } from '@opentiny/tiny-robot-kit'

const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
  const resp = await fetch('/your-api/chat-completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...requestBody, stream: true }),
    signal: abortSignal,
  })

  // Return an AsyncGenerator that yields chunks one by one
  return sseStreamToGenerator(resp, { signal: abortSignal })
}

const engine = useMessage({ responseProvider })
```

### v0.3.x → 0.4.x 字段对照

| v0.3.x | 0.4.x | 说明 |
| --- | --- | --- |
| `messageState.status`（`STATUS` enum） | `requestState` + `processingState` | 状态机拆分：宏观状态 + 处理阶段 |
| `useStream` | 由 `responseProvider` 决定 | 0.4.x 不内置 stream 开关 |
| `inputMessage` | 不再内置 | 建议在业务层自己维护输入框状态 |
| `retryRequest(msgIndex)` | 不再内置 | 推荐通过插件/业务逻辑实现“回滚并重试” |
| `events.onReceiveData/onFinish` | `onCompletionChunk` + plugin hooks | 更强的扩展点体系 |

### 插件迁移建议

0.4.x 默认会注入一些基础插件（例如 role fallback、thinking、length 等）。你可以通过 `plugins` 追加能力，或通过同名插件覆盖/禁用默认行为。

工具调用（tool calling）推荐使用内置 `toolPlugin`（示意）：

```ts
import { toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'

const engine = useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      // Provide OpenAI tools schema
      getTools: async () => [
        // NOTE: Use JSON Schema. Keep it minimal and valid.
        {
          type: 'function',
          function: {
            name: 'getWeather',
            description: 'Get weather by city name.',
            parameters: {
              type: 'object',
              properties: { city: { type: 'string' } },
              required: ['city'],
            },
          },
        },
      ],
      // Execute a single tool call
      callTool: async (toolCall) => {
        // NOTE: Parse args safely in real apps.
        const args = JSON.parse(toolCall.function.arguments || '{}')
        return `Weather of ${args.city}: Sunny`
      },
      toolCallCancelledContent: 'Tool call cancelled.',
      toolCallFailedContent: 'Tool call failed.',
    }),
  ],
})
```

## `useConversation` 迁移

### v0.3.x（旧）

```ts
import { useConversation, AIClient } from '@opentiny/tiny-robot-kit'

const client = new AIClient({ provider: 'openai', apiKey: 'xxx' })

const { state, messageManager, createConversation, switchConversation } = useConversation({ client })
```

### 0.4.x（新）

0.4.x 的 `useConversation` 以 `useMessageOptions` 为核心（每个会话都会有自己的 `engine`）：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

const { conversations, activeConversationId, activeConversation, createConversation, switchConversation } = useConversation({
  useMessageOptions: {
    responseProvider,
  },
  autoSaveMessages: true,
  autoSaveThrottle: 1000,
})

createConversation({ title: 'New chat' })
await switchConversation(conversations.value[0].id)
activeConversation.value?.engine.sendMessage('Hello')
```

### 存储策略迁移

v0.3.x 的 storage 更偏“保存整个 conversations”；0.4.x 的 `ConversationStorageStrategy` 拆分为：

- `loadConversations()`：只加载会话列表（id/title/metadata/时间）
- `loadMessages(conversationId)`：加载指定会话的 messages
- `saveConversation(conversation)`：保存会话元信息
- `saveMessages(conversationId, messages)`：保存 messages

如果你有自定义存储，实现 0.4.x 的接口即可（并可复用既有持久化介质）。

## 迁移检查清单

- [ ] 如果你在用 `useMessage({ client })`：改为 `useMessage({ responseProvider })`
- [ ] 如果你依赖 `STATUS/messageState/inputMessage/retryRequest`：改为基于 `requestState/isProcessing` 的 UI 状态 + 自己维护输入/重试逻辑（或写插件）
- [ ] 如果你需要 tools：使用 `toolPlugin`（或自定义插件）
- [ ] 如果你用 `useConversation({ client })`：改为 `useConversation({ useMessageOptions: { responseProvider } })`
- [ ] 如果你从根导入旧 utils/providers：改为新导出或业务层实现（推荐），避免依赖内部路径
