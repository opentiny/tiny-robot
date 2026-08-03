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

