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

当前 MVP 已经覆盖基础聊天、会话、输入、取消请求和三类 Runtime 接入。
距离完整替换 CLI basic 模板，还需要补模型选择、模型能力开关、MCP Server 选择以及对应的发送配置协议。

本次评审建议批准：

- `ChatRuntime` 核心协议和默认 `TrChat` 装配。
- Built-in Kit、Existing Kit 和 Custom Runtime 三类接入路径。
- CLI basic 的基础聊天 UI 迁移。

本次评审暂不承诺：

- MCP Tool 级管理。
- MCP 市场和安装流程。
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

完整类型以 [../src/types.ts](../src/types.ts) 为准，文档只解释协议语义，避免复制源码造成漂移。

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
- 首次发送前创建会话
- 标题 fallback
- 统一错误状态

不负责输入草稿和 Prompt 回填。

### 6.2 `useKitChatRuntime`

面向已有 Kit Runtime：

- 接收已有 `useConversation()` 返回值。
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
| CLI basic | 模型、模型能力和 MCP 选择迁移 | 下一阶段 |

Demo 状态含义：

| 状态 | 含义 |
| --- | --- |
| 已实现，待人工验收 | 类型检查和构建通过后，仍需完成交互验收 |
| 下一阶段 | 当前协议未覆盖，不能作为 MVP 已完成能力 |

当前 MVP 已覆盖：

- 消息展示和流式状态
- 会话创建、切换、重命名、删除
- 输入、Prompt 回填、发送、取消
- 默认布局和区域 slots
- Built-in Kit、Existing Kit、Custom Runtime

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
| 模型列表和当前模型 | 未纳入 ChatRuntime |
| 深度思考和联网搜索 | 未纳入 ChatRuntime |
| MCP Server 选择 | 未纳入 ChatRuntime |
| MCP Tool 级开关 | 未纳入 ChatRuntime |

因此当前可以完成 CLI basic 的基础 UI 和 Kit 数据层迁移，但还不能无改造替换模型和 MCP 业务能力。

迁移矩阵：

| CLI basic 能力 | TrChat 对应位置 | 当前状态 |
| --- | --- | --- |
| `useConversation` | `useKitChatRuntime` | 已支持 |
| `ChatList` | 默认 `Messages` 或 `main` slot | 已支持 |
| `ConversationHistory` | 默认 `Conversations` 或 `left-aside` slot | 已支持 |
| 基础 `ChatSender` | 默认 `Sender` 或 `footer` slot | 已支持 |
| `useModel` | model capability | 待补 |
| thinking / search | model feature | 待补 |
| `useMcp` Server 选择 | MCP capability | 待补 |
| `toolPlugin` | Kit plugin / runtime adapter | 可复用，动态配置语义待定 |

完整替换的边界是替换 CLI basic 的通用聊天装配代码，不替换应用自己的模型供应商配置、MCP 权限、凭证和业务插件。

## 9. 下一阶段扩展路线

### 阶段 A：冻结 MVP 基础协议

目标：确认 `ChatRuntime + ChatUi + slots` 的边界。

验收：

- 三类 Runtime 接入成立。
- 输入草稿不要求外部 Runtime 提供。
- UI 不直接依赖 Kit 或外部 store。
- 默认 UI 和 slot 行为稳定。

### 阶段 B：完成 CLI basic 基础迁移

目标：用 `TrChat` 替换 CLI basic 的布局、历史、消息和基础 Sender。

保留在应用或 adapter 中的内容：

- 模型供应商配置
- API Key 和请求地址
- MCP Server 配置
- 业务插件

### 阶段 C：补中性发送配置

候选协议：

```ts
interface ChatRunConfig {
  modelId?: string
  mcpServerIds?: readonly string[]
  features?: Record<string, boolean>
  custom?: Record<string, unknown>
}

interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
  runConfig?: ChatRunConfig
}
```

`runConfig` 是否进入稳定 public API，需要经过评审决定。供应商参数、凭证和 MCP 连接配置不进入该协议。

候选运行语义：

- 发送时生成本次请求的 `runConfig` 快照。
- 发送过程中切换模型只影响下一次请求。
- 重试默认使用原请求快照。
- 多会话请求必须各自持有快照，不能读取全局可变选择状态。
- 单次 payload 优先于 runtime 当前选择，runtime 当前选择优先于 adapter 默认值。

### 阶段 D：补模型和 MCP 窄能力

先支持：

- 模型列表和选择
- 模型 feature 状态
- MCP Server 添加、删除、启用、禁用
- 选择状态到单次发送配置的映射

候选能力协议：

```ts
interface ChatRuntimeCapabilities {
  modelSelector?: ChatModelSelector
  mcpSelector?: ChatMcpSelector
}

interface ChatModelOption {
  id: string
  label: string
  capabilities?: Record<string, boolean>
  metadata?: Record<string, unknown>
}

interface ChatModelSelector {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  select: (id: string | null) => Promise<void> | void
}

interface ChatMcpServerOption {
  id: string
  label: string
  description?: string
  metadata?: Record<string, unknown>
}

interface ChatMcpSelector {
  options: ChatReadable<readonly ChatMcpServerOption[]>
  selectedIds: ChatReadable<readonly string[]>
  select: (ids: readonly string[]) => Promise<void> | void
}
```

该协议目前是下一阶段候选，不属于已冻结的 MVP API。首期只评审模型选择和 MCP Server 选择，Tool 级管理后置。

后置：

- MCP Tool 级开关
- MCP 市场和安装流程
- 通用 capability registry
- 上传、语音和 suggestions

### 阶段 E：默认 UI

先通过 `footer` slot 验证选择器协议，再考虑提供默认 ModelSelector 和 McpSelector，避免先固化未经验证的 UI API。

## 10. 设计依据

assistant-ui 对本项目的有效启发：

- 核心 runtime 保持瘦。
- 复杂能力与核心生命周期分层。
- 单次发送上下文使用中性 `runConfig/custom`。
- 当前消息扩展使用 `content` 内容项和 `metadata`。
- UI 通过组合和 adapter 扩展，而不是直接请求后端。

## 11. 当前限制与验收

当前仍需通过后续迁移验证的内容：

- 模型选择是否需要进入公共协议。
- MCP Server 选择和 Kit plugin 的动态衔接。
- 单次 `runConfig` 的快照和重试语义。
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

## 12. 参考资料

- [评审决策清单](./review-checklist.md)
- [ChatRuntime 类型](../src/types.ts)
- https://www.assistant-ui.com/docs/runtimes/concepts/architecture
- https://www.assistant-ui.com/docs/runtimes/concepts/adapters
- https://www.assistant-ui.com/docs/api-reference/runtimes/composer-runtime
- https://www.assistant-ui.com/docs/ui/thread-list
