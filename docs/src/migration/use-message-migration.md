---
outline: [1, 3]
---

# useMessage 迁移

本文档用于将 `useMessage` 从 **v0.3.x** 迁移到 **0.4.x**：以 `responseProvider` 替代 `client`，并引入 `requestState` / `processingState` 与插件体系。

## 概述

- **v0.3.x**：`useMessage({ client, useStreamByDefault, events... })`，内部直接调用 `client.chat` / `client.chatStream`
- **0.4.x**：`useMessage({ responseProvider, plugins... })`，由你提供数据源（Promise 或 AsyncGenerator），框架负责状态机、合并与扩展点；内置 `fallbackRolePlugin`、`thinkingPlugin`、`lengthPlugin`，工具调用使用 `toolPlugin`

## v0.3.x 用法

以下为 v0.3.x 的旧写法。

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

## 0.4.x 用法

以下为 0.4.x 的写法。需要提供 `responseProvider(requestBody, abortSignal)`：

- **返回 `Promise<T>`**：一次性返回完整响应（非流式）
- **返回 `AsyncGenerator<T>`**：以流式/分块方式返回多个 chunk

### 非流式示例

```ts
import { useMessage } from '@opentiny/tiny-robot-kit'
import type { MessageRequestBody } from '@opentiny/tiny-robot-kit'

const responseProvider = async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
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

### 流式示例

使用 `sseStreamToGenerator` 将 SSE 转为 AsyncGenerator：

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
  return sseStreamToGenerator(resp, { signal: abortSignal })
}

const engine = useMessage({ responseProvider })
```

## v0.3.x → 0.4.x 对照

| v0.3.x | 0.4.x | 说明 |
| --- | --- | --- |
| `messageState.status`（`STATUS` enum） | `requestState` + `processingState` | 状态机拆分：宏观状态 + 处理阶段 |
| `useStream` | 由 `responseProvider` 决定 | 0.4.x 不内置 stream 开关 |
| `inputMessage` | 不再内置 | 建议在业务层自己维护输入框状态 |
| `retryRequest(msgIndex)` | 不再内置 | 推荐通过插件/业务逻辑实现「回滚并重试」 |
| `events.onReceiveData` / `onFinish` | `onCompletionChunk` + plugin hooks | 更强的扩展点体系 |

## 插件迁移建议

0.4.x 默认会注入基础插件（role fallback、thinking、length 等）。可通过 `plugins` 追加能力，或通过同名插件覆盖/禁用默认行为。

工具调用推荐使用内置 `toolPlugin`：

```ts
import { toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'

const engine = useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      getTools: async () => [
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
      callTool: async (toolCall) => {
        const args = JSON.parse(toolCall.function.arguments || '{}')
        return `Weather of ${args.city}: Sunny`
      },
      toolCallCancelledContent: 'Tool call cancelled.',
      toolCallFailedContent: 'Tool call failed.',
    }),
  ],
})
```

## 导出与导入路径迁移

| v0.3.x（根导出） | 0.4.x（根导出） | 备注 |
| --- | --- | --- |
| `AIClient` | `AIClient`（deprecated） | 推荐改用 `responseProvider` |
| `BaseModelProvider` / `OpenAIProvider` | **不再从根导出** | 如确有需要请改为内部路径导入（不推荐） |
| `formatMessages` / `extractTextFromResponse` / `handleSSEStream` | **不再从根导出** | 0.4.x 根导出提供 `sseStreamToGenerator` |
| （无） | `export * from './storage'` | 新增：根导出 storage 能力 |
| `export * from './vue'` | 分拆导出 `useMessage` / `useConversation` + `message/types` + `plugins` | 导出粒度更清晰 |

## 迁移检查清单

- [ ] `useMessage({ client })` 改为 `useMessage({ responseProvider })`
- [ ] 依赖 `STATUS` / `messageState` / `inputMessage` / `retryRequest` 的，改为基于 `requestState` / `isProcessing` 的 UI 状态，并自行维护输入/重试逻辑（或写插件）
- [ ] 需要 tools 时，使用 `toolPlugin` 或自定义插件
- [ ] 若从根导入 `formatMessages`、`extractTextFromResponse`、`handleSSEStream` 或 `BaseModelProvider` / `OpenAIProvider`，改为新导出或业务层实现
