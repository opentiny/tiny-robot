# ChatRuntime 运行时协议

## 分层

`ChatRuntime` 是 `TrChat` 的数据与动作协议，不是底层消息引擎协议。

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
| `TrChat` | 适配 Runtime、管理输入、编排 Model/MCP 动作、生成 `runConfig` |
| `TrChatUI` | 消费普通 Data 和 UI Options，不依赖 Runtime |
| 业务数据层 | Provider、凭证、模型私有参数、MCP 连接、Tool 调用和消息引擎配置 |

`ChatRuntime` 不依赖具体 UI 组件，`TrChatUI` 不依赖 Runtime，`TrChat` 是二者之间的默认装配层。

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
  send: (payload: ChatRuntimeSubmitPayload) => Promise<void> | void
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

### Composer

```ts
export interface ChatComposerRuntime {
  disabled?: ChatReadable<boolean>
  runConfig?: ChatReadable<Readonly<ChatRunConfigExtras>>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}

export interface ChatRunConfigExtras {
  reasoning?: ChatRunConfigReasoning
}
```

`composer` 可以为空对象。它描述下一轮发送所需的状态，不保存输入框草稿。

| 字段 | 语义 |
| --- | --- |
| `disabled` | 业务主动禁用 Sender，可省略 |
| `model` | Model 列表、当前选择、feature 状态及修改动作 |
| `mcp` | MCP Server、Tool 状态及修改动作 |
| `runConfig` | 无法从 Model/MCP 通用推导的补充配置，目前仅包含 `reasoning` |

`composer.runConfig` 不能覆盖由 `model` 和 `mcp` 派生的字段。

## 状态归属

| 状态 | 归属 |
| --- | --- |
| 会话列表、当前会话、消息、请求状态、错误 | `ChatRuntime` |
| 输入草稿、Prompt 回填、提交清空、失败恢复 | `TrChat` |
| Model 选择、feature 开关 | `ChatModelRuntime` |
| Model selecting、feature pending | `TrChat` 内部状态 |
| MCP Server/Tool 选择状态 | `ChatMcpRuntime` |
| MCP Server pending、Tool pending | `TrChat` 内部状态 |
| 已安装且启用 Server 的 Tool 自动加载 | `TrChat` |
| Provider、凭证、URL、Headers、Transport、Tool schema、Tool call | 业务数据层 |

Model 和 MCP Runtime 保存稳定业务状态，`TrChat` 只保存当前 UI 操作产生的临时 pending 状态。

## Sender 禁用规则

Sender 在以下任一条件成立时禁用：

```txt
composer.disabled?.value === true
或
存在已安装且启用、但 Tool 尚未就绪的 MCP Server
```

`composer.disabled` 用于业务限制；MCP 就绪状态由 `TrChat` 自动判断，业务侧不需要重复派生。

## RunConfig

### 数据结构

`ChatRunConfig` 是发送瞬间生成的只读快照，只包含当前轮请求需要的通用上下文。

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

`runConfig` 不保存 Provider API Key、URL、Headers、Transport、完整 Tool schema 或 UI 配置。

### 字段来源

| 字段 | 来源 |
| --- | --- |
| `modelId` | `composer.model.selectedId.value` |
| `features` | `composer.model.features.value` 的浅拷贝 |
| `reasoning` | `composer.runConfig.value.reasoning` |
| `mcp.serverIds` | `composer.mcp.servers.value` 中 `installed && enabled` 的 Server |
| `mcp.toolIds` | 对应 Server 下启用的 Tool |

当 `composer` 不包含 Model、MCP 或补充配置时，最终 `runConfig` 为 `undefined`。存在 Model Runtime 时，即使当前 `selectedId` 为空，也会生成 Model feature 快照。

### 发送流程

```txt
用户提交
  -> TrChat 读取 composer
  -> 生成并 clone ChatRunConfig
  -> runtime.actions.send({ text, runConfig })
  -> Runtime 执行当前轮请求
```

`useKitChatRuntime` 的默认发送实现会把快照写入用户消息 metadata。通过 `TrChat` 之外的入口直接调用其 `actions.send` 时，如果 payload 未提供 `runConfig`，adapter 会从当前 Composer 补充生成。

自定义 Runtime 从 `ChatRuntimeSubmitPayload.runConfig` 获取快照，并自行决定如何传递或持久化。读取 Kit 消息中的快照时使用公开的 `readRunConfigFromMessage()`。

快照中的对象和数组会被复制。发送后切换 Model、feature、MCP Server 或 Tool，只影响下一轮请求。

## MCP 就绪规则

参与当前轮的 Server 必须同时满足：

- `installed === true`
- `enabled === true`
- `loading !== true`
- `tools` 存在该 `serverId` 自有属性

`tools[serverId] = []` 表示加载已完成，但该 Server 没有 Tool；缺少 `serverId` 属性表示尚未完成加载。

存在未就绪的启用 Server 时：

- `runConfig.mcp` 为 `undefined`。
- Sender 自动禁用。
- `TrChat` 自动调用 `mcp.loadTools(serverId)`。
- `TrChat` 维护 Server 和 Tool 的 pending 状态。

禁用 Server 不修改其 Tool 选择状态。重新启用后复用原选择，并在 Tool 数据缺失时重新加载。

## 接入方式

| 场景 | 入口 | 说明 |
| --- | --- | --- |
| 新项目 | `useLocalChatRuntime` | 内部创建 Kit conversation，并复用 `useKitChatRuntime` 完成适配 |
| 已有 Kit conversation | `useKitChatRuntime` | 保留现有 storage、plugins、responseProvider 和生命周期 |
| 其他数据层 | 实现 `ChatRuntime` | 适用于 Pinia、自研 Store 或其他消息引擎 |

### 新项目

```ts
const model = useModel()
const mcp = useMcp()

const runtime = useLocalChatRuntime({
  conversation: {
    storage,
    useMessageOptions: {
      plugins: [
        createRunConfigPlugin(),
        createModelRequestPlugin(model.resolveModel),
        createMcpToolPlugin(mcp.listTools, mcp.callTool),
      ],
      responseProvider: createResponseProvider(model.resolveModel),
    },
  },
  composer: {
    model: model.model,
    mcp: mcp.mcp,
    runConfig: computed(() => ({
      reasoning: model.reasoning.value,
    })),
  },
})
```

`useLocalChatRuntime` 默认启用消息自动保存。Provider、Model 和 MCP 的业务 adapter 仍由项目提供。

### 已有 Kit conversation

```ts
const conversation = useConversation(existingOptions)

const runtime = useKitChatRuntime({
  conversation,
  composer,
})
```

### 自定义 Runtime

自定义数据层提供协议要求的响应式状态和动作。`send` 负责请求与流式处理，`abort` 负责取消请求，会话动作负责同步对应的数据源。
