---
outline: [1, 3]
---

# useMessage 消息数据管理

:::danger 重大版本升级 v0.4
useMessage 在 v0.4 进行了重大升级，`client` 改为 `responseProvider`，状态与插件体系有变。

**从 v0.3.x 升级？** 请查看 [useMessage 迁移](../migration/use-message-migration)。

**新项目：** 直接使用下方 v0.4 的 API 和示例即可。
:::

`useMessage` 是一个用于管理消息状态和处理 AI 响应的组合式函数。它提供了完整的消息管理功能，包括发送消息、处理流式响应、管理请求状态等。

## 示例

以下示例覆盖 AI 消息交互中常见场景，可直接在项目或文档中运行。

### 基础用法

使用 `responseProvider` 发起流式请求，配合 `initialMessages` 展示欢迎语。当后端返回 SSE（Server-Sent Events）流时，可使用 `sseStreamToGenerator` 工具函数将 `fetch` 的 `Response` 转为异步生成器（`AsyncGenerator`），供 `useMessage` 逐块消费并合并到消息内容中。

<demo vue="../../demos/tools/message/Basic.vue" :vueFiles="['../../demos/tools/message/Basic.ts', '../../demos/tools/message/Basic.vue']" />

**非流式**：`responseProvider` 返回 `Promise<ChatCompletion>`，一次性得到完整结果，适用于不支持 SSE 的后端（`stream: false`）。

<demo vue="../../demos/tools/message/NonStreaming.vue" :vueFiles="['../../demos/tools/message/NonStreaming.ts', '../../demos/tools/message/NonStreaming.vue']" />

### 请求状态

根据 `requestState`（idle / processing / completed / aborted / error）和 `processingState`（requesting / completing）驱动 UI：加载、禁用发送、展示错误等。

<demo vue="../../demos/tools/message/RequestState.vue" :vueFiles="['../../demos/tools/message/RequestState.ts', '../../demos/tools/message/RequestState.vue']" />

### 修改请求参数

通过插件的 `onBeforeRequest` 钩子在请求前修改 `requestBody`（如注入 system 消息、追加 temperature 等参数）。可在 F12 开发者工具的「网络」面板中查看实际发出的请求体，验证修改是否生效。

<demo vue="../../demos/tools/message/OnBeforeRequest.vue" :vueFiles="['../../demos/tools/message/OnBeforeRequest.ts', '../../demos/tools/message/OnBeforeRequest.vue']" />

### 错误处理

通过插件的 `onError` 钩子统一处理请求错误，例如向对话中追加一条“出错”的助手消息，避免未捕获异常。

<demo vue="../../demos/tools/message/ErrorHandling.vue" :vueFiles="['../../demos/tools/message/ErrorHandling.ts', '../../demos/tools/message/ErrorHandling.vue']" />

### 模拟流式

使用不依赖真实 API 的 `responseProvider`（如本地 AsyncGenerator）模拟流式响应，便于离线开发与联调。

<demo vue="../../demos/tools/message/MockStream.vue" :vueFiles="['../../demos/tools/message/MockStream.ts', '../../demos/tools/message/MockStream.vue']" />

### 自定义 Chunk 处理

使用 `onCompletionChunk` 在收到每个响应块时做自定义逻辑（如统计、日志、转换），并调用 `runDefault()` 执行默认的内容合并。

<demo vue="../../demos/tools/message/CustomChunk.vue" :vueFiles="['../../demos/tools/message/CustomChunk.ts', '../../demos/tools/message/CustomChunk.vue']" />

### 工具调用

使用 `toolPlugin` 接入模型返回的 `tool_calls`：通过 `getTools` 注入工具列表，通过 `callTool` 执行工具并写入 tool 消息，插件会自动发起下一轮请求。本示例使用模拟 API 返回一次 `get_weather` 调用，无需真实后端。

<demo vue="../../demos/tools/message/ToolCall.vue" :vueFiles="['../../demos/tools/message/ToolCall.ts', '../../demos/tools/message/ToolCall.vue']" />

## API

```typescript
const messageComposable: UseMessageReturn = useMessage(
  options: UseMessageOptions
): UseMessageReturn
```

### 选项

`useMessage` 接受以下选项：

