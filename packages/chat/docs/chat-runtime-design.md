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
| `TrChat` | Runtime 适配、草稿管理、数据投影、动作执行和临时 pending |
| `TrChatUI` | 纯 UI Shell、输入状态和根级 Emits |
| 业务数据层 | Provider、凭证、Transport、MCP、Tool 调用和消息引擎 |

`TrChat` 不负责 MCP 自动加载、业务去重或 `runConfig` 构造。

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
  -> TrChat 保存草稿

ChatUI submit
  -> TrChat trim 文本
  -> 立即清空草稿
  -> runtime.actions.send({ text, structuredData })
  -> Runtime 请求

Runtime 返回 false 或 reject
  -> TrChat 恢复发送前草稿
```

发送 reject 不由 `TrChat` 静默吞掉。Runtime 负责把错误写入 `activeConversation.lastError`，TrChat 将其投影为 `ChatUIData.request.error`，ChatUI 默认展示错误或交给 `request-error` Slot。

ChatUI 的公共输入事件为 `update:inputValue`。`ChatComposer` 的 `update:value` 仅是 ChatUI 内部事件，不属于 Runtime 或 ChatUI 公共协议。ChatUI 不负责提交后自动清空，草稿清空和失败恢复由 TrChat 负责。输入模式在组件生命周期内不得从受控切换为非受控，或反向切换。

`sender.loading` 继续由 `requestState === 'processing'` 派生。Runtime 不新增 `operations`、`streaming` 等状态。

## 5. UI 数据投影

`TrChat` 映射：

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

`TrChat` 负责调用 Runtime action、并发去重、pending 状态和错误记录。ChatUI 不等待这些动作，也不修改业务 Data。

`TrChat` 继续消费会话、提交、Model 和 MCP 事件，不向外重复转发。Prompt、Bubble 和 Aside 事件原样向外转发；`history-action` 的 `delete` 调用 `deleteConversation`，其他 action 向外转发。Aside 的 `open-change` 事件中，`user` 表示用户点击 Header、Aside 或 Drawer 等控制，`viewport` 表示响应式断点切换导致组件主动关闭 Aside。外部修改 `layout.*Aside.open` 只影响展示，不派发事件。

MCP Tool 加载是 Server 生命周期的一部分：

- `addServer()` 负责安装、启用并加载 Tool。
- `setServerEnabled(id, true)` 负责加载 Tool。
- `setServerEnabled(id, false)` 不删除 Tool 选择。
- `removeServer()` 清理当前 Server 的 Tool 状态。
- 加载失败时更新 Server 状态并抛出错误。

## 7. RunConfig

`ChatRunConfig` 是消息请求快照，不是 `send()` 参数。

```ts
export interface ChatRunConfig {
  modelId?: string
  features?: Readonly<Record<string, boolean>>
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
