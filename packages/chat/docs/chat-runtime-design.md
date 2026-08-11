# ChatRuntime 运行时协议

## 分层

`ChatRuntime` 承载聊天业务运行时，但不承载 Provider、凭证、Transport 等基础设施。

```txt
业务数据层 / Kit / 自研 Store
  -> ChatRuntime
  -> TrChat
  -> ChatUIData + ChatUIOptions
  -> TrChatUI
```

| 层级 | 职责 |
| --- | --- |
| `ChatRuntime` | 提供会话、消息、请求状态、Composer 状态和业务动作 |
| `TrChat` | UI 桥接、输入草稿、Prompt 回填、发送失败恢复、数据映射和临时视觉 pending |
| `TrChatUI` | 消费普通 Data 和 UI Options，不依赖 Runtime |
| 业务数据层 | Provider、凭证、模型私有参数、MCP 连接、Tool 加载、Tool 调用和消息引擎配置 |

`TrChat` 不负责 MCP 自动加载、发送资格判定、业务去重或 `runConfig` 构造。

## 核心协议

### 响应式值

Runtime 只要求只读的 `.value` 结构，不要求调用方暴露具体的 Vue `Ref` 类型。

```ts
export interface ChatReadable<T> {
  readonly value: T
}
```

### Runtime

```ts
export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}

export interface ChatRuntimeActions {
  send: (payload: ChatSubmitPayload) => Promise<boolean>
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

`conversations` 只提供会话摘要，`activeConversation` 提供当前会话的消息、请求状态、处理状态和错误。

`send()` 返回值：

- `true`：Runtime 已接受发送，并已开始创建消息或请求。
- `false`：空文本、`disabled`、`submitDisabled` 或 MCP 未准备完成，未创建消息。
- reject：消息引擎、网络或业务请求失败。

## Composer

```ts
export interface ChatComposerRuntime {
  disabled?: ChatReadable<boolean>
  submitDisabled?: ChatReadable<boolean>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}
```

| 字段 | 语义 |
| --- | --- |
| `disabled` | 整个输入区域不可用 |
| `submitDisabled` | 可以继续输入，但暂时不能提交 |
| `model` | Model 列表、当前选择、feature 状态、reasoning 状态及修改动作 |
| `mcp` | MCP Server、Tool 状态及修改动作 |

`useKitChatRuntime` 会统一派生最终 `submitDisabled`：

```ts
const submitDisabled = computed(
  () => Boolean(source.submitDisabled?.value) || !areEnabledMcpToolsReady(source.mcp),
)
```

自定义 Runtime 也必须保证 `submitDisabled` 覆盖所有发送前置条件。

## Model Runtime

```ts
export interface ChatModelRuntime {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  features: ChatReadable<Readonly<Record<string, boolean>>>
  reasoning?: ChatReadable<ChatRunConfigReasoning>
  select: (id: string | null) => Promise<void> | void
  setFeature: (id: string, enabled: boolean) => Promise<void> | void
}
```

`reasoning` 是模型能力状态，属于 Model Runtime，不属于 Composer 补充配置。

## MCP Runtime

```ts
export interface ChatMcpRuntime {
  servers: ChatReadable<readonly ChatMcpServerInfo[]>
  tools: ChatReadable<ChatMcpToolState>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
  setToolEnabled: (serverId: string, toolId: string, enabled: boolean) => Promise<void> | void
}
```

MCP Tool 加载是 Server 生命周期的一部分，不作为公开 Runtime 动作暴露给 `TrChat`。

约束：

- `addServer()` 内部负责安装、启用并加载 Tool。
- `setServerEnabled(id, true)` 内部负责加载 Tool。
- `setServerEnabled(id, false)` 不删除 Tool 选择。
- `removeServer()` 清理当前 Server 的 Tool 状态。
- adapter 内部负责并发去重。
- 加载失败时更新 Server 状态并抛出错误。
- adapter 初始化时必须确保每个 `installed && enabled` 的 Server 已有 Tool 条目，或已处于 `loading` 状态。

## RunConfig

`ChatRunConfig` 是消息请求快照，不是 `send()` 参数。

```ts
export interface ChatRunConfig {
  modelId?: string
  features?: Readonly<Record<string, boolean>>
  reasoning?: ChatRunConfigReasoning
  mcp?: ChatMcpRunConfig
}

export interface ChatMcpRunConfig {
  serverIds: readonly string[]
  toolIds: Readonly<Record<string, readonly string[]>>
}
```

`ChatRunConfig` 不保存 Provider API Key、URL、Headers、Transport、完整 Tool schema 或 UI 配置。

字段来源：

| 字段 | 来源 |
| --- | --- |
| `modelId` | `composer.model.selectedId.value` |
| `features` | `composer.model.features.value` 的浅拷贝 |
| `reasoning` | `composer.model.reasoning.value` |
| `mcp.serverIds` | `composer.mcp.servers.value` 中 `installed && enabled` 的 Server |
| `mcp.toolIds` | 对应 Server 下启用的 Tool |

`useKitChatRuntime` 是默认 Kit adapter 的发送入口，负责生成 `ChatRunConfig`、clone 快照并写入用户消息 metadata。读取 Kit 消息中的快照时使用公开的 `readRunConfigFromMessage()`。

快照中的对象和数组会被复制。发送后切换 Model、feature、MCP Server 或 Tool，只影响下一轮请求。

## 发送流程

```txt
ChatUI submit
  -> TrChat 保存草稿并调用 runtime.actions.send({ text, structuredData })
  -> Runtime 检查发送资格
  -> Runtime 读取 Model/MCP 当前状态
  -> Runtime 生成并 clone ChatRunConfig
  -> Kit 写入用户消息 metadata
  -> plugins 读取当前轮快照
  -> Engine 请求与流式更新
  -> activeConversation 更新
  -> TrChat 映射回 ChatUI
```

发送未接受或失败时：

- `false`：`TrChat` 恢复草稿，不修改 `lastError`。
- reject：Runtime 更新 `activeConversation.lastError`，`TrChat` 恢复草稿。

## 接入方式

| 场景 | 入口 | 说明 |
| --- | --- | --- |
| 新项目 | `useLocalChatRuntime` | 内部创建 Kit conversation，并复用 `useKitChatRuntime` 完成适配 |
| 已有 Kit conversation | `useKitChatRuntime` | 保留现有 storage、plugins、responseProvider 和生命周期 |
| 其他数据层 | 实现 `ChatRuntime` | 适用于 Pinia、自研 Store 或其他消息引擎 |

### 新项目

```ts
const mcp = useMcp()

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
  mcp,
  providers: [
    {
      type: 'deepseek',
      apiKey: '<DeepSeek API Key>',
      models: [{ id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash' }],
    },
  ],
})
```

Provider 和 Model 可通过 `useLocalChatRuntime.providers` 配置，MCP 的业务 adapter 由项目提供。

### 已有 Kit conversation

```ts
const conversation = useConversation(existingOptions)

const runtime = useKitChatRuntime({
  conversation,
  composer,
})
```

### 自定义 Runtime

自定义数据层提供协议要求的响应式状态和动作。`send` 负责资格校验、快照生成、请求与流式处理，`abort` 负责取消请求，会话动作负责同步对应的数据源。
