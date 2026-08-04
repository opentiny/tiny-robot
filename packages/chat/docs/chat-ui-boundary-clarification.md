# Chat UI / Runtime 边界澄清稿

> 状态：讨论稿  
> 日期：2026-08-04  
> 适用范围：`packages/chat`

## 1. 文档目的

这份文档用于和产品、架构、组件以及业务接入方澄清以下问题：

- `chat` 包到底负责什么；
- `TrChat`、`TrChatUI`、runtime adapter 和原子组件如何分工；
- 当前实现已经做到什么；
- 当前实现还存在哪些结构性问题；
- 下一步应该先解决什么，哪些问题暂时不应该扩大范围。

这不是最终 API 文档，也不是完整重构方案。它的目标是先把讨论对象、事实和决策点摆在同一张桌面上。

## 2. 先给结论

当前 `chat` 包可以作为一个 runtime 驱动的聊天页面装配组件使用，但还不是一个真正独立的数据层和 UI 层分离的 `ChatUI`。

当前实现的真实形态更接近：

```text
ChatRuntime
  -> TrChat
    -> Context
      -> Conversations / Header / Messages / Sender
        -> Atomic Components
```

而我们希望澄清并逐步收敛到：

```text
Kit Data Layer / Custom Data Layer
  -> ChatRuntime Adapter
    -> TrChat
      -> TrChatUI
        -> Atomic Components

User Event
  -> TrChatUI
    -> TrChat
      -> ChatRuntime Adapter
        -> Kit Data Layer / Custom Data Layer
```

这次新增的 `demo/cases/chat-ui.vue` 已经验证了一个重要事实：

> 只使用 `TrLayout`、`TrHistory`、`TrBubbleList`、`TrWelcome`、`TrPrompts` 和 `TrSender`，配合最小 mock 数据，就可以完成一个可用的聊天页面。

因此，下一步的重点不是继续给原子组件增加业务能力，而是把当前 `TrChat` 拆清楚：`TrChatUI` 做纯 UI，`TrChat` 做数据层包装。

## 3. 已经验证的事实

### 3.1 原子组件能力基本足够

当前原子组件已经覆盖聊天页面的主要视觉和交互基础：

| 能力 | 原子组件 |
| --- | --- |
| 布局和左右面板 | `TrLayout` |
| 会话列表 | `TrHistory` |
| 消息列表 | `TrBubbleProvider`、`TrBubbleList` |
| 空状态 | `TrWelcome` |
| 推荐问题 | `TrPrompts` |
| 输入和提交 | `TrSender` |
| 下拉选择 | `TrDropdownMenu` |
| MCP 选择 | `TrMcpServerPicker` |

`chat-ui.vue` 没有使用 `ChatRuntime`，也没有调用网络请求、storage 或 Kit engine，仍然能够完成：

- 会话展示；
- 会话切换；
- 会话创建；
- 重命名；
- 删除；
- 消息展示；
- Prompt 回填；
- mock 回复；
- 输入框状态同步。

这说明 UI 组装层不需要拥有请求引擎。

### 3.2 当前 `TrChat` 依赖 runtime context

当前默认实现中：

- `Conversations.vue` 通过 `useChatContext()` 读取会话和 action；
- `Messages.vue` 通过 `useChatContext()` 读取消息、prompt 配置和输入状态；
- `Sender.vue` 通过 `useChatContext()` 读取输入、runtime 和 composer；
- `Header.vue` 通过 `useChatContext()` 读取标题和创建会话 action。

Context 由 `Chat.vue` 注入。

因此这些组件虽然内部组合了原子组件，但自身并不是纯 props/emits UI 组件。

### 3.3 `ChatRuntime` 已经是一个 adapter 协议

`ChatRuntime` 的定位是正确的。它不直接暴露 Kit engine，而是提供：

- 会话摘要列表；
- 当前会话；
- 消息；
- 请求状态；
- composer 状态；
- 会话和发送 actions。

`useKitChatRuntime` 和 `useLocalChatRuntime` 也已经初步承担了 Kit 到 `ChatRuntime` 的映射责任。

问题在于：`TrChat` 内部缺少一个明确的、公开的纯 UI 子层，导致 runtime、输入编排和 UI 组装混在一起。

## 4. 四层职责划分

### 4.1 Application Data Layer

由业务应用或数据层负责：

