---
outline: [1, 3]
---

# Chat 运行时

Chat Runtime 统一会话、消息发送、模型和 MCP 状态。它可直接驱动 `TrChat`，也可通过 `useChatRuntimeAdapter` 投影为 `TrChatUI` 数据。

## 概览

| 场景           | 入口                    | 说明                                            |
| -------------- | ----------------------- | ----------------------------------------------- |
| 新建聊天页面   | `useLocalChatRuntime`   | 组装 Kit 会话、Provider 和可选 MCP。            |
| 已有 Kit 会话  | `useKitChatRuntime`     | 复用已有 `useConversation`。                    |
| 自定义 Runtime | `useChatRuntimeAdapter` | 将符合 `ChatRuntime` 协议的状态投影为界面数据。 |

`TrChat` 已内置 `useChatRuntimeAdapter`。只有直接使用 `TrChatUI` 且已有 `ChatRuntime` 时，才需要手动调用该适配器。

## 快速开始

创建 `useLocalChatRuntime` 并传给 `TrChat`。完整界面示例见 [Chat 聊天界面](./chat)。

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="['../../demos/chat/basic.vue']"
  title="创建运行时"
  description="配置模型服务后创建 Runtime，发送消息并获得回答。"
/>

## 用法示例

### 模型服务

`modelProviders` 支持 `openai`、`deepseek` 和 `qwen`。同一份配置内的模型 ID 必须唯一，第一个模型为初始选择。

```ts
import { useLocalChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

const modelProviders: ChatProviderConfig[] = [
  {
    type: 'qwen',
    label: '团队模型',
    apiUrl: '/api/model',
    headers: { 'X-Client-Name': 'my-chat' },
    timeout: 60_000,
    models: [
      {
        id: 'qwen-plus',
        label: '通义千问',
        capabilities: { thinking: true, search: true },
      },
    ],
  },
]

const runtime = useLocalChatRuntime({ modelProviders })
```

| 字段                               | 说明                                          |
| ---------------------------------- | --------------------------------------------- |
| `apiUrl`                           | 服务根地址或完整 `/chat/completions` 地址。   |
| `apiKey`                           | 默认 Bearer 认证；生产环境不要放入浏览器。    |
| `headers`                          | 额外请求头；`Authorization` 优先于 `apiKey`。 |
| `timeout`                          | 连接和流读取超时，单位为毫秒。                |
| `models[].capabilities`            | 控制 `thinking`、`search` 控件是否可用。      |
| `models[].featureBody` / `efforts` | 覆盖能力请求体或 reasoning effort 选项。      |

`useLocalChatRuntime` 的响应层二选一：提供非空 `modelProviders`，或在 `conversation.useMessageOptions.responseProvider` 中提供自定义 Provider。两者同时提供会抛错。

### 复用 Kit 会话

已有 Kit `useConversation` 时使用 `useKitChatRuntime`。Runtime 会读取已有会话、消息和请求状态。

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: { responseProvider: myResponseProvider },
})

