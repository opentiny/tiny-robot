# TinyRobot Chat 设计与迁移方案

## 1. 一页结论

`@opentiny/tiny-robot-chat` 是基于 `components + kit` 的 AI 会话应用装配层。

它有两个目标：

1. 为新项目提供开箱即用的 `TrChat`。
2. 让已有 Kit Runtime 项目只迁移 UI，不重建原有数据层。

当前核心结构：

```txt
TrChat
  -> ChatRuntime
  -> internal input state
  -> ChatUi
  -> slots
```

核心边界：

| 模块 | 职责 |
| --- | --- |
| `ChatRuntime` | 会话、消息、请求生命周期和业务动作 |
| internal input state | 输入草稿、提交交互、Prompt 回填和输入恢复 |
| `ChatUi` | 默认原子组件的展示配置 |
| `slots` | 按布局区域替换或扩展 UI |
| runtime adapter | 将 Kit、AI SDK、Pinia 或自研 store 映射为 `ChatRuntime` |

当前 MVP 已经覆盖基础聊天、会话、输入、取消请求、三类 Runtime 接入、Model/MCP sender 子协议、逐轮 `runConfig` 快照和协议驱动默认 sender UI。

本次评审建议批准：

- `ChatRuntime` 核心协议和默认 `TrChat` 装配。
- Built-in Kit、Existing Kit 和 Custom Runtime 三类接入路径。
- CLI basic 的主链路迁移。
- Model/MCP 子协议、`MCPSelector`、`ModelSelector` 和 `ModelFeatures`。

本次评审暂不承诺：

- MCP Tool 级管理。
- 独立 MCP 市场源和安装向导。
- 通用 capability registry。
- 上传、语音和 suggestions 等其他增强能力。

## 2. 背景与目标

### 2.1 现有问题

用户直接组合 `components + kit` 时，需要自行处理：

- 页面布局和区域装配
- Kit 数据和 UI 组件数据的映射
- 输入框草稿和发送状态
- 会话列表事件
- 不同数据层的接入差异

这些代码在不同项目中重复出现，也容易让 UI 直接依赖 Kit 或业务 store。

### 2.2 目标

```txt
新项目
  -> useLocalChatRuntime + TrChat

已有 Kit 项目
  -> useKitChatRuntime + TrChat

外部数据层
  -> 自定义 ChatRuntime + TrChat
```

### 2.3 非目标

当前不把 `chat` 做成：

- 新的底层消息引擎
- 新的 transport、storage 或 plugin 框架
- 完整复制 assistant-ui 的 runtime 体系
- 一次性覆盖所有上传、语音、建议和 MCP Tool 管理能力

## 3. 包边界

```txt
packages/components
  -> Layout / History / BubbleList / Welcome / Prompts / Sender

packages/kit
  -> message / conversation / stream / abort / plugin / storage

packages/chat
  -> application assembly + UI adapter
```

`chat` 不修改基础组件既有 props，公共协议也不直接暴露基础组件的数据源字段。

## 4. 当前架构

### 4.1 ChatRuntime

`ChatRuntime` 是给 UI 消费的 adapter 协议，不是底层 engine 协议。

```txt
runtime state -> TrChat UI
UI event -> runtime actions
```

当前公共协议的核心形状：

```ts
interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  sender: {
    disabled: ChatReadable<boolean>
    runConfig?: ChatReadable<Readonly<ChatRunConfig>>
    model?: ChatModelRuntime
    mcp?: ChatMcpRuntime
  }
  actions: {
    send: (payload: ChatSubmitPayload) => Promise<void> | void
    abort?: () => Promise<void> | void
    createConversation: (
      payload?: { title?: string; metadata?: Record<string, unknown> }
    ) => Promise<void> | void
    switchConversation: (id: string) => Promise<void> | void
    renameConversation: (id: string, title: string) => Promise<void> | void
    deleteConversation: (id: string) => Promise<void> | void
  }
}
```

完整类型以 [../src/types/index.ts](../src/types/index.ts) 为准，文档只解释协议语义，避免复制源码造成漂移。

约束：

- state 只读，修改必须通过 actions。
- UI 不直接调用 transport、storage 或 plugin。
- UI 不直接依赖 Kit 原始返回结构。
- `activeConversation` 是由 Runtime 内部状态派生的只读快照。
- 输入草稿不属于 `ChatRuntime`，只保留为内部输入编排。
- 不把项目专属字段直接加入核心协议。

