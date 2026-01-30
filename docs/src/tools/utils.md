---
outline: [1, 3]
---

# 工具函数 Utils

:::danger 重大版本升级 v0.4
useMessage 在 v0.4 有重大变更。**从 v0.3.x 升级？** 请查看 [useMessage 迁移](../migration/use-message-migration)。
:::

工具函数模块提供了一些实用的辅助函数，用于处理流式响应。

## API

### sseStreamToGenerator

将 SSE 流转换为异步生成器。

```typescript
async function* sseStreamToGenerator<T = any>(
  response: Response,
  options: { signal?: AbortSignal } = {}
): AsyncGenerator<T, void, unknown>
```

#### 参数

- `response`: `Response` - fetch 响应对象
- `options`: `{ signal?: AbortSignal }` - 配置选项
  - `signal`: `AbortSignal` - 可选的取消信号，用于中断流处理

#### 返回值

返回一个异步生成器，产出类型为 `T` 的数据。

#### 说明

- 当取消信号被触发时，会抛出 `name` 为 `'AbortError'` 的错误
- 自动处理 SSE 格式的数据流，解析 `data:` 前缀的数据
- 当遇到 `[DONE]` 标记时，生成器会结束

---

### formatMessages

将各种格式的消息转换为标准的 `ChatMessage` 格式。

```typescript
function formatMessages(messages: Array<ChatMessage | string>): ChatMessage[]
```

#### 参数

- `messages`: `Array<ChatMessage | string>` - 消息数组，支持标准 `ChatMessage` 对象或字符串（字符串将作为 user 消息）

#### 返回值

返回标准格式的 `ChatMessage[]`。

---

### extractTextFromResponse

从聊天完成响应中提取文本内容。

```typescript
function extractTextFromResponse(response: ChatCompletionResponse): string
```

#### 参数

- `response`: `ChatCompletionResponse` - 聊天完成响应对象

#### 返回值

返回 `choices[0].message.content` 的文本内容，若无则返回空字符串。

---

### handleSSEStream

通过回调处理器处理 SSE 流式响应。

```typescript
function handleSSEStream(
  response: Response,
  handler: StreamHandler,
  signal?: AbortSignal
): Promise<void>
```

#### 参数

- `response`: `Response` - fetch 响应对象
- `handler`: `StreamHandler` - 流处理器
  - `onData`: `(data: ChatCompletionStreamResponse) => void` - 收到数据块时调用
  - `onError`: `(error: AIAdapterError) => void` - 发生错误时调用
  - `onDone`: `(finishReason?: string) => void` - 流结束时调用
- `signal`: `AbortSignal` - 可选的取消信号

#### 返回值

返回 `Promise<void>`，流处理完成后 resolve。
