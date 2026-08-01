# CLI Basic 协议替换与迁移方案

## 1. 目标调整

本次工作的目标不是将 CLI basic 原有组件通过 slots 搬入 `TrChat`，而是：

1. 用 chat 公共协议替换 CLI basic 的本地会话、模型和 MCP 协议。
2. 使用已补齐的 Model、MCP 和逐轮配置协议承接 CLI basic 主链路。
3. 让默认 UI 直接消费统一协议。
4. 删除 CLI basic 中重复的状态胶水和 UI 装配。

目标结构：

```txt
CLI basic 应用配置
-> Chat/Kit adapter
-> ChatRuntime 公共协议
-> TrChat 默认 UI
```

slots 只作为自定义 UI 出口，不再作为模型和 MCP 标准功能的主要迁移方案。

## 2. 稳定边界

`ChatRuntime` 保持四域：

```ts
export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  composer: ChatComposerRuntime
  actions: ChatRuntimeActions
}
```

约束：

- 不增加与四域平级的 model、MCP 或 provider 字段。
- 创建、切换、重命名、删除会话均为必选动作。
- `activeConversation` 必须由 Runtime 内部状态派生。
- 输入草稿和提交编排继续由内部 `useChatInput` 管理。
- Model、MCP 和 run config 属于下一轮发送上下文，归属 `composer`。
- 运行时错误的公开语义只认 `activeConversation.lastError`。
- `ChatUi` 只配置展示和监听事件，不修改业务状态。
- API Key、Base URL、Headers、Provider、MCP Client 和 Transport 不进入 Runtime。

## 3. 协议替换矩阵

| CLI basic 当前实现                   | 替换目标                           | 处理方式                                       |
| ------------------------------------ | ---------------------------------- | ---------------------------------------------- |
| `useChat()`                          | `ChatRuntime`                      | 会话、消息、请求状态和动作统一通过 Runtime     |
| `activeConversationId + messages`    | `activeConversation`               | 消息和请求状态归属当前会话                     |
| `inputMessage`                       | 内部 `useChatInput`                | 不公开输入协议                                 |
| `useModel()`                         | `ChatModelRuntime`                 | 模型列表、选择和能力变为可选 composer 子协议   |
| `useMcp()`                           | `ChatMcpRuntime`                   | Server/Tool 状态和动作变为可选 composer 子协议 |
| `getSelectedModelParams()`           | `ChatRunConfig + Provider adapter` | 中性配置与供应商参数转换分离                   |
| Provider 直接读取模型 store          | 逐轮 run config 快照               | 发送后修改选择不影响当前请求                   |
| `McpServerPickerButton` 本地状态映射 | 默认 MCP UI 消费 `ChatMcpRuntime`  | Picker 不直接依赖 CLI store                    |
| `ChatSender.vue`                     | TrChat 默认 Sender                 | Model/MCP 默认 UI 由协议驱动                   |
| `ChatList.vue`                       | TrChat 默认 Messages               | Markdown、角色和空态走 ChatUi                  |
| `ConversationHistory.vue`            | TrChat 默认 Conversations          | 会话动作走 Runtime actions                     |
| 应用级主题和配置提示                 | `header` slot                      | 不新增业务协议                                 |

## 4. CLI Basic 能力矩阵

状态说明：

- 已覆盖：当前 chat 可直接承接。
- 部分覆盖：基础能力存在，但需要修复行为或映射。
- 后置能力：当前阶段暂不进入公共协议或默认 UI。
- 外部能力：属于应用或 Kit adapter，不进入 chat 核心协议。