const runtime = useKitChatRuntime({ conversation })
```

`clearActiveConversation()` 仅把当前会话设为 `null`，不会删除会话或中止请求。默认发送流程会在首条非空消息发送时创建会话；需要取消后开始新会话时，先调用 `abort()`，再调用 `clearActiveConversation()`。

### 自定义发送

默认 Runtime 拒绝 trim 后为空的文本。传入自定义 `send` 后，空文本会以 `{ text: '' }` 进入回调，由应用处理附件、会话创建、消息写入和请求。

<demo
  vue="../../demos/chat/runtime-send.vue"
  :vueFiles="['../../demos/chat/runtime-send.vue']"
  title="自定义发送"
  description="比较默认发送与自定义 send 对空文本的处理结果。"
/>

`beforeSend` 在生成本轮 `ChatRunConfig` 后执行：

| 返回值       | 结果                                            |
| ------------ | ----------------------------------------------- |
| `'continue'` | 继续默认发送。                                  |
| `'handled'`  | 应用已处理，不创建消息，也不调用自定义 `send`。 |
| `'reject'`   | 阻止发送并保留草稿。                            |

发送被禁用、已启用 MCP 工具未准备好或 `beforeSend` 返回 `'reject'` 时，`actions.send()` 返回 `false`。请求错误和校验异常会 reject 原始错误。

### MCP 和安全边界

`mcpServers` 与 `mcp` 互斥。前者适用于浏览器可访问的 Streamable HTTP 服务，后者用于自定义 transport、OAuth、权限过滤或连接复用。

```ts
const runtime = useLocalChatRuntime({
  modelProviders,
  mcpServers: [
    {
      id: 'project-tools',
      name: '项目工具',
      baseUrl: '/api/mcp/project-tools',
      installed: false,
      timeout: 30_000,
    },
  ],
})
```

`installed` 表示已安装，`enabled` 表示允许该 Server 的已启用工具进入后续请求。已启用 Server 的工具仍在加载时会阻止发送。每次发送都会生成模型、能力、reasoning 和 MCP 的 `ChatRunConfig` 快照。

生产环境使用 BFF 处理凭证、OAuth、权限、审计、限流和 CORS：

```text
Browser -> /api/mcp/project-tools -> MCP Server
```

Chat 没有稳定的附件传输协议。自定义 `send` 可收到空文本和 `structuredData`，但附件数据应由应用的 Sender、插槽或状态自行传递。

### 自定义 Runtime

自定义 Runtime 需要实现 `conversations`、`activeConversation`、`composer` 和 `actions`。将它接入 `TrChat`，或通过适配器得到 `TrChatUI` 的数据和动作：

```ts
import { useChatRuntimeAdapter } from '@opentiny/tiny-robot-chat'

const adapter = useChatRuntimeAdapter({
  runtime,
  onActionError: ({ action, error }) => report(action, error),
})

// <tr-chat-ui :data="adapter.data.value" @submit="adapter.send" />
```

适配器协调草稿、Runtime 动作错误、模型和 MCP 操作中的临时状态；不要修改它投影出的只读快照。

## API

### Composables

| 导出                    | 签名                                                                         | 说明                                  |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `useLocalChatRuntime`   | `(options: UseLocalChatRuntimeOptions) => ChatRuntime`                       | 创建默认 Runtime。                    |
| `useKitChatRuntime`     | `(options: UseKitChatRuntimeOptions) => ChatRuntime`                         | 包装 Kit 会话。                       |
| `useChatRuntimeAdapter` | `(options: UseChatRuntimeAdapterOptions) => ChatRuntimeAdapter`              | 将 Runtime 投影为 ChatUI 数据和动作。 |
| `useChatHistoryItems`   | `(options: UseChatHistoryItemsOptions) => ShallowRef<ChatHistoryItem[]>`     | 规范化平铺历史项。                    |
| `useChatHistoryData`    | `(options: UseChatHistoryDataOptions) => ShallowRef<ChatHistoryDisplayData>` | 规范化平铺或分组历史数据。            |

### Runtime 协议

`ChatReadable<T>` 为只读 `{ readonly value: T }`，`ChatWritable<T>` 为可写 `{ value: T }`。所有 Runtime 状态字段使用这两个结构协议。

| 类型                  | 字段                                                                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ChatRuntime`         | `conversations: ChatReadable<readonly ChatConversationInfo[]>`；`activeConversation: ChatReadable<ChatConversation \| null>`；`composer: ChatComposerRuntime`；`actions: ChatRuntimeActions`                                                                                                           |
| `ChatRuntimeActions`  | `send(payload): Promise<boolean>`；`abort?()`；`clearActiveConversation()`；`createConversation(payload?: { title?: string; metadata?: Record<string, unknown> })`；`switchConversation(id)`；`renameConversation(id, title)`；`deleteConversation(id)`                                                |
| `ChatComposerRuntime` | `disabled?: ChatReadable<boolean>`；`submitDisabled?: ChatReadable<boolean>`；`model?: ChatModelRuntime`；`mcp?: ChatMcpRuntime`                                                                                                                                                                       |
| `ChatModelRuntime`    | `options: ChatReadable<readonly ChatModelOption[]>`；`selectedId: ChatReadable<string \| null>`；`features: ChatReadable<Partial<Record<'thinking' \| 'search', boolean>>>`；`reasoning?: ChatReadable<ChatRunConfigReasoning>`；`select(id)`；`setFeature(id, enabled)`；`setReasoningEffort(effort)` |
| `ChatMcpRuntime`      | `servers: ChatReadable<readonly ChatMcpServerInfo[]>`；`tools: ChatReadable<ChatMcpToolState>`；`addServer(id)`；`removeServer(id)`；`setServerEnabled(id, enabled)`；`setToolEnabled(serverId, toolId, enabled)`                                                                                      |

