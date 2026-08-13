# ChatRuntime 运行时协议

## 1. 分层

```txt
业务数据层 / Kit / 自研 Store
  -> ChatRuntime
  -> TrChat
  -> ChatUIData + ChatUIOptions
  -> TrChatUI
  -> 根级 Emits
  -> TrChat
  -> ChatRuntime.actions
```

| 层级 | 职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求状态、Composer 状态和业务动作 |
| `useChatRuntimeAdapter` | Runtime 到 UI 的数据投影、草稿协调、动作执行和临时 pending |
| `TrChatUI` | 纯 UI Shell、输入状态和根级 Emits |
| 业务数据层 | Provider、凭证、Transport 和消息引擎 |

`useChatRuntimeAdapter` 不负责 MCP 自动加载、业务去重或 `runConfig` 构造。`useLocalChatRuntime` 组装 Kit、Provider、MCP Adapter 和 Plugin；声明式 `mcpServers` 由默认 Adapter 负责连接与 Tool 生命周期，高级 `mcp` 入口保留给特殊协议。

## 2. 核心协议

```ts
export interface ChatReadable<T> {
  readonly value: T
}

export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}
```

`conversations` 只提供会话摘要，`activeConversation` 提供当前会话的消息、请求状态、处理状态和错误。

```ts
export interface ChatRuntimeActions {
  send: (payload: ChatSendPayload) => Promise<boolean>
  abort?: () => Promise<void> | void
  createConversation: (payload?: {
    title?: string
    metadata?: Record<string, unknown>
  }) => Promise<void> | void
  switchConversation: (id: string) => Promise<void> | void
  renameConversation: (id: string, title: string) => Promise<void> | void
  deleteConversation: (id: string) => Promise<void> | void
}
```

`send()` 返回：

- `true`：Runtime 接受发送。
- `false`：发送资格不满足，没有创建消息。
- reject：消息引擎、网络或业务请求失败。

## 3. Composer

```ts
export interface ChatComposerRuntime {
  disabled?: ChatReadable<boolean>
  submitDisabled?: ChatReadable<boolean>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}
```

`useKitChatRuntime` 会统一派生最终 `submitDisabled`：

```ts
const submitDisabled = computed(
  () => Boolean(source.submitDisabled?.value) || !areEnabledMcpToolsReady(source.mcp),
)
```

自定义 Runtime 必须保证 `submitDisabled` 覆盖所有发送前置条件。

## 4. TrChat 适配流程

```txt
ChatUI update:inputValue
  -> useChatRuntimeAdapter / useChatDraft 保存草稿

ChatUI submit
  -> useChatDraft trim 文本
  -> 立即清空草稿
  -> runtime.actions.send({ text, structuredData })
  -> Runtime 请求

Runtime 返回 false 或 reject
  -> useChatDraft 恢复发送前草稿
```

发送 reject 不由 Adapter 静默吞掉。Runtime 负责把错误写入 `activeConversation.lastError`，Adapter 将其投影为 `ChatUIData.request.error`，并通过 `runtime-action-error` 将 `{ action, payload, error }` 派发给外部。

ChatUI 的公共输入事件为 `update:inputValue`。`ChatComposer` 的 `update:value` 仅是 ChatUI 内部事件，不属于 Runtime 或 ChatUI 公共协议。ChatUI 不负责提交后自动清空，草稿清空和失败恢复由 useChatDraft 负责。输入模式在组件生命周期内不得从受控切换为非受控，或反向切换。

`sender.loading` 继续由 `requestState === 'processing'` 派生。Runtime 不新增 `operations`、`streaming` 等状态。

## 5. UI 数据投影

`useChatRuntimeAdapter` 映射：

| Runtime | ChatUIData |
| --- | --- |
| `conversations.value` | `conversation.items` |
| `activeConversation.id/title` | `conversation.activeId/title` |
| `activeConversation.messages` | `bubble.messages` |
| `activeConversation.requestState` | `request.state` |
| `activeConversation.processingState` | `request.processingState` |
| `activeConversation.lastError` | `request.error` |
| `composer.disabled` | `sender.disabled` |
| `composer.submitDisabled` | `sender.submitDisabled` |
| `requestState === 'processing'` | `sender.loading` |
| `composer.model` | `model` |
| `composer.mcp` | `mcp` |

## 6. Model 和 MCP 事件

`TrChatUI` 只派发根级事件：

```txt
model-select
model-feature-change
mcp-add-server
mcp-remove-server
mcp-server-enabled-change
mcp-tool-enabled-change
```

