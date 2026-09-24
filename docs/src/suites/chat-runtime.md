---
outline: [1, 3]
---

# Chat 运行时

Chat Runtime 统一会话、消息发送、模型和 MCP 状态。新建聊天页面使用 `useChatRuntime`，已有 Kit 会话使用 `useChatRuntimeFromConversation`。

## 概览

### 适用场景

| 场景          | Runtime               | 使用组件              | 说明                                               |
| ------------- | --------------------- | --------------------- | -------------------------------------------------- |
| 新建聊天页面  | `useChatRuntime` | `TrChat`              | 创建完整聊天页面并配置模型服务和可选 MCP。         |
| 已有 Kit 会话 | `useChatRuntimeFromConversation`   | `TrChat` / `TrChatUI` | 复用已有 `useConversation`，接入完整或自定义界面。 |

## 快速开始

创建 `useChatRuntime` 并传给 `TrChat`。

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="创建运行时"
  description="配置模型服务后创建 Runtime，发送消息并获得回答。"
/>

## Runtime 场景与配置

### 模型服务

`modelProviders` 支持 `openai`、`deepseek` 和 `qwen`。同一份配置内的模型 ID 必须唯一，第一个模型为初始选择。

```ts
import { useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

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

const runtime = useChatRuntime({ modelProviders })
```

| 字段                               | 说明                                          |
| ---------------------------------- | --------------------------------------------- |
| `apiUrl`                           | 服务根地址或完整 `/chat/completions` 地址。   |
| `apiKey`                           | 默认 Bearer 认证；生产环境不要放入浏览器。    |
| `headers`                          | 额外请求头；`Authorization` 优先于 `apiKey`。 |
| `timeout`                          | 连接和流读取超时，单位为毫秒。                |
| `models[].capabilities`            | 控制 `thinking`、`search` 控件是否可用。      |
| `models[].featureBody` / `efforts` | 覆盖能力请求体或 reasoning effort 选项。      |

`useChatRuntime` 的响应层二选一：提供非空 `modelProviders`，或在 `conversation.useMessageOptions.responseProvider` 中提供自定义 Provider。两者同时提供会抛错。

### 复用 Kit 会话

已有 Kit `useConversation` 时使用 `useChatRuntimeFromConversation`。它只适配已有会话、消息和请求状态，不会修改该会话的插件配置，也不会自动安装错误状态插件。

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: { responseProvider: myResponseProvider },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

将 Runtime 直接传给 `TrChat` 可以使用完整聊天页面。使用 `TrChatUI` 时，应用负责将会话、消息和请求状态组织为界面数据，并处理界面事件；`TrChatUI` 本身不接收 `runtime`。

`clearActiveConversation()` 仅把当前会话设为 `null`，不会删除会话或中止请求。默认发送流程会在首条非空消息发送时创建会话；需要取消后开始新会话时，先调用 `abort()`，再调用 `clearActiveConversation()`。

### 发送配置

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

### 把请求错误保存到消息

`useChatRuntime` 创建 conversation 时会默认安装 `errorStatePlugin()`。Provider 失败后，插件把规范化错误写入当前回合最后一条 assistant 消息的 `state.error`；错误与消息一起由 conversation 持久化。Engine 发请求时仍按默认规则排除 `state`、`metadata` 和 `loading`，所以这些界面状态不会发送给模型。

<demo
  vue="../../demos/chat/runtime-error.vue"
  :vueFiles="['../../demos/chat/runtime-error.vue']"
  title="本地 Runtime 错误状态"
  description="触发确定性请求失败，观察错误归属、Promise 传播和后续成功发送。"
/>

`useChatRuntimeFromConversation` 不安装插件。适配已有 conversation 时，需要在创建 conversation 的位置显式加入：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'
import { errorStatePlugin, useChatRuntimeFromConversation } from '@opentiny/tiny-robot-chat'