### 配置与数据类型

#### 会话、消息与发送

| 类型                                         | 字段                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatConversationInfo`                       | `id: string`；`title: string`；`createdAt?: number`；`updatedAt?: number`；`metadata?: Record<string, unknown>`；允许额外业务字段 `[key: string]: unknown`。                                                                                                                 |
| `ChatConversation`                           | 继承 `ChatConversationInfo`；`messages: readonly ChatMessageItem[]`；`requestState: 'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`；`processingState?: 'requesting' \| 'completing' \| string`；`lastError?: unknown \| null`                    |
| `ChatMessageItem`                            | `role?: string`；`content?: string \| ChatMessagePart[]`；`reasoning_content?: string`；`tool_calls?: ChatToolCall[]`；`tool_call_id?: string`；`name?: string`；`id?: string`；`loading?: boolean`；`state?: Record<string, unknown>`；`metadata?: Record<string, unknown>` |
| `ChatMessagePart` / `ChatStructuredDataItem` | `type: string`，可追加业务字段。                                                                                                                                                                                                                                             |
| `ChatToolCall`                               | `id: string`；`type: 'function' \| string`；`function: { name: string; arguments: string }`                                                                                                                                                                                  |
| `ChatSendPayload`                            | `text: string`；`structuredData?: ChatStructuredData`                                                                                                                                                                                                                        |

#### 模型与 MCP

| 类型                            | 字段                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatModelOption`               | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`efforts?: readonly ModelSelectorReasoningEffortOption[]`；`defaultEffort?: string`；`thinkingRequired?: boolean`；`capabilities?: Partial<Record<'thinking' \| 'search', boolean>>`；`metadata?: Record<string, unknown>` |
| `ChatMcpServerInfo`             | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`                                                                                                                           |
| `ChatMcpToolInfo`               | `id: string`；`name: string`；`description?: string`；`enabled: boolean`                                                                                                                                                                                                                                                                     |
| `ChatMcpToolState`              | `Partial<Record<string, readonly ChatMcpToolInfo[]>>`，键为 Server ID。                                                                                                                                                                                                                                                                      |
| `ChatProviderConfig`            | `type: 'openai' \| 'deepseek' \| 'qwen'`；`label?: string`；`apiUrl?: string`；`apiKey?: string`；`headers?: Record<string, string>`；`timeout?: number`；`models: ChatProviderModelConfig[]`                                                                                                                                                |
| `ChatProviderModelConfig`       | 继承 `ChatModelOption`，不含 `metadata`；`featureBody?: Partial<Record<'thinking' \| 'search', ChatProviderFeatureBody>>`；`effortParam?: string`                                                                                                                                                                                            |
| `ChatProviderFeatureBody`       | `enabled?: Record<string, unknown>`；`disabled?: Record<string, unknown>`                                                                                                                                                                                                                                                                    |
| `ChatMcpServerConfig`           | `id: string`；`name: string`；`baseUrl: string`；`installed?: boolean`；`description?: string`；`icon?: string`；`headers?: Record<string, string>`；`timeout?: number`；`validate?: (serverId: string) => void`                                                                                                                             |
| `ChatMcpServers`                | `readonly ChatMcpServerConfig[]`                                                                                                                                                                                                                                                                                                             |
| `UseLocalChatRuntimeMcpAdapter` | `runtime: ChatMcpRuntime`；`listTools`；`callTool`。后两项来自 Chat 的 MCP Tool 插件协议。                                                                                                                                                                                                                                                   |