- 网络请求；
- 流式响应；
- transport；
- storage；
- 会话持久化；
- 模型和 MCP 数据；
- 权限和业务校验；
- 请求取消；
- 错误处理；
- 业务侧的重试策略。

这一层不应该依赖 `TrHistory`、`TrBubbleList` 或 `TrSender` 的具体 DOM 和布局。

### 4.2 Runtime Adapter

由 `useKitChatRuntime`、`useLocalChatRuntime` 或业务自定义 adapter 负责：

- 将业务数据映射为 `ChatRuntime`；
- 将业务 action 映射为标准 action；
- 将请求状态转换为中性状态；
- 按会话隔离错误；
- 固化当前轮发送所需的 `runConfig`；
- 处理不同数据层之间的协议差异。

Runtime adapter 不应该负责页面布局，也不应该直接操作原子组件。

自定义数据层也不应该直接变成 `TrChat` 的第二套输入形态。它需要先适配为标准 `ChatRuntime`，再交给 `TrChat`。

### 4.3 TrChat

`TrChat` 是数据层包装组件，负责：

- 接收 `ChatRuntime`；
- 从 runtime 派生 `TrChatUI` 所需 props；
- 把 `TrChatUI` 的用户意图转发为 runtime actions；
- 把 runtime error、loading、disabled 等状态映射给 UI；
- 支持 `useLocalChatRuntime`、`useKitChatRuntime` 和自定义 `ChatRuntime`。

它不应该：

- 自己实现请求、stream、storage 或业务插件；
- 绕过 `ChatRuntime` 直接适配任意业务数据结构；
- 同时支持 runtime 模式和一整套纯 UI props，避免双数据源。

### 4.4 TrChatUI

`TrChatUI` 是纯 UI 组装组件，负责：

- 组合 `TrLayout`、`TrHistory`、`TrBubbleList`、`TrSender` 等原子组件；
- 把 props 转换为原子组件 props；
- 统一处理默认 UI 行为；
- 派发用户事件；
- 管理 UI 临时状态，例如输入草稿、面板开关和局部 pending；
- 提供区域 slots；
- 展示错误、loading、空态和取消状态。

它不应该：

- 调用网络接口；
- 读取 storage；
- 依赖 Kit engine；
- import `ChatRuntime` 类型或 runtime composables；
- 直接调用 MCP client；
- 自己决定业务数据如何持久化；
- 自己创建第二份会话事实来源。

它提供基础 UI 交互能力，但不单独提供完整对话能力。完整对话能力由 `ChatRuntime + TrChat + TrChatUI` 组合得到。

### 4.5 Atomic Components

原子组件只负责：

- 接收 props；
- 渲染 UI；
- 管理组件内部视觉交互；
- 派发明确事件；
- 提供 slots。

例如：

```text
TrHistory
  不知道 ChatRuntime
  不知道 storage
  不知道删除 API
  只知道 data、selected、menuItems 和事件
```

## 5. 当前实现的问题归类

### 5.1 UI 和 runtime 仍然通过 Context 强耦合

当前 `Conversations`、`Messages`、`Sender` 和 `Header` 都不能脱离 `TrChat` 使用。

这会带来：

- 难以单独测试；
- 难以复用；
- 难以替换单个数据源；
- 难以验证 UI 对不同数据的表现；
- UI 的真实依赖无法从 props 看出来。

Context 只能作为迁移期实现细节。目标形态应是 `TrChat -> TrChatUI` 通过 props/emits 连接，UI 子组件不再依赖 `useChatContext()`。

### 5.2 `ChatUi` 目前只是展示配置

`ChatUi` 包含：

- layout 配置；
- history 配置；
- bubble 配置；
- welcome 配置；
- prompts 配置；
- sender 配置。

但真正的 UI 数据没有包含在其中：

- history data；
- selected conversation；
- messages；
- input value；
- loading；
- disabled；
- error。

因此 `ChatUi` 不是完整的 UI view model，而是“原子组件配置 + 事件通知”的集合。

这没有错，但需要明确命名和定位，不能把它误认为独立的 `ChatUI` API。

### 5.3 默认 UI 行为和业务动作混在一起

当前默认组件内部会直接执行：

- Prompt 点击后回填输入框；
- History 点击后切换会话；
- History 重命名；
- History 删除；
- Sender 发送；
- Sender 取消；
- Model 选择；
- MCP Server 和 Tool 操作。

边界应该固定下来：

