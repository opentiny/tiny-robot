---
outline: deep
---

# 消息与数据管理 useMessage

`useMessage` 是一个用于管理消息状态和处理 AI 响应的组合式函数。它提供了完整的消息管理功能，包括发送消息、处理流式响应、管理请求状态等。

## 示例

### 基础用法

<demo vue="../../demos/tools/message/Basic.vue" :vueFiles="['../../demos/tools/message/Basic.vue']" />

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
   * 可以返回 Promise、AsyncGenerator 或 Promise<AsyncGenerator>
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

`useMessage` 支持插件系统，可以通过插件扩展功能。插件提供了多个生命周期钩子：

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