const conversation = useConversation({
  useMessageOptions: {
    responseProvider,
    plugins: [errorStatePlugin()],
  },
})

const runtime = useChatRuntimeFromConversation({ conversation })
```

常用配置：

```ts
import { ERROR_STATE_PLUGIN_NAME, errorStatePlugin, type ChatErrorPluginContext } from '@opentiny/tiny-robot-chat'
import type { UseMessagePlugin } from '@opentiny/tiny-robot-kit'

// 禁用 useChatRuntime 的默认错误写入。
const disabled = errorStatePlugin({ disabled: true })

// 返回 null 或 undefined 时，本次不写 message.state.error。
const normalized = errorStatePlugin({
  normalizeError(error, _context) {
    return error instanceof Error ? { message: error.message } : null
  },
})

// 同名用户插件会替换默认 Runtime 的内置插件。
const replacement: UseMessagePlugin = {
  name: ERROR_STATE_PLUGIN_NAME,
  onError(context: ChatErrorPluginContext) {
    // 记录、规范化或写入应用需要的消息状态。
  },
}
```

`onError` 是观察与状态写入钩子。所有已启用的 `onError` 执行后，请求 Promise 仍会 reject 原始错误；`TrChat` 因此仍会发出 `runtime-action-error`。该事件适合遥测或非消息动作反馈，不应再复制一份 send 错误详情到页面顶部。

### MCP 配置与安全边界

`mcpServers` 与 `mcp` 互斥。前者适用于浏览器可访问的 Streamable HTTP 服务，后者用于自定义 transport、OAuth、权限过滤或连接复用。

```ts
const runtime = useChatRuntime({
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

## API

### Composables

| 导出                    | 签名                                                                         | 说明                                          |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| `useChatRuntime`   | `(options: UseChatRuntimeOptions) => ChatRuntime`                       | 创建默认 Runtime。                            |
| `useChatRuntimeFromConversation`     | `(options: UseChatRuntimeFromConversationOptions) => ChatRuntime`                         | 包装 Kit 会话。                               |
| `useChatRuntimeAdapter` | `(options: UseChatRuntimeAdapterOptions) => adapter`                         | 把 Runtime 转换为 `TrChatUI` 数据与标准动作。 |
| `useChatHistoryItems`   | `(options: UseChatHistoryItemsOptions) => ShallowRef<ChatHistoryItem[]>`     | 规范化平铺历史项。                            |
| `useChatHistoryData`    | `(options: UseChatHistoryDataOptions) => ShallowRef<ChatHistoryDisplayData>` | 规范化平铺或分组历史数据。                    |
| `errorStatePlugin`      | `(options?: ErrorStatePluginOptions) => UseMessagePlugin`                    | 把请求错误写入所属 assistant 消息。           |

### 错误状态插件

| 导出                      | 类型或签名                                                                                                                   | 说明                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `ERROR_STATE_PLUGIN_NAME` | `'error-state'`                                                                                                              | 默认插件名；同名用户插件可替换默认 Runtime 的内置实现。          |
| `ErrorStatePluginOptions` | `{ disabled?: UseMessagePlugin['disabled']; normalizeError?: (error: unknown, context: ChatErrorPluginContext) => unknown }` | 控制启用状态和写入 `state.error` 前的规范化。                    |
| `ChatErrorPluginContext`  | `Parameters<NonNullable<UseMessagePlugin['onError']>>[0]`                                                                    | `normalizeError` 与自定义错误插件可使用的完整 `onError` 上下文。 |

`normalizeError` 默认把原生 `Error` 转为 `{ name, message, code? }`，把其他值转为 `{ message: String(error) }`。返回 `null` 或 `undefined` 会跳过本次写入；插件找不到本轮 assistant 消息时也不会创建额外消息。

### Runtime 协议

`ChatReadable<T>` 为只读 `{ readonly value: T }`，当前 `ChatRuntime` 状态使用该结构协议。公开的 `ChatWritable<T>` 是可写 `{ value: T }` 结构，可供兼容适配层使用，但 Runtime 不再通过它暴露请求错误。

| 类型                  | 字段                                                                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ChatReadable<T>`     | 只读 `{ readonly value: T }` 结构。                                                                                                                                                                                                                                                                    |
| `ChatWritable<T>`     | 可写 `{ value: T }` 结构；用于兼容适配层。                                                                                                                                                                                                                                                             |
| `ChatRuntime`         | `conversations: ChatReadable<readonly ChatConversationInfo[]>`；`activeConversation: ChatReadable<ChatConversation \| null>`；`conversationNavigationRevision?: ChatReadable<number>`；`composer: ChatComposerRuntime`；`actions: ChatRuntimeActions`                                                  |
| `ChatRuntimeActions`  | `send(payload): Promise<boolean>`；`abort?()`；`clearActiveConversation()`；`createConversation(payload?: { title?: string; metadata?: Record<string, unknown> })`；`switchConversation(id)`；`renameConversation(id, title)`；`deleteConversation(id)`                                                |
| `ChatComposerRuntime` | `disabled?: ChatReadable<boolean>`；`submitDisabled?: ChatReadable<boolean>`；`model?: ChatModelRuntime`；`mcp?: ChatMcpRuntime`                                                                                                                                                                       |
| `ChatModelRuntime`    | `options: ChatReadable<readonly ChatModelOption[]>`；`selectedId: ChatReadable<string \| null>`；`features: ChatReadable<Partial<Record<'thinking' \| 'search', boolean>>>`；`reasoning?: ChatReadable<ChatRunConfigReasoning>`；`select(id)`；`setFeature(id, enabled)`；`setReasoningEffort(effort)` |
| `ChatMcpRuntime`      | `servers: ChatReadable<readonly ChatMcpServerInfo[]>`；`tools: ChatReadable<ChatMcpToolState>`；`addServer(id)`；`removeServer(id)`；`setServerEnabled(id, enabled)`；`setToolEnabled(serverId, toolId, enabled)`                                                                                      |

### 配置与数据类型

#### 会话、消息与发送

| 类型                                         | 字段                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatConversationInfo`                       | `id: string`；`title: string`；`createdAt?: number`；`updatedAt?: number`；`metadata?: Record<string, unknown>`；允许额外自定义字段 `[key: string]: unknown`。                                                                                                               |
| `ChatConversation`                           | 继承 `ChatConversationInfo`；`messages: readonly ChatMessageItem[]`；`requestState: 'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`；`processingState?: 'requesting' \| 'completing' \| string`                                                   |
| `ChatMessageItem`                            | `role?: string`；`content?: string \| ChatMessagePart[]`；`reasoning_content?: string`；`tool_calls?: ChatToolCall[]`；`tool_call_id?: string`；`name?: string`；`id?: string`；`loading?: boolean`；`state?: Record<string, unknown>`；`metadata?: Record<string, unknown>` |
| `ChatMessageContent`                         | `string \| ChatMessagePart[]`                                                                                                                                                                                                                                                |
| `ChatMessagePart` / `ChatStructuredDataItem` | `type: string`，可追加自定义字段。                                                                                                                                                                                                                                           |
| `ChatStructuredData`                         | `ChatStructuredDataItem[]`                                                                                                                                                                                                                                                   |
| `ChatToolCall`                               | `id: string`；`type: 'function' \| string`；`function: { name: string; arguments: string }`                                                                                                                                                                                  |
| `ChatSendPayload`                            | `text: string`；`structuredData?: ChatStructuredData`                                                                                                                                                                                                                        |
| `ChatRequestState`                           | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'`                                                                                                                                                                                                  |
| `ChatProcessingState`                        | `'requesting' \| 'completing' \| string`                                                                                                                                                                                                                                     |

#### 模型与 MCP

| 类型                            | 字段                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatModelOption`               | `id: string`；`label: string`；`description?: string`；`icon?: ChatIcon`；`disabled?: boolean`；`group?: string`；`efforts?: readonly ModelSelectorReasoningEffortOption[]`；`defaultEffort?: string`；`thinkingRequired?: boolean`；`capabilities?: Partial<Record<'thinking' \| 'search', boolean>>`；`metadata?: Record<string, unknown>` |
| `ChatMcpServerInfo`             | `id: string`；`name: string`；`description?: string`；`icon?: string`；`category?: string`；`installed: boolean`；`enabled: boolean`；`loading?: boolean`；`error?: unknown`；`metadata?: Record<string, unknown>`                                                                                                                           |
| `ChatMcpToolInfo`               | `id: string`；`name: string`；`description?: string`；`enabled: boolean`                                                                                                                                                                                                                                                                     |
| `ChatMcpToolState`              | `Partial<Record<string, readonly ChatMcpToolInfo[]>>`，键为 Server ID。                                                                                                                                                                                                                                                                      |
| `ChatProviderConfig`            | `type: 'openai' \| 'deepseek' \| 'qwen'`；`label?: string`；`apiUrl?: string`；`apiKey?: string`；`headers?: Record<string, string>`；`timeout?: number`；`models: ChatProviderModelConfig[]`                                                                                                                                                |
| `ChatProviderType`              | `'openai' \| 'deepseek' \| 'qwen'`                                                                                                                                                                                                                                                                                                           |
| `ChatProviderModelConfig`       | 继承 `ChatModelOption`，不含 `metadata`；`featureBody?: Partial<Record<'thinking' \| 'search', ChatProviderFeatureBody>>`；`effortParam?: string`                                                                                                                                                                                            |
| `ChatProviderFeatureBody`       | `enabled?: Record<string, unknown>`；`disabled?: Record<string, unknown>`                                                                                                                                                                                                                                                                    |
| `ChatResolvedProviderModel`     | 继承 `ChatProviderModelConfig`；补充解析后的 Provider 类型、名称、请求地址、认证与超时配置。                                                                                                                                                                                                                                                 |
| `ChatBuiltInModelFeature`       | `'thinking' \| 'search'`                                                                                                                                                                                                                                                                                                                     |
| `ChatIcon`                      | `ModelSelectorOption['icon']`                                                                                                                                                                                                                                                                                                                |
| `ChatMcpServerConfig`           | `id: string`；`name: string`；`baseUrl: string`；`installed?: boolean`；`description?: string`；`icon?: string`；`headers?: Record<string, string>`；`timeout?: number`；`validate?: (serverId: string) => void`                                                                                                                             |
| `ChatMcpServers`                | `readonly ChatMcpServerConfig[]`                                                                                                                                                                                                                                                                                                             |
| `UseChatRuntimeMcpAdapter` | `runtime: ChatMcpRuntime`；`listTools`；`callTool`。后两项来自 Chat 的 MCP Tool 插件协议。                                                                                                                                                                                                                                                   |

#### 发送与请求快照

| 类型                            | 字段                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatRunConfig`                 | `modelId?: string`；`features?: Partial<Record<'thinking' \| 'search', boolean>>`；`reasoning?: ChatRunConfigReasoning`；`mcp?: ChatMcpRunConfig`                                                                                                                                                                                                                               |
| `ChatRunConfigReasoning`        | `enabled: boolean`；`effort?: string`                                                                                                                                                                                                                                                                                                                                           |
| `ChatMcpRunConfig`              | `serverIds: readonly string[]`；`toolIds: Readonly<Record<string, readonly string[]>>`                                                                                                                                                                                                                                                                                          |
| `ChatBeforeSendContext`         | `payload: ChatSendPayload`；`runConfig?: ChatRunConfig`；`model?: ChatModelOption`；`mcp?: { servers: readonly ChatMcpServerInfo[]; tools: ChatMcpToolState }`                                                                                                                                                                                                                  |
| `ChatBeforeSendResult`          | `'continue' \| 'handled' \| 'reject'`                                                                                                                                                                                                                                                                                                                                           |
| `ChatBeforeSend`                | `(context: ChatBeforeSendContext) => 'continue' \| 'handled' \| 'reject' \| Promise<'continue' \| 'handled' \| 'reject'>`                                                                                                                                                                                                                                                       |
| `ChatRuntimeActionErrorPayload` | `action: 'send' \| 'abort' \| 'clear-active-conversation' \| 'create-conversation' \| 'switch-conversation' \| 'rename-conversation' \| 'delete-conversation' \| 'select-model' \| 'set-model-feature' \| 'set-model-reasoning-effort' \| 'add-mcp-server' \| 'remove-mcp-server' \| 'set-mcp-server-enabled' \| 'set-mcp-tool-enabled'`；`payload?: unknown`；`error: unknown` |

#### Composable 配置

| 类型                           | 字段                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UseChatRuntimeOptions`   | `conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & { useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']> }`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`composer?: Pick<ChatComposerRuntime, 'disabled' \| 'submitDisabled'>`；`modelProviders?: readonly ChatProviderConfig[]`；`mcp?: UseChatRuntimeMcpAdapter`；`mcpServers?: ChatMcpServers` |
| `UseChatRuntimeFromConversationOptions`     | `conversation: UseConversationReturn`；`titleGenerator?: (text: string) => string`；`beforeSend?: ChatBeforeSend`；`send?: (payload: ChatSendPayload & { conversationId: string \| null; runConfig?: ChatRunConfig }) => void \| Promise<void>`；`composer?: ChatComposerRuntime`                                                                                                                                             |
| `UseChatRuntimeAdapterOptions` | `runtime: MaybeRefOrGetter<ChatRuntime>`；`title?: MaybeRefOrGetter<string \| undefined>`；`historyData?: MaybeRefOrGetter<ChatHistoryData \| undefined>`；`onActionError(payload)`                                                                                                                                                                                                                                           |
| `UseChatHistoryItemsOptions`   | `conversations: MaybeRefOrGetter<readonly ChatConversationInfo[] \| undefined>`；`defaultTitle: MaybeRefOrGetter<string>`                                                                                                                                                                                                                                                                                                     |
| `UseChatHistoryDataOptions`    | 继承 `UseChatHistoryItemsOptions`；`history?: MaybeRefOrGetter<ChatHistoryData \| undefined>`                                                                                                                                                                                                                                                                                                                                 |
| `ChatHistoryItem`              | 继承 `ChatConversationInfo`；`raw: ChatConversationInfo`                                                                                                                                                                                                                                                                                                                                                                      |
| `ChatHistoryDisplayData`       | `ChatHistoryItem[] \| HistoryGroup<ChatHistoryItem>[]`                                                                                                                                                                                                                                                                                                                                                                        |

`UseConversationOptions`、`UseConversationReturn` 来自 `@opentiny/tiny-robot-kit`；`MaybeRefOrGetter` 来自 Vue；`ModelSelectorReasoningEffortOption`、`HistoryGroup` 和 `ChatIcon` 的底层图标类型来自 `@opentiny/tiny-robot`。这些外部类型请参阅各自的 API。

## 常见问题

### `send()` 返回 `false`

检查文本是否为空、Composer 是否禁用、已启用 MCP 工具是否加载完成，以及 `beforeSend` 是否返回 `'reject'`。自定义 `useChatRuntimeFromConversation({ send })` 可以接收空文本。

### 模型服务与自定义 Provider 冲突

`modelProviders` 与 `conversation.useMessageOptions.responseProvider` 只能提供其中一个响应层来源。

### MCP Server 无法连接

确认地址可从浏览器访问、服务允许 CORS，或改为通过 BFF 代理。不要把生产凭证写入浏览器配置。