| 能力                       | 当前状态 | 目标归属                                        | 阶段 |
| -------------------------- | -------- | ----------------------------------------------- | ---- |
| 多会话列表                 | 已覆盖   | `runtime.conversations`                         | 1    |
| 当前会话及消息             | 已覆盖   | `runtime.activeConversation`                    | 1    |
| 创建、切换、重命名、删除   | 已覆盖   | `runtime.actions`                               | 1    |
| 首次发送创建会话和标题     | 已覆盖   | `useKitChatRuntime`                             | 1    |
| 持久化                     | 已覆盖   | Kit storage                                     | 1    |
| 流式响应和取消             | 已覆盖   | Kit engine + Runtime actions                    | 1    |
| 后台会话请求隔离           | 已覆盖   | Kit working engine                              | 1    |
| 错误状态                   | 部分覆盖 | `activeConversation.lastError` + message plugin | 1    |
| system message 空态        | 部分覆盖 | Messages UI 可见消息派生                        | 2    |
| Markdown、角色、头像       | 已覆盖   | `ChatUi.bubbleProvider/bubbleList`              | 2    |
| 多行输入、字数限制、清空   | 已覆盖   | `ChatUi.sender`                                 | 2    |
| 响应式 History drawer      | 已覆盖   | `ChatUi.layout` + AsideToggle                   | 2    |
| 主题切换                   | 已覆盖   | `header` slot                                   | 2    |
| API 配置缺失提示           | 已覆盖   | `header` slot                                   | 2    |
| Sender 窄插槽              | 已覆盖   | `sender-footer/sender-footer-right`             | 2    |
| 模型列表和选择             | 已覆盖   | `ChatModelRuntime`                              | 3/4  |
| thinking/search 能力       | 已覆盖   | Model capabilities + run config                 | 3/4  |
| MCP Server 市场和安装      | 部分覆盖 | `ChatMcpRuntime`，独立市场源和安装向导后置      | 3/4  |
| MCP Server 启用和删除      | 已覆盖   | `ChatMcpRuntime` actions                        | 3/4  |
| MCP Tool 发现和启用        | 已覆盖   | `ChatMcpRuntime.tools/loadTools/setToolEnabled` | 3/4  |
| 逐轮模型/MCP快照           | 已覆盖   | `ChatRunConfig`                                 | 3/4  |
| 默认 ModelSelector         | 已覆盖   | 默认 sender UI                                  | 5    |
| 默认 MCPSelector           | 已覆盖   | 默认 sender UI                                  | 5    |
| Provider 参数转换          | 外部能力 | Provider adapter/plugin                         | 4    |
| MCP Client/Transport       | 外部能力 | MCP adapter/plugin                              | 4    |
| API Key、Base URL、Headers | 外部能力 | 应用配置/adapter                                | 4    |

## 5. 缺失协议设计