- Prompt 回填、输入草稿、面板开关属于 `TrChatUI`；
- 发送、取消、会话创建、切换、重命名、删除属于 `TrChat` 转发给 `ChatRuntime`；
- Model/MCP 的异步加载、权限、级联状态属于 feature controller 或 runtime adapter；
- Model/MCP 的展示入口可以通过 slot 接入 `TrChatUI`。

需要明确两类事件：

```text
UI intent
  用户点击了某个按钮

Runtime action
  系统真正切换、删除、发送或取消了某个业务对象
```

这两类事件不能永远混成一个 callback。

### 5.4 默认错误反馈不完整

runtime 已经有 `lastError`，但默认 UI 没有统一展示错误。

需要先确定产品行为：

- 显示错误消息气泡；
- 显示 sender 上方错误提示；
- 显示 toast；
- 保留失败的 assistant 消息；
- 提供重试按钮；
- 取消后是否显示“已取消”；
- 切换会话后是否保留该会话错误。

在这些行为没有确定之前，`lastError` 只是一个未完成的协议字段。

### 5.5 MCP 组件已经承担较多业务控制逻辑

`MCPSelector.vue` 不只是 UI：

- 维护 Server 和 Tool 的 pending；
- 加载 Tool；
- 串行化 Server action；
- 处理 Server 和 Tool 的级联开关；
- 处理自动禁用；
- 根据 runtime 状态修复 UI；
- 捕获错误并输出 console。

这部分逻辑以后可能继续膨胀，应该评估是否拆出 MCP feature controller。

### 5.6 构建和发布链路没有闭环

当前 package 入口指向 `dist`，但 package build 只做 `vue-tsc --noEmit`。

需要单独确认：

- 谁负责生成 dist；
- dist 是否应该提交；
- 发布前是否自动执行 library build；
- `main`、`module`、`types` 是否指向当前源码版本；
- workspace alias 是否掩盖了发布包问题。

这个问题优先级高于 UI 抽象，因为它会直接影响消费者能否使用包。

## 6. 建议的目标形态

### 6.1 `TrChat` 作为数据层包装组件

保留 `TrChat`，但职责收敛为：

```text
接收 useLocalChatRuntime / useKitChatRuntime / custom ChatRuntime
  -> 派生 TrChatUI props
  -> 渲染 TrChatUI
  -> 转发 TrChatUI emits 到 runtime actions
```

它负责 `ChatRuntime` 到 `TrChatUI` 的连接，不负责让每个子组件自行查找 runtime。

### 6.2 `TrChatUI` 作为纯 UI 组装组件

可以考虑如下方向：

```ts
interface TrChatUIProps {
  conversations: readonly ChatConversationInfo[]
  activeConversation: ChatConversation | null
  loading: boolean
  disabled: boolean
  error: unknown | null
  ui?: ChatUi
}

interface TrChatUIEmits {
  submit: [payload: ChatSubmitPayload]
  abort: []
  createConversation: []
  switchConversation: [id: string]
  renameConversation: [id: string, title: string]
  deleteConversation: [id: string]
}
```

具体形状还可以讨论，但核心原则是：

- UI 所需数据一次性可见；
- UI 只派发用户意图，不直接持有业务 action；
- 输入草稿默认由 `TrChatUI` 内部维护；
- 子组件不需要注入 runtime；
- UI 可以用 fixture/mock 独立验证；
- `TrChat` 是这些 props 和 emits 的默认数据层包装者。

### 6.3 事件规则

建议统一为：

```text
Atomic Components -> TrChatUI
TrChatUI emits -> TrChat
TrChat -> ChatRuntime actions
Runtime state -> TrChat -> TrChatUI
```

需要明确哪些事件是：

- 可阻止的；
- 只读通知；
- 等待异步完成后触发；
- 即使失败也要触发。

不要只通过 `onItemClick`、`onSubmit` 这类名字隐含语义。

## 7. 需要和相关方确认的决策

### 决策一：正式提供 `TrChatUI`

建议：提供。

理由：

- `chat-ui.vue` 已经验证了原子组件组合方式；
- 当前 Context 耦合限制了复用和测试；
- 外部 runtime 接入方需要一个明确的 UI 边界；
- `TrChat` 需要一个明确的纯 UI 子层。

### 决策二：输入草稿属于谁

建议：输入草稿属于 UI assembly，不属于业务 runtime。

runtime 只接收提交后的 payload，不需要维护输入框实时内容。

### 决策三：错误由谁展示