### 4.2 内部输入编排

输入编排是 `TrChat` 内部状态，不作为当前 public API。

它负责：

- 管理 `TrSender.modelValue`
- 处理输入更新
- 处理 Prompt 回填
- 计算提交禁用状态
- 调用 `runtime.actions.send`
- 成功后清空输入
- 失败后恢复输入

发送链路：

```txt
TrSender submit
  -> internal send(payload)
    -> runtime.actions.send(payload)
```

拆分原因：输入草稿是 UI 临时状态，不属于会话和消息生命周期。已有 Kit Runtime 或 external runtime 不需要额外管理 `inputValue`。

### 4.3 ChatUi

`ChatUi` 负责默认原子组件的展示配置和可选 UI 事件通知：

| 配置 | 默认组件 |
| --- | --- |
| `layout` | `TrLayout` |
| `history` | `TrHistory` |
| `bubbleProvider` | `TrBubbleProvider` |
| `bubbleList` | `TrBubbleList` |
| `welcome` | `TrWelcome` |
| `prompts` | `TrPrompts` |
| `sender` | `TrSender` |

以下字段不通过 `ui` 配置：

| 组件 | 运行时字段 |
| --- | --- |
| `TrHistory` | `data / selected` |
| `TrBubbleList` | `messages` |
| `TrSender` | `modelValue / loading / disabled` |

原则：

```txt
同一状态只能有一个来源。
```

事件边界：

| UI 事件 | 内部动作 | 外部通知 |
| --- | --- | --- |
| History 点击、重命名、删除 | 先调用对应 Runtime action | 再调用 `history.onXxx` |
| Sender 提交、取消 | 先调用内部输入状态或 Runtime action | 再调用 `sender.onXxx` |
| Sender 输入、焦点和清空 | 无业务动作 | 调用 `sender.onXxx` |
| Prompt 点击 | 先回填内部输入状态 | 再调用 `prompts.onItemClick` |
| Bubble 状态和自定义事件 | 无业务动作 | 调用 `bubbleList.onXxx` |

`ui.onXxx` 是同步事件通知，不是第二个业务状态入口，不能阻止默认动作，也不等待异步 action 成功。事件配置可以来自 `computed<ChatUi>`；内部始终读取最新 listener，不需要 `markRaw` 或通过 `:key` 重建 `TrChat`。

### 4.4 内部 UI adapter

默认 UI 不直接消费外部数据类型：

```txt
ChatConversationInfo -> HistoryDisplayItem -> TrHistory
ChatMessageItem      -> BubbleDisplayMessage -> TrBubbleList
```

`Conversations.vue` 使用稳定的 item 引用，保证 `TrHistory` 的重命名编辑状态不因列表刷新而丢失。

`Messages.vue` 只负责把公共消息协议映射为 `TrBubbleList` 所需结构，并通过 `content / metadata` 保留扩展数据。

## 5. 默认装配和 Slots

默认装配：

```txt
TrChat
  -> TrLayout
    -> Header
    -> Conversations
    -> Messages
    -> Sender
    -> ProxyScrollbar / ScrollToBottom
```

区域 slots：

| slot | 默认内容 | 用途 |
| --- | --- | --- |
| `header` | `Header` | 替换或扩展顶部区域 |
| `left-aside` | `Conversations` | 替换或扩展会话列表 |
| `main` | `Messages` | 替换或扩展消息区域 |
| `footer` | `Sender` | 替换或扩展输入区域 |

slot 按布局区域命名，而不是按内部组件命名。覆盖 slot 后，该区域的默认组件不再自动渲染。

深度重组时，直接使用 `components + kit`，不要求 `TrChat` 覆盖所有场景。

## 6. 三种 Runtime 接入路径

### 6.1 `useLocalChatRuntime`

面向新项目：

```txt
useLocalChatRuntime
  -> useConversation
  -> useKitChatRuntime
  -> ChatRuntime
```

负责：

- 创建 Kit conversation
- 提供新项目默认的 `useConversation` 配置
- 透传标题 fallback
- 复用 `useKitChatRuntime` 的错误状态收敛

不负责输入草稿和 Prompt 回填。

### 6.2 `useKitChatRuntime`

