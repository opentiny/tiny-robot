---
outline: deep
---

# 工具函数 Utils

工具函数模块提供了一些实用的辅助函数，用于处理流式响应和消息格式化。

## 示例

### SSE 流式响应处理

`sseStreamToGenerator` 函数将服务器发送事件（SSE）流式响应转换为异步生成器，方便逐个处理响应数据块：

<demo vue="../../demos/tools/utils/SSEStream.vue" :vueFiles="['../../demos/tools/utils/SSEStream.vue']" />

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

#### 使用示例

```typescript
import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

// 发起流式请求
const response = await fetch('/api/chat/completions', {
  method: 'POST',
  body: JSON.stringify({ messages: [...], stream: true }),
  signal: abortSignal,
})

// 使用生成器处理流式响应
for await (const chunk of sseStreamToGenerator<ChatCompletion>(response, { signal: abortSignal })) {
  // 处理每个数据块
  console.log(chunk.choices[0]?.delta?.content)
}
```