`useChatRuntimeAdapter` 负责调用 Runtime action、并发去重、pending 状态和错误记录。所有 Runtime action 的 reject 都通过 `runtime-action-error` 报告；`send` 报告后返回 `false` 以触发草稿恢复，`abort`、会话 CRUD、Model 和 MCP 动作报告后由 Adapter 消费，避免未处理 Promise rejection。ChatUI 不等待这些动作，也不修改业务 Data。

`TrChat` 继续消费会话、提交、Model 和 MCP 事件，不向外重复转发。Prompt、Bubble 和 Aside 事件原样向外转发；`history-action` 的 `delete` 调用 `deleteConversation`，其他 action 向外转发。Aside 的 `open-change` 事件中，`user` 表示用户点击 Header、Aside 或 Drawer 等控制，`viewport` 表示响应式断点切换导致组件主动关闭 Aside。外部修改 `layout.*Aside.open` 只影响展示，不派发事件。

MCP Tool 加载是 Server 生命周期的一部分：

- `addServer()` 负责安装、启用并加载 Tool。
- `setServerEnabled(id, true)` 负责加载 Tool。
- `setServerEnabled(id, false)` 清空当前 Runtime 实例内该 Server 的 Tool 状态和定义缓存；重新启用会重新发现 Tool。
- `removeServer()` 清理当前 Server 的 Tool 状态。
- 加载失败时更新 Server 状态并抛出错误。

声明式 MCP：

- `mcpServers` 是包含 `id` 的只读数组，只描述 Server 名称、地址、应用层 headers、超时、校验函数和可选的 `installed` 初始状态。
- `installed: true` 仅表示默认 Adapter 创建时初始已安装；Server 初始仍未启用，不会自动连接或发现 Tool。
- 默认 Adapter 仅支持 `streamableHttp`，每次 discovery/call 创建并关闭一个 SDK Client，不维护连接池。
- 同一 Server 的并发 discovery/load 只执行一次；删除、禁用或失败会失效缓存，旧请求不能回写当前状态。
- `addServer`、`removeServer` 和启用状态只作用于当前 Runtime 实例；禁用 Server 会清空该实例的 Tool 状态和定义缓存，重新启用会重新发现 Tool。
- `ChatMcpServerInfo.error` 区分用户禁用和加载失败；异步错误继续向 Runtime action reject。
- `mcp` 与 `mcpServers` 不能同时传入；未传入 MCP 配置时不创建 Adapter 或 MCP Plugin。

## 7. RunConfig

`ChatRunConfig` 是消息请求快照，不是 `send()` 参数。

```ts
export interface ChatRunConfig {
  modelId?: string
  features?: Readonly<Partial<Record<'thinking' | 'search', boolean>>>
  reasoning?: ChatRunConfigReasoning
  mcp?: ChatMcpRunConfig
}
```

字段来源：

| 字段 | 来源 |
| --- | --- |
| `modelId` | `composer.model.selectedId.value` |
| `features` | `composer.model.features.value` 的浅拷贝 |
| `reasoning` | `composer.model.reasoning.value` |
| `mcp.serverIds` | 已安装且启用的 Server |
| `mcp.toolIds` | 对应 Server 下启用的 Tool |

`useKitChatRuntime` 负责生成、clone 快照并写入用户消息 metadata。`runConfigContextPlugin` 在每轮开始时读取快照，Provider Request 和 MCP Tool Plugin 消费当前轮快照。

发送后切换 Model、feature、MCP Server 或 Tool，只影响下一轮请求。

## 8. 接入方式

| 场景 | 入口 |
| --- | --- |
| 新项目 | `useLocalChatRuntime` |
| 已有 Kit conversation | `useKitChatRuntime` |
| 其他数据层 | 实现 `ChatRuntime` |

### 新项目

```ts
const runtime = useLocalChatRuntime({
  conversation: {
    storage,
    useMessageOptions: {
      initialMessages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
      ],
    },
  },
  titleGenerator: (message) => message.trim().slice(0, 24) || '新对话',
  modelProviders: [
    {
      type: 'deepseek',
      apiKey: '<DeepSeek API Key>',
      models: [{ id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' }],
    },
  ],
  mcpServers: [
    {
      id: 'maps',
      name: 'Maps',
      baseUrl: '/mcp/maps',
    },
  ],
})
```

### 已有 Kit conversation

```ts
const runtime = useKitChatRuntime({
  conversation,
  composer,
  titleGenerator: (message) => message.trim().slice(0, 24) || '新对话',
})
```

### 自定义 Runtime

自定义数据层提供协议要求的响应式状态和动作。`send` 负责资格校验、快照生成、请求和流式处理；`abort` 负责取消请求；会话动作负责同步对应的数据源。