面向已有 Kit Runtime：

- 接收已有 `useConversation()` 返回值。
- 默认支持首次发送自动创建会话，并用首条消息生成标题 fallback。
- 保留原有 transport、storage、plugins 和生命周期。
- 只做 Kit 数据到 `ChatRuntime` 的映射。
- 不要求用户迁移输入框状态。

这是已有 Kit 项目的主要 UI 迁移入口。

### 6.3 自定义 `ChatRuntime`

面向：

- AI SDK
- Pinia
- 自研 store
- 老系统数据层

外部数据层负责请求、stream、abort、错误和持久化；`TrChat` 只消费符合协议的 state 和 actions。

## 7. Demo 证据

| Demo | 验证目标 | 状态 |
| --- | --- | --- |
| [basic.vue](../demo/cases/basic.vue) | 无 Chat 抽象的单文件基线 | 已实现，待人工验收 |
| [built-in-kit.vue](../demo/cases/built-in-kit.vue) | 新项目快速接入 Kit | 已实现，待人工验收 |
| [existing-kit.vue](../demo/cases/existing-kit.vue) | 已有 Kit Runtime 只迁移 UI | 已实现，待人工验收 |
| [custom-runtime.vue](../demo/cases/custom-runtime.vue) | 外部数据层接入 | 已实现，待人工验收 |
| [basic-integration](../demo/basic-integration/index.vue) | CLI basic 主链路迁移 | 已实现，待人工验收 |

Demo 状态含义：

| 状态 | 含义 |
| --- | --- |
| 已实现，待人工验收 | 类型检查和构建通过后，仍需完成交互验收 |

当前 MVP 已覆盖：

- 消息展示和流式状态
- 会话创建、切换、重命名、删除
- 输入、Prompt 回填、发送、取消
- 默认布局和区域 slots
- Built-in Kit、Existing Kit、Custom Runtime
- Model/MCP sender 子协议
- 默认 `MCPSelector`、`ModelSelector` 和 `ModelFeatures`
- 逐轮 `runConfig` 快照

## 8. CLI basic 迁移差异

CLI basic 的 `useChat()` 同时组合了：

```txt
useConversation
useModel
useMcp
responseProvider
toolPlugin
```

当前 TrChat 已覆盖：

| CLI basic 能力 | 当前状态 |
| --- | --- |
| 消息列表 | 已覆盖 |
| 会话历史 | 已覆盖 |
| 输入和取消 | 已覆盖 |
| Kit Runtime 复用 | 已覆盖 |
| 模型列表和当前模型 | 已纳入 `runtime.sender.model` |
| 深度思考和联网搜索 | 已纳入 `runtime.sender.model.features` |
| MCP Server 选择 | 已纳入 `runtime.sender.mcp` |
| MCP Tool 级开关 | 未纳入 ChatRuntime |

因此当前可以用 `TrChat` 默认 sender UI 承接模型、模型能力和 MCP Server 选择；MCP Tool 级管理继续后置。

迁移矩阵：

| CLI basic 能力 | TrChat 对应位置 | 当前状态 |
| --- | --- | --- |
| `useConversation` | `useKitChatRuntime` | 已支持 |
| `ChatList` | 默认 `Messages` 或 `main` slot | 已支持 |
| `ConversationHistory` | 默认 `Conversations` 或 `left-aside` slot | 已支持 |
| 基础 `ChatSender` | 默认 `Sender` 或 `footer` slot | 已支持 |
| `useModel` | `runtime.sender.model` | 已支持 |
| thinking / search | `ModelFeatures` | 已支持 |
| `useMcp` Server 选择 | `runtime.sender.mcp` + `MCPSelector` | 已支持 |
| `toolPlugin` | Kit plugin / runtime adapter | 已按 `mcpServerIds` 快照过滤 |

完整替换的边界是替换 CLI basic 的通用聊天装配代码，不替换应用自己的模型供应商配置、MCP 权限、凭证和业务插件。

## 9. 下一阶段扩展路线

### 阶段 6：替换 CLI 本地协议和组件

目标：让 CLI basic 业务侧只保留供应商、凭证、MCP 连接和插件私有配置，通用 UI 走 `TrChat` 默认能力。

验收：