```typescript
interface UseMessageOptions {
  /** 初始消息列表 */
  initialMessages?: ChatMessage[]
  /**
   * 请求消息时，要包含的字段（白名单）。默认包含所有字段。
   * 如果 `requestMessageFieldsExclude` 存在，会先取 `requestMessageFields` 中的字段，再排除 `requestMessageFieldsExclude` 中的字段
   */
  requestMessageFields?: string[]
  /**
   * 请求消息时，要排除的字段（黑名单）。默认会排除 `state`、`metadata`、`loading` 字段（这几个字段是给UI展示用的）。
   * 如果 `requestMessageFields` 存在，会先取 `requestMessageFields` 中的字段，再排除 `requestMessageFieldsExclude` 中的字段
   */
  requestMessageFieldsExclude?: string[]
  /** 插件列表 */
  plugins?: UseMessagePlugin[]
  /**
   * 响应提供者函数，负责发起请求并返回响应。
   * 可返回 Promise、AsyncGenerator 或 Promise<AsyncGenerator>
   */
  responseProvider: <T = ChatCompletion>(
    requestBody: MessageRequestBody,
    abortSignal: AbortSignal,
  ) => Promise<T> | AsyncGenerator<T> | Promise<AsyncGenerator<T>>
  /**
   * 全局的数据块处理钩子，在接收到每个响应数据块时触发。
   * 注意：此钩子与插件中的 onCompletionChunk 有区别。
   * 如果传入了此参数，默认的 chunk 处理逻辑不会自动执行，需要手动调用 runDefault 来执行默认处理逻辑。
   */
  onCompletionChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      choice: CompletionChoice
      chunk: ChatCompletion
    },
    runDefault: () => void,
  ) => void
}
```

**responseProvider 返回值**：`responseProvider` 的返回值决定响应模式。返回 `Promise<T>` 时，一次性得到完整结果，适用于非流式接口，`useMessage` 会将解析出的内容整体写入消息；返回 `AsyncGenerator<T>` 或 `Promise<AsyncGenerator<T>>` 时，逐块产出数据，适用于流式接口（如 SSE），`useMessage` 会按块消费并增量合并到消息内容中。若后端返回 SSE 流，可使用 `sseStreamToGenerator` 将 `fetch` 的 `Response` 转为异步生成器。

### 返回值

`useMessage` 返回以下内容：

```typescript
interface UseMessageReturn {
  /** 请求状态 */
  requestState: Ref<RequestState>
  /** 处理状态（如 'requesting' | 'completing'） */
  processingState: Ref<RequestProcessingState | undefined>
  /** 消息列表 */
  messages: Ref<ChatMessage[]>
  /** 响应提供者（可动态更新） */
  responseProvider: Ref<UseMessageOptions['responseProvider']>
  /** 是否正在处理中 */
  isProcessing: ComputedRef<boolean>
  /** 发送消息 */
  sendMessage: (content: string) => Promise<void>
  /** 发送消息（支持传入多个消息对象） */
  send: (...msgs: ChatMessage[]) => Promise<void>
  /** 中止当前请求 */
  abortRequest: () => Promise<void>
}
```

### 请求状态类型

```typescript
/** 请求状态 */
type RequestState = 'idle' | 'processing' | 'completed' | 'aborted' | 'error'

/** 处理状态 */
type RequestProcessingState = 'requesting' | 'completing' | string
```

- `idle`: 空闲状态，没有正在进行的请求
- `processing`: 正在处理中（包含 `requesting` 和 `completing` 两个子状态）
- `completed`: 请求已完成
- `aborted`: 请求被中止
- `error`: 请求发生错误

### 插件系统

`useMessage` 支持插件系统，可以通过插件扩展功能。

**默认激活的插件**：`fallbackRolePlugin`、`thinkingPlugin`、`lengthPlugin`（无需显式添加，已自动注入）。可通过插件的 `disabled` 参数禁用，例如 `thinkingPlugin({ disabled: true })`。

**内置可选插件**：`toolPlugin`（工具调用，需添加到 `plugins` 数组中才会生效）

可通过 `plugins` 选项追加或覆盖默认插件。插件提供了多个生命周期钩子：

```typescript
interface UseMessagePlugin {
  /** 插件名称 */
  name?: string
  /** 是否禁用插件 */
  disabled?: boolean | ((context: BasePluginContext) => boolean)
  /** 对话回合开始钩子 */
  onTurnStart?: (context: BasePluginContext) => MaybePromise<void>
  /** 对话回合结束钩子 */
  onTurnEnd?: (context: BasePluginContext) => MaybePromise<void>
  /** 请求开始前钩子 */
  onBeforeRequest?: (
    context: BasePluginContext & {
      requestBody: MessageRequestBody
    },
  ) => MaybePromise<void>
  /** 请求完成后钩子 */
  onAfterRequest?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      lastChoice?: CompletionChoice
      appendMessage: (message: ChatMessage | ChatMessage[]) => void
      requestNext: () => void
    },
  ) => MaybePromise<void>
  /** 数据块处理钩子 */
  onCompletionChunk?: (
    context: BasePluginContext & {
      currentMessage: ChatMessage
      choice?: CompletionChoice
      chunk: ChatCompletion
    },
  ) => void
  /** 错误处理钩子 */
  onError?: (context: BasePluginContext & { error: unknown }) => void
  /** 最终清理钩子 */
  onFinally?: (context: BasePluginContext) => void
}
```