### 5.1 Run Config

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

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
  runConfig?: ChatRunConfig
}
```

规则：

- `runConfig` 是发送瞬间生成的只读快照。
- `modelId` 使用公共模型 ID，不使用供应商请求字段。
- `mcp.serverIds` 和 `mcp.toolIds` 共同表达本轮 MCP 选择。
- `mcp` 存在时，每个 Server 必须显式提供 Tool ID 数组；空数组表示本轮不提供该 Server 的任何 Tool。
- `features` 只表达 thinking、search 等中性开关。
- `reasoning` 只表达本轮推理开关和强度，不承载供应商私参。
- 显式 `payload.runConfig` 优先于 `composer.runConfig`；整个 `composer` 省略时 adapter 使用空只读配置，一旦传入 `composer` 就必须同时提供派生的 `runConfig`。
- API Key、URL、Headers 和 transport 不进入 `runConfig`。

### 5.2 Model Runtime

```ts
export interface ChatModelOption {
  id: string
  label: string
  capabilities?: Readonly<Record<string, boolean>>
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatModelRuntime {
  options: ChatReadable<readonly ChatModelOption[]>
  selectedId: ChatReadable<string | null>
  select: (id: string | null) => Promise<void> | void
  features: ChatReadable<Readonly<Record<string, boolean>>>
  setFeature: (id: string, enabled: boolean) => Promise<void> | void
}
```

规则：

- 模型协议不包含 apiKey、apiUrl 和供应商请求参数。
- `select` 失败时保留原选择。
- `setFeature` 失败时保留原状态。
- feature 是否可用由选中模型的 capabilities 派生。
- 图标和特定展示文案由默认 UI 或 ChatUi 提供。

### 5.3 MCP Runtime

```ts
export interface ChatMcpServerInfo {
  id: string
  name: string
  description?: string
  installed: boolean
  enabled: boolean
  loading?: boolean
  metadata?: Readonly<Record<string, unknown>>
}

export interface ChatMcpToolInfo {
  id: string
  name: string
  description?: string
  enabled: boolean
}

export type ChatMcpToolState = Readonly<Partial<Record<string, readonly ChatMcpToolInfo[]>>>

export interface ChatMcpRuntime {
  servers: ChatReadable<readonly ChatMcpServerInfo[]>
  tools: ChatReadable<ChatMcpToolState>
  addServer: (id: string) => Promise<void> | void
  removeServer: (id: string) => Promise<void> | void
  setServerEnabled: (id: string, enabled: boolean) => Promise<void> | void
  loadTools: (serverId: string) => Promise<void>
  setToolEnabled: (serverId: string, toolId: string, enabled: boolean) => Promise<void> | void
}
```

规则：

- installed、enabled 和 Tool enabled 必须有明确语义，不能共用一组 ID 表示。
- `addServer`、`removeServer`、`setServerEnabled` 失败时保留原状态。
- `tools` 是 UI Tool 摘要与启用状态的唯一来源；完整 schema 留在 adapter 内部。
- 缺少 Server key 表示尚未加载；空数组表示已加载但没有 Tool。
- 删除 Server 清理其 Tool 状态，禁用 Server 保留 Tool 选择。
- Client、Transport、Headers、连接池和工具执行器属于 MCP adapter。
- Server 错误状态后续按真实 UI 需求增量补充，不提前扩展。

### 5.4 Composer 扩展

```ts
export interface ChatComposerRuntime {
  disabled: ChatReadable<boolean>
  runConfig: ChatReadable<Readonly<ChatRunConfig>>
  model?: ChatModelRuntime
  mcp?: ChatMcpRuntime
}
```

一致性要求：

- `runConfig` 必须从 model、MCP 和 feature 状态派生，不能独立维护。
- Model/MCP 不存在时，默认 UI 不显示对应入口。
- Model/MCP 的修改动作留在各自子协议，不扩充顶层 `ChatRuntimeActions`。
- `useKitChatRuntime` 透传 composer 子协议，自身仍不持有 Provider、Client 或 Transport。

## 6. 目标数据流

### 6.1 基础发送

```txt
TrSender event
-> internal useChatInput
-> runtime.actions.send
-> active conversation engine
-> provider/plugin
-> runtime.activeConversation
-> UI
```

### 6.2 逐轮配置

```txt
runtime.composer.model/mcp
-> derived runtime.composer.runConfig
-> useChatInput 在 submit 时复制快照
-> ChatSubmitPayload.runConfig
-> Kit adapter 写入本轮 user message metadata
-> onTurnStart/onBeforeRequest/toolPlugin 读取快照
-> 首次请求解析 turn-scoped Tool catalog
-> Provider 参数和本轮 Server/Tool 过滤后的工具列表
-> Tool Call 和递归请求复用同一 catalog
```

### 6.3 UI

```txt
runtime.composer.model/mcp
-> default ModelSelector/MCPSelector/ModelFeatures
-> 子协议 select/add/remove/setEnabled/loadTools/setToolEnabled
-> Runtime 状态更新
-> runConfig 重新派生
```

## 7. 分阶段实施

### 阶段 0：冻结基线

已完成：

- [x] 新增 `packages/chat/demo/basic-integration/index.vue`。
- [x] 记录 CLI basic 会话、发送、取消、模型和 MCP 基线。
- [x] 新会话采用“立即创建并激活”的 TrChat 语义。
- [x] Tool toggle 只在 Tool 快照过滤和调用校验完成后开放。
- [x] 重试、附件、语音、反馈和消息编辑不进入本次范围。
- [x] 暂不引入新测试框架，维护手测验收清单。
- [x] 验证 Runtime 四域和必选会话 actions。
- [x] 验证 `activeConversation === null || conversations.some(id)`。

待完成：

无

阶段结果：范围和核心 Runtime 边界固定。

### 阶段 1：完成会话和消息协议替换

已完成：

- [x] 在迁移案例中验证 `useConversation + useKitChatRuntime + TrChat`。
- [x] 页面不再直接读取 `activeConversationId`、engine messages 和 request state。
- [x] 验证首次发送建会话、标题生成、流式和取消。
- [x] 捕获发送目标 conversation ID，避免切换会话后错误串写。
- [x] 验证删除请求中会话会取消请求并清理错误状态。
- [x] 明确 CLI message error 与 `lastError` 的展示优先级。

阶段结果：CLI 的 `useChat()` UI 协议被 `ChatRuntime` 替换。

### 阶段 2：完成基础 UI 替换

已完成：

- [x] 增加 `sender-footer` 和 `sender-footer-right` 窄插槽。
- [x] 保留完整 `footer` 替换入口。
- [x] 在迁移案例验证窄插槽与默认 Sender 共存。
- [x] 根据隐藏 role 派生可见消息和 Welcome 空态。
- [x] 配置 Markdown、角色、头像、Sender props 和自动滚动。
- [x] 使用 Layout drawer 和 AsideToggle 替换 CLI drawer 胶水。
- [x] 通过 header slot 迁移主题按钮和 API 配置提示。
- [x] 删除 CLI ChatList、基础 ChatSender、ConversationHistory 和 HistoryDrawerButton 的重复装配。

待完成：
无

阶段结果：除 Model/MCP 外，CLI 基础页面由 TrChat 默认 UI 承接。

### 阶段 3：定义并验证缺失协议

已完成：

- [x] 确定 `ChatRunConfig` 字段及快照规则。
- [x] 确定 `ChatModelRuntime` 的 options、selectedId 和 select 语义。
- [x] 确定 `ChatMcpRuntime` 的 Server、Tool 状态和动作语义。
- [x] 将三项能力加入 `ChatComposerRuntime`，保持 Runtime 顶层四域。
- [x] 明确 Model select、MCP action 的异步失败回滚规则。
- [x] 为无 Model、无 MCP、只有 Model、Model+MCP 四种组合建立类型示例。
- [x] 确认协议不包含供应商字段、凭证或 transport。

待完成：
无

阶段结果：缺失协议冻结，可以被外部 Runtime 和默认 UI 共同实现。

### 阶段 4：实现 CLI/Kit adapter 和逐轮配置链路

已完成：

- [x] 将 CLI `useModel()` 适配为 `ChatModelRuntime`。
- [x] 将 CLI `useMcp()` 适配为 `ChatMcpRuntime`。
- [x] 从 Model/MCP/feature 状态 computed 派生 `runConfig`。
- [x] `useChatInput.send()` 复制数组和对象，生成当前轮快照。
- [x] 显式 payload runConfig 优先于 composer 当前值。
- [x] Kit adapter 将快照写入当前 user message metadata。
- [x] Kit plugin 在 `onTurnStart/onBeforeRequest` 转换模型和 feature 参数。
- [x] 确认内部 metadata 不进入最终模型 messages。
- [x] `toolPlugin.getTools(context)` 按 `mcp.serverIds/toolIds` 快照过滤工具列表。
- [x] 修复 CLI Tool toggle 只更新 UI、不影响请求的问题。
- [x] Provider adapter 根据 modelId 选择供应商配置。
- [x] MCP adapter 负责 Client、Transport、listTools 和 callTool。

阶段结果：CLI 本地 store 通过统一协议接入，Provider/MCP 不再读取变化中的全局状态。

### 阶段 5：实现协议驱动的默认 UI

已完成：

- [x] 默认 ModelSelector 只读取 `runtime.composer.model`。
- [x] 默认 thinking/search 按钮从选中模型 capabilities 派生。
- [x] 默认 MCPSelector 只读取 `runtime.composer.mcp`。
- [x] MCP Picker 的市场、已安装和启用状态从统一 servers 派生。
- [x] 无对应子协议时不显示入口。
- [x] 异步操作期间显示稳定 loading，并在失败时回滚。
- [x] 默认 UI 不读取 useModel、useMcp、Provider 或 transport。
- [x] 保留 sender 窄插槽和完整 footer 作为自定义出口。

阶段结果：Model/MCP 成为 TrChat 默认能力，不再依赖 CLI 自定义 Sender。

当前默认 footer 由能力组件拼装：`MCPSelector`、`ModelSelector`、`ModelFeatures`。它们只做 chat runtime 协议到基础 UI 的薄适配；业务侧可继续通过 sender 窄插槽或完整 `footer` 自行组合。

### 阶段 6：替换 CLI 本地协议和组件

TODO：

- [ ] CLI 模型配置只保留模型定义和 Provider 私有配置。
- [ ] CLI MCP 配置只保留 Server 定义和连接私有配置。
- [ ] 删除组件对 `useModel()` 和 `useMcp()` 的直接依赖。
- [ ] 删除 CLI ChatSender 和 McpServerPickerButton 的重复 UI。
- [ ] 使用 TrChat 默认 ModelSelector、MCPSelector 和 ModelFeatures。
- [ ] 删除临时占位控件和迁移兼容分支。
- [ ] 确认 slots 只承接主题、配置提示等应用级扩展。

阶段结果：CLI basic 完成协议替换，不再维护一套平行的 Chat UI 协议。

### 阶段 7：集成验证

TODO：

- [ ] 验证 Built-in Kit、Existing Kit、Custom Runtime。
- [ ] 验证无 Model/MCP 的最小 Runtime。
- [ ] 验证 system-only、无 active 和 Provider 缺失状态。
- [ ] 验证流式期间切换会话、模型、MCP、取消和删除。
- [ ] 验证发送中切换模型/MCP只影响下一轮。
- [ ] 验证并发会话的 run config 互不污染。
- [ ] 验证 MCP 部分 Server 失败和 Tool 过滤。
- [ ] 执行 chat type-check 和 build。
- [ ] 运行 e2e 前执行 `pnpm build:components`。
- [ ] components 重建后重启测试服务，再执行 e2e。

阶段结果：公共协议、默认 UI、CLI basic 和三类 Runtime 行为一致。

## 8. 执行顺序

1. 完成会话和基础 UI 替换。
2. 冻结 RunConfig、ModelRuntime、McpRuntime。
3. 实现 CLI/Kit adapter 和逐轮配置链路。
4. 实现默认 Model/MCP UI。
5. 删除 CLI 本地协议和重复组件。
6. 完成三类 Runtime 和 e2e 验证。

不得提前执行：

- 不通过临时 slot 数据结构代替正式 Model/MCP 协议。
- 不在 run config 传递链路完成前让 Provider 直接读取 UI store。
- 不在 Tool 过滤生效前开放 Tool toggle。
- 不为迁移方便扩展 ChatRuntime 顶层字段。
- 不把 Provider、凭证、MCP transport 放入公共协议。

## 9. 完成标准

- [x] CLI `useChat()` 的 UI 协议已由 ChatRuntime 替换。
- [x] Model、MCP 和 run config 形成稳定公共协议。
- [x] 默认 UI 只消费公共协议，不依赖 CLI store。
- [x] 模型和 MCP 配置按 turn 快照。
- [x] MCP Server/Tool UI 状态与实际请求工具链路一致。
- [x] Provider、凭证、MCP Client 和 Transport 不进入 ChatRuntime。
- [x] ChatRuntime 保持 `conversations + activeConversation + composer + actions` 四域。
- [x] slots 仅用于自定义 UI，不承担标准功能协议。
- [ ] Built-in Kit、Existing Kit、Custom Runtime 全部通过验证。
- [ ] 类型检查、构建和 e2e 全部通过。