- 页面不直接依赖 `useModel()` 和 `useMcp()`。
- 使用 `MCPSelector`、`ModelSelector` 和 `ModelFeatures`。
- slots 只承接主题、配置提示等应用级扩展。

### 阶段 7：集成验证

目标：验证 Built-in Kit、Existing Kit、Custom Runtime 和 basic-integration 的协议行为一致。

验收：

- 无 Model/MCP、只有 Model、只有 MCP、Model+MCP 均可工作。
- 发送中切换模型或 MCP 只影响下一轮。
- MCP Server 启用状态影响本轮工具列表。
- type-check、build 和 e2e 通过。

后置：

- MCP Tool 级开关。
- 独立 MCP 市场源和安装向导。
- 通用 capability registry。
- 上传、语音和 suggestions。

## 10. 设计依据

assistant-ui 对本项目的有效启发：

- 核心 runtime 保持瘦。
- 复杂能力与核心生命周期分层。
- 单次发送上下文使用中性 `runConfig.reasoning`。
- 当前消息扩展使用 `content` 内容项和 `metadata`。
- UI 通过组合和 adapter 扩展，而不是直接请求后端。

## 11. 当前限制与验收

当前仍需通过后续迁移验证的内容：

- CLI basic 删除本地重复 UI 后的整体回归。
- 多 Runtime 组合下的 Model/MCP 可选子协议。
- 单次 `runConfig` 的重试语义。
- 独立消息 parts 协议及其稳定渲染约定。

公共类型依赖：

`ChatRuntime` 使用 chat 自己定义的 `ChatRequestState` 和 `ChatProcessingState`。Kit adapter 负责将 Kit 请求状态映射为中性状态，外部 Runtime 不需要依赖 Kit 类型。Sender 的 loading 由 `requestState === 'processing'` 派生，不在协议中保留重复状态。

`structuredData` 一致性：

`ChatSubmitPayload` 已公开 `structuredData` 字段，但默认 Kit 发送链路当前只消费 `text`。当前应明确将其视为自定义 Runtime 能力，直到默认 Kit 发送链路补齐传递语义。

运行语义仍需评审：

- 切换会话时当前请求是否自动取消。
- 删除正在请求的会话如何处理。
- 是否允许多个会话并发发送。
- MCP 加载失败时是否允许发送。
- 选择模型失败后是否恢复旧选择。
- `abort` 后 `requestState` 如何归一化。

完整替换 CLI basic 的验收标准：

- 保留已有 `useConversation`、transport、storage 和 plugins。
- 会话、消息、流式、取消行为不回归。
- 模型切换影响下一次请求。
- MCP Server 启用后工具进入请求链路。
- UI 不读取 API Key、Headers 或私有请求配置。
- 外部 Runtime 不需要提供输入框草稿状态。
- 选择器失败、请求失败和取消后状态可恢复。

Demo 验收至少需要记录：

- Basic：会话生命周期、发送取消、Prompt 回填、事件单次触发和 History 编辑状态稳定。
- Built-in Kit：首次发送建会话、流式消息、取消请求。
- Existing Kit：保留已有 conversation、切换会话、原有 plugin/storage 不重建。
- Custom Runtime：发送、错误、abort，且不提供输入框草稿状态。
- 三个 TrChat Demo：viewport 变化不重建组件，输入草稿不丢失，computed listener 立即生效。

关于 Custom Runtime Demo 的边界，需要额外说明：

- 它已经证明 `TrChat` 只依赖 `ChatRuntime`，不依赖 `useConversation`、engine、storage 或 plugins。
- 它当前仍可复用 Kit 的 SSE 解析工具和 OpenAI-compatible 类型，以减少 Demo 样板代码。
- 这不构成 `TrChat` 对 Kit runtime 的结构性依赖。
- 如果业务侧后端不是 Kit，而是自定义接口、自定义 SSE 事件流或 WebSocket，只需要替换 transport 和 parser，并继续产出同一个 `ChatRuntime` 即可接入。

## 12. 参考资料

- [评审决策清单](./review-checklist.md)
- [ChatRuntime 类型](../src/types.ts)
- https://www.assistant-ui.com/docs/runtimes/concepts/architecture
- https://www.assistant-ui.com/docs/runtimes/concepts/adapters
- https://www.assistant-ui.com/docs/api-reference/runtimes/composer-runtime
- https://www.assistant-ui.com/docs/ui/thread-list