建议：runtime 提供错误状态，`TrChat` 映射错误状态，`TrChatUI` 提供默认展示，业务可以通过 slot 替换。

### 决策四：MCP 选择逻辑放在哪里

建议：

- MCP 数据、加载、权限、并发和一致性由 runtime/controller 负责；
- `MCPSelector` 只负责展示和派发用户意图；
- chat 包可以保留一个默认 adapter，但不要让 UI 自己演化成 MCP runtime。

### 决策五：当前 `ChatUi` 是否继续保留

建议保留，但明确它的名字和职责：

```text
ChatUi = 展示配置
TrChatUI Props = UI 数据
TrChatUI Emits = 用户意图
TrChatUI = 纯 UI 组件
```

不要让 `ChatUi` 同时承担配置、状态、业务动作和 runtime 适配。

## 8. 建议的实施顺序

### 阶段一：提取 TrChatUI

- 从当前 `chat-ui.vue` 和 `Chat.vue` 提炼正式 `TrChatUI`；
- `TrChatUI` 直接组合原子组件；
- 输入、会话、消息和错误都由 props 或内部 UI 状态驱动；
- `TrChatUI` 不 import `ChatRuntime`、Kit 或 runtime composables。

### 阶段二：收敛 TrChat 包装层

- 当前 `Chat.vue` 改为薄包装；
- 接收 `ChatRuntime`；
- 派生 `TrChatUI` props；
- 转发 `TrChatUI` emits 到 runtime actions；
- 支持 `useLocalChatRuntime`、`useKitChatRuntime` 和自定义 `ChatRuntime`。

### 阶段三：移除 Context 依赖

- `Conversations`、`Messages`、`Sender`、`Header` 改为 props/emits；
- `useChatContext()` 只作为过渡，最终不再被默认 UI 组件依赖；
- `chat-ui.vue` 改成 `TrChatUI + mock` fixture。

### 阶段四：收敛 feature controller

- 把 MCP 的加载和业务一致性逻辑从 UI 中抽出；
- 明确 Model capability 协议；
- 统一 pending、失败、恢复语义。

### 阶段五：修发布链路和补充行为验证

- 增加 library build；
- 生成 ESM、CJS 和类型声明；
- 校验 package exports；
- 确认 workspace alias 不再掩盖问题。

至少验证：

- 首次发送；
- 创建、切换、重命名、删除；
- 流式期间切换会话；
- abort；
- 发送失败后输入恢复；
- 默认错误展示；
- Prompt 回填；
- Model/MCP 操作失败恢复；
- 外部 runtime 不维护输入框草稿。

## 9. 验收标准

### UI 边界

- `TrChatUI` 不 import `ChatRuntime` 的实现；
- `TrChatUI` 不 import `ChatRuntime` 类型；
- `TrChatUI` 不 import runtime composables；
- `TrChatUI` 不读取 Kit engine；
- `TrChatUI` 不调用 transport 或 storage；
- 原子组件不依赖 `useChatContext`；
- UI 可以使用静态 fixture 独立渲染和交互。

### Runtime 边界

- runtime 只提供状态和 actions；
- runtime 不依赖具体 UI 组件；
- runtime 不关心页面布局；
- runtime 负责请求、取消、错误和持久化；
- conversation 状态只有一个事实来源。
- 自定义数据层必须适配为 `ChatRuntime` 后接入 `TrChat`。

### 事件边界

- 用户意图和业务结果语义清晰；
- 异步 action 的成功和失败可区分；
- callback 不会重复触发；
- 默认动作不会被隐式 callback 替换；
- 外部可以通过 slot 或 action 覆盖默认行为。

### 发布验证

- `pnpm build` 能生成真实 dist；
- 发布包入口与当前 `src/index.ts` 一致；
- 独立项目可以直接 import `TrChat` 和 runtime adapter；
- 类型声明与运行时代码一致。

## 10. 讨论时可以直接使用的简短表述

> 我们现在已经验证了原子组件可以独立组合成聊天 UI。目标形态是两层：`TrChatUI` 是纯 UI 组件，只负责布局、展示、输入草稿和用户意图；`TrChat` 是 `TrChatUI + ChatRuntime` 的默认包装组件，负责把 Kit 或自定义数据层适配后的 `ChatRuntime` 接到 UI 上。请求、持久化、错误、Model 和 MCP 业务逻辑继续留在 runtime adapter 或 feature controller。