#### 发送与请求快照

| 类型                            | 字段                                                                                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRunConfig`                 | `modelId?: string`；`features?: Partial<Record<'thinking' \| 'search', boolean>>`；`reasoning?: ChatRunConfigReasoning`；`mcp?: ChatMcpRunConfig`              |
| `ChatRunConfigReasoning`        | `enabled: boolean`；`effort?: string`                                                                                                                          |
| `ChatMcpRunConfig`              | `serverIds: readonly string[]`；`toolIds: Readonly<Record<string, readonly string[]>>`                                                                         |
| `ChatBeforeSendContext`         | `payload: ChatSendPayload`；`runConfig?: ChatRunConfig`；`model?: ChatModelOption`；`mcp?: { servers: readonly ChatMcpServerInfo[]; tools: ChatMcpToolState }` |
| `ChatBeforeSend`                | `(context: ChatBeforeSendContext) => 'continue' \| 'handled' \| 'reject' \| Promise<'continue' \| 'handled' \| 'reject'>`                                      |
| `ChatRuntimeActionErrorPayload` | `action` 为 `send`、`abort`、会话 CRUD、模型或 MCP 动作名；`payload?: unknown`；`error: unknown`                                                               |

#### Composable 配置

| 类型                           | 字段                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UseLocalChatRuntimeOptions`   | `conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']> }`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`composer?: Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`；`modelProviders?: readonly ChatProviderConfig[]`；`mcp?: UseLocalChatRuntimeMcpAdapter`；`mcpServers?: ChatMcpServers` |
| `UseKitChatRuntimeOptions`     | `conversation: UseConversationReturn`；`lastError?: ChatWritable<unknown \| null>`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`send?: (payload: ChatSendPayload & { runConfig?: ChatRunConfig }) => void \| Promise<void>`；`composer?: ChatComposerRuntime`                                                                                                                                |
| `UseChatRuntimeAdapterOptions` | `runtime: MaybeRefOrGetter<ChatRuntime>`；`title?: MaybeRefOrGetter<string \| undefined>`；`historyData?: MaybeRefOrGetter<ChatHistoryData \| undefined>`；`onActionError: (payload: ChatRuntimeActionErrorPayload) => void`                                                                                                                                                                                                  |
| `UseChatHistoryItemsOptions`   | `conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] \| undefined>`；`defaultTitle: MaybeRefOrGetter<string>`                                                                                                                                                                                                                                                                                                     |
| `UseChatHistoryDataOptions`    | 继承 `UseChatHistoryItemsOptions`；`history?: MaybeRefOrGetter<ChatHistoryData \| undefined>`                                                                                                                                                                                                                                                                                                                                 |
| `ChatHistoryItem`              | 继承 `ChatConversationInfo`；`raw: ChatConversationInfo`                                                                                                                                                                                                                                                                                                                                                                      |
| `ChatHistoryDisplayData`       | `ChatHistoryItem[] \| HistoryGroup<ChatHistoryItem>[]`                                                                                                                                                                                                                                                                                                                                                                        |

`UseConversationOptions`、`UseConversationReturn` 来自 `@opentiny/tiny-robot-kit`；`MaybeRefOrGetter` 来自 Vue；`ModelSelectorReasoningEffortOption`、`HistoryGroup` 和 `ChatIcon` 的底层图标类型来自 `@opentiny/tiny-robot`。这些外部类型请参阅各自的 API。

## 常见问题

### `send()` 返回 `false`

检查文本是否为空、Composer 是否禁用、已启用 MCP 工具是否加载完成，以及 `beforeSend` 是否返回 `'reject'`。自定义 `useKitChatRuntime({ send })` 可以接收空文本。

### 模型服务与自定义 Provider 冲突

`modelProviders` 与 `conversation.useMessageOptions.responseProvider` 只能提供其中一个响应层来源。

### MCP Server 无法连接

确认地址可从浏览器访问、服务允许 CORS，或改为通过 BFF 代理。不要把生产凭证写入浏览器配置。