### 内置插件

#### fallbackRolePlugin

在请求前为 `role` 为空的消息补全角色，默认使用 `assistant`。可用于兜底上游未设置 role 的消息。**已默认激活**；若需自定义配置，可显式传入覆盖：

```typescript
import { fallbackRolePlugin, useMessage } from '@opentiny/tiny-robot-kit'

useMessage({
  responseProvider,
  plugins: [
    fallbackRolePlugin({ fallbackRole: 'assistant' }), // 可选，默认即为 'assistant'
  ],
})
```

#### lengthPlugin

当模型返回 `finish_reason === 'length'`（达到 max_tokens 或上下文限制）时，自动追加一条 user 消息（如 "Please continue with your previous answer."）并调用 `requestNext()` 继续请求，实现“自动续写”。**已默认激活**；若需自定义配置，可显式传入覆盖：

```typescript
import { lengthPlugin, useMessage } from '@opentiny/tiny-robot-kit'

useMessage({
  responseProvider,
  plugins: [
    lengthPlugin({
      continueContent: 'Please continue with your previous answer.', // 可选，默认即为此句
    }),
  ],
})
```

#### thinkingPlugin

根据流式响应中的 `reasoning_content`（或 `choice.delta.reasoning_content`）更新当前消息的 `state.thinking` 与 `state.open`；思考中时自动展开思考过程，结束后自动收起。若需禁用或自定义配置，可显式传入覆盖：

```typescript
import { thinkingPlugin, useMessage } from '@opentiny/tiny-robot-kit'

useMessage({
  responseProvider,
  plugins: [thinkingPlugin({ /* 自定义选项 */ })],
})
```

#### toolPlugin（工具调用）

用于接入模型返回的 `tool_calls`：在请求前注入 `tools` 列表，在请求完成后解析 `tool_calls`、执行 `callTool`、追加 tool 消息并自动发起下一轮请求。支持取消/失败时补充或标记 tool 消息、下一轮是否排除 tool 消息等。**需显式添加到 `plugins` 数组才会生效**。

**必选参数：**

- `getTools(): Promise<Tool[]>` — 返回当前轮次要传给 API 的工具列表（OpenAI 格式）。
- `callTool(toolCall, context): Promise<string | Record<string, any>> | AsyncGenerator<...>` — 执行单个工具调用，返回结果字符串或可流式返回的对象（会合并到对应 tool 消息的 content）。

**可选参数：**

| 参数                          | 类型                                    | 说明                                                                                                                        |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `beforeCallTools`             | `(toolCalls, context) => Promise<void>` | 在真正执行工具前调用，可用于校验或打点。                                                                                    |
| `onToolCallStart`             | `(toolCall, context) => void`           | 单个工具开始执行时回调。                                                                                                    |
| `onToolCallEnd`               | `(toolCall, context) => void`           | 单个工具结束时的回调；`context.status` 为 `'success' \| 'failed' \| 'cancelled'`，失败时可有 `context.error`。              |
| `toolCallCancelledContent`    | `string`                                | 请求被中止时，为未执行的 tool 消息填充的内容，默认 `'Tool call cancelled.'`。                                               |
| `toolCallFailedContent`       | `string`                                | 工具执行抛错时，为对应 tool 消息填充的内容，默认 `'Tool call failed.'`。                                                    |
| `autoFillMissingToolMessages` | `boolean`                               | 请求被中止时是否自动补全缺失的 tool 消息（用 `toolCallCancelledContent`），默认 `false`。                                   |
| `excludeToolMessagesNextTurn` | `boolean \| 'remove'`                   | 下一轮请求是否排除带 tool_calls 的 assistant 消息及对应 tool 消息：`true` 仅不发送，`'remove'` 从列表中移除，默认 `false`。 |

```typescript
import { toolPlugin, useMessage } from '@opentiny/tiny-robot-kit'

useMessage({
  responseProvider,
  plugins: [
    toolPlugin({
      getTools: async () => [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather by city name.',
            parameters: {
              type: 'object',
              properties: { city: { type: 'string' } },
              required: ['city'],
            },
          },
        },
      ],
      callTool: async (toolCall, context) => {
        const args = JSON.parse(toolCall.function?.arguments || '{}')
        return `Weather of ${args.city}: Sunny.`
      },
      onToolCallStart: (toolCall) => console.log('Tool start:', toolCall.function?.name),
      onToolCallEnd: (toolCall, { status }) => console.log('Tool end:', status),
      toolCallCancelledContent: 'Tool call cancelled.',
      toolCallFailedContent: 'Tool call failed.',
    }),
  ],
})
```

工具调用示例（含 `toolPlugin` 的完整对话流程）见上方示例中的「工具调用」。
