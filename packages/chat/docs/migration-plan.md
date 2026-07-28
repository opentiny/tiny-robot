# CLI Basic 迁移方案

## 1. 评审结论

总体方向合理：保持 `ChatRuntime` 四域稳定，先迁移基础聊天，再通过 slots、run config 和 adapter 接入模型与 MCP。

当前方案不能直接执行，必须先修正以下问题：

| 级别 | 问题 | 影响 | 修正结论 |
|---|---|---|---|
| P0 | 只给 `ChatSubmitPayload` 增加 `runConfig`，无法自动传入 Kit provider 和 tool plugin | 模型、thinking/search、MCP 仍读取可变全局状态 | 先设计完整的 `submit -> message turn -> plugin/provider` 传递链路，再增加公共类型 |
| P0 | 当前 `footer` slot 会替换整个默认 Sender | 需要重复实现输入同步、提交、取消、禁用和失败恢复 | 提前增加 `sender-footer`、`sender-footer-right` 窄插槽，保留完整 `footer` 作为高级替换入口 |
| P0 | CLI 的 Tool toggle 只改变 Picker 展示状态，`toolPlugin.getTools()` 仍返回启用 Server 的全部工具 | UI 状态与实际请求不一致 | 未实现工具过滤前隐藏或禁用 Tool toggle；不得把现状标记为已迁移 |
| P1 | CLI “新会话”只清空 `activeConversationId`，TrChat 默认动作会立即创建会话 | 空会话持久化和列表行为不同 | 统一采用 TrChat 的立即创建语义，作为明确的产品行为变更 |
| P1 | `TrChat` 使用全部消息判断空态，system message 会阻止 Welcome | 初始页面可能空白 | 根据 `bubbleList.roleConfigs[role].hidden` 计算可见消息和空态 |
| P1 | `ui.sender.onSubmit` 在 `runtime.actions.send` 完成后才执行 | 不能用 listener 注入本次请求配置 | listener 只做通知；run config 必须在发送前由 Runtime sender 状态或自定义发送适配器快照 |
| P1 | 方案描述了“重试复用快照”，但 ChatRuntime 和 CLI basic 均无重试动作 | 验收目标不可执行 | 重试不进入本次迁移范围 |
| P1 | MCP Client 每次 list/call 都重新连接并关闭 | 高频工具调用有额外延迟 | 首期保持行为一致；连接池另立 Kit/MCP adapter 任务，不阻塞 UI 迁移 |
| P1 | 错误存在两种表现：CLI 写入 assistant message，ChatRuntime 提供 `lastError` | 迁移后可能重复显示或错误不可见 | 首期保留 CLI 消息错误展示，同时保证 `lastError` 正确；默认错误 UI 后续单独设计 |

边界原则：CLI basic 仅作为能力盘点和迁移验收基线，不作为 `packages/chat` 内部结构或公共 API 的实现模板。

## 2. 稳定边界

公共 Runtime 保持四域：

```ts
export interface ChatRuntime {
  conversations: ChatReadable<readonly ChatConversationInfo[]>
  activeConversation: ChatReadable<ChatConversation | null>
  sender: ChatRuntimeSender
  actions: ChatRuntimeActions
}
```

约束：

- `conversations`、`activeConversation`、`sender`、`actions` 不增加新的顶层同级域。
- 创建、切换、重命名、删除会话均为必选动作。
- `activeConversation` 由 Runtime 内部状态派生，不与会话列表分别维护。
- 输入草稿和提交编排继续由 `TrChat` 内部 `useChatInput` 管理。
- `ChatUi` 只配置展示和监听事件，不承担业务状态修改。
- API Key、Base URL、Headers、MCP transport 等私有连接配置不进入 Runtime。

## 3. CLI Basic 能力矩阵

状态说明：

- 已覆盖：当前 `packages/chat` 可直接承接。
- 部分覆盖：基础能力存在，但有行为或接口差异。
- 未覆盖：需要新增 chat 能力、adapter 或迁移代码。
- 外部能力：保留在应用或 Kit，不进入 chat 核心协议。

| 能力 | CLI basic 当前实现 | packages/chat 状态 | 迁移方式 | 阶段 |
|---|---|---|---|---|
| 多会话列表 | `useConversation.conversations` + `TrHistory` | 已覆盖 | `runtime.conversations` + 默认 Conversations | 1 |
| 当前会话 | `activeConversationId/activeConversation` | 已覆盖 | `runtime.activeConversation` | 1 |
| 创建会话 | 点击时清空 active，首次发送时创建 | 部分覆盖 | 统一为 `actions.createConversation()` 立即创建；首次无 active 发送仍需兜底 | 1 |
| 切换会话 | `switchConversation` | 已覆盖 | `actions.switchConversation` | 1 |
| 重命名 | `updateConversationTitle` | 已覆盖 | `actions.renameConversation` | 1 |
| 删除 | `deleteConversation` | 已覆盖 | `actions.deleteConversation` | 1 |
| 本地持久化 | `autoSaveMessages: true` + Kit storage | 已覆盖 | 保留原 `useConversation` 配置 | 1 |
| 初始 system message | `initialMessages` | 已覆盖 | 保留在 Kit engine | 1 |
| 首次发送自动建会话及标题 | `sendMessage()` 内处理 | 已覆盖 | `useKitChatRuntime` 默认处理；`useLocalChatRuntime` 只补默认配置 | 1 |
| 流式响应 | `responseProvider` + SSE generator | 已覆盖 | 保留 Kit `useMessage` 流程 | 1 |
| 取消请求 | `abortActiveRequest` | 已覆盖 | Runtime 必须提供可用的 `actions.abort` | 1 |
| 后台会话请求 | Kit working engine | 已覆盖 | 不在切换时取消旧会话 | 1 |
| 请求错误写入消息 | `onError` plugin | 部分覆盖 | 保留 plugin，并同步 Runtime `lastError` | 1 |
| Welcome 空态 | 过滤 system message | 部分覆盖 | 修复 TrChat 可见消息判定 | 2 |
| Markdown | `BubbleRenderers.Markdown` | 已覆盖 | `ui.bubbleProvider.fallbackContentRenderer` | 2 |
| 角色布局和头像 | `roleConfigs` | 已覆盖 | `ui.bubbleList.roleConfigs` | 2 |
| 自动滚动 | `TrBubbleList.autoScroll` | 已覆盖 | `ui.bubbleList.autoScroll` + ScrollToBottom | 2 |
| 多行输入 | `mode="multiple"` | 已覆盖 | `ui.sender.mode` | 2 |
| 清空、字数限制 | `clearable/maxLength/showWordLimit` | 已覆盖 | `ui.sender` 原子 props | 2 |
| loading、提交禁用 | `isProcessing` | 已覆盖 | `activeConversation.requestState` + `sender.disabled` | 2 |
| 响应式 History drawer | 自定义 drawer 与遮罩 | 已覆盖 | `ui.layout.leftAside.mode = drawer` + 默认 AsideToggle | 2 |
| 当前会话标题 | App header | 已覆盖 | 默认 Header | 2 |
| 主题切换 | `useTheme` + header button | 部分覆盖 | `header` slot 保留应用级状态 | 2 |
| API 配置缺失提示 | App warning | 未覆盖 | `header` slot；不进入 Runtime | 2 |
| 模型列表和选择 | `useModel` + `TrDropdownMenu` | 未覆盖 | 先通过 sender 窄插槽接入 | 3 |
| 模型供应商配置 | `models.ts` | 外部能力 | 保留在应用/provider adapter | 3/5 |
| thinking/search 开关 | `useModel` | 未覆盖 | 先通过 sender 窄插槽接入，发送时快照 | 3/4 |
| 模型切换请求参数 | `getSelectedModelParams()` | 未覆盖 | run config + provider adapter | 4/5 |
| MCP Server 市场列表 | `McpServers` + Picker | 未覆盖 | 复用 `TrMcpServerPicker`，状态保留在应用/MCP adapter | 3 |
| MCP Server 添加/删除/启用 | `useMcp` | 未覆盖 | sender 窄插槽 + MCP adapter | 3/5 |
| MCP Tool 发现 | `Client.listTools()` | 外部能力 | MCP adapter + Kit `toolPlugin` | 5 |
| MCP Tool 调用 | `Client.callTool()` | 外部能力 | MCP adapter + Kit `toolPlugin` | 5 |
| MCP Tool 启用/禁用 | Picker 有 UI，实际请求未过滤 | 未覆盖 | 修复工具过滤后再开放 UI | 5 |
| SSE/Streamable HTTP transport | MCP SDK | 外部能力 | 保留在 MCP adapter | 5 |
| Provider 凭证和 HTTP 请求 | `fetch` | 外部能力 | provider adapter；不得进入 ChatRuntime | 5 |

## 4. 目标数据流

### 4.1 基础聊天

```txt
TrSender event
-> useChatInput
-> runtime.actions.send
-> useKitChatRuntime adapter
-> active conversation engine
-> provider/plugin
-> runtime.activeConversation
-> UI
```

### 4.2 本轮配置

```txt
model/MCP UI state
-> runtime.sender.runConfig
-> useChatInput 在 submit 时复制快照
-> ChatSubmitPayload.runConfig
-> Kit send adapter 写入本轮 user message metadata
-> onTurnStart/onBeforeRequest/toolPlugin 读取本轮快照
-> provider request / tool list
```

要求：

- `runConfig` 必须在点击发送时生成不可变快照。
- Kit 默认排除 message metadata 后再发往模型，避免内部配置直接泄漏。
- Provider 参数转换发生在 adapter/plugin，不发生在 UI。
- MCP 工具列表必须按本轮 server/tool 快照过滤。
- 发送中修改选择只影响下一轮。

## 5. 分阶段迁移

### 阶段 0：冻结基线和行为决策

目标：先确定迁移语义，避免实现中反复调整 Runtime。

TODO：

- [ ] 记录 CLI basic 当前会话、发送、取消、模型和 MCP 的可复现行为。
- [ ] 确认新会话采用“点击后立即创建并激活”的 TrChat 语义。
- [ ] 确认 Tool toggle 在真正过滤工具前不展示为可用能力。
- [ ] 确认重试、附件、语音、反馈和消息编辑不进入本次范围。
- [ ] 为 Runtime 四域和必选会话 actions 增加类型契约测试。
- [ ] 增加 `activeConversation === null || conversations.some(id)` 一致性断言测试。

阶段结果：迁移范围、行为差异和验收口径固定，后续阶段不再修改 Runtime 顶层结构。

### 阶段 1：迁移会话和消息主链路

目标：用 `TrChat` 跑通 CLI basic 的会话、持久化、发送、流式和取消。

TODO：

- [ ] 保留 CLI basic 的 `useConversation()`、storage、plugins 和 responseProvider。
- [ ] 用 `useKitChatRuntime` 输出当前 `ChatRuntime` 四域。
- [ ] 确认 `useKitChatRuntime` 默认发送链路：trim、无 active 时创建会话、生成标题、发送到当前 engine。
- [ ] 发送开始时捕获 conversation ID，错误和完成状态不得写入后来切换的会话。
- [ ] Runtime 提供 `abort`，只取消当前 active 会话。
- [ ] 将页面主装配替换为 `<TrChat :runtime="runtime" :ui="ui" />`。
- [ ] 删除页面对 `activeConversationId`、messages 和 request state 的直接 UI 绑定。
- [ ] 保留 CLI `onError` plugin 的消息错误展示，并验证 `lastError` 同步。
- [ ] 验证删除正在请求的会话会先取消请求并清理状态。

验收：

- 创建、切换、重命名、删除和持久化可用。
- 首次发送、连续发送、流式输出和取消可用。
- 流式期间切换会话不会串消息、错误或请求状态。
- 删除 active 会话后 UI 回到空态。

阶段结果：CLI basic 的核心聊天能力全部运行在 `TrChat + Kit Runtime` 上，不包含模型和 MCP UI。

### 阶段 2：补齐默认 UI 等价能力

目标：不替换默认 Messages 和 Sender，完成基础视觉与交互迁移。

TODO：

- [ ] 根据 `ui.bubbleList.roleConfigs[role].hidden` 派生可见消息。
- [ ] 根布局和 Messages 使用同一份可见消息判断 Welcome，避免双状态源。
- [ ] system message 保留在 Runtime 消息中，只在 UI 隐藏。
- [ ] 配置 Markdown renderer、assistant/user/system role configs 和头像。
- [ ] 配置 Sender 的 multiple、clearable、maxLength、showWordLimit 和 placeholder。
- [ ] 使用 `ui.layout` 配置 desktop dock 与 mobile drawer。
- [ ] 使用默认 Header 的 `TrLayout.AsideToggle`，删除 CLI 自建 drawer 状态和遮罩。
- [ ] 通过 `header` slot 迁移主题按钮和 API 配置提示。
- [ ] 自定义 header 时继续使用 `TrLayout.AsideToggle`，保留移动端 History 入口。
- [ ] 验证 ScrollToBottom 和代理滚动条在桌面、移动端均可用。

验收：

- system message 不阻止 Welcome。
- Markdown、头像、角色、输入限制和自动滚动与 CLI 基线一致。
- 移动端 History 可打开、关闭并在切换后收起。
- API 提示和主题切换不进入 Runtime。

阶段结果：除模型/MCP 外，CLI basic 的默认页面体验完成迁移。

### 阶段 3：通过 Sender 窄插槽迁移模型和 MCP UI

目标：先迁移现有控件和状态，不提前发布 selector 协议。

TODO：

- [ ] 在 `TrChat` 增加 `sender-footer` 和 `sender-footer-right` 插槽并转发到内部 Sender。
- [ ] 保留现有 `footer` slot 作为完整 Sender 替换入口。
- [ ] 通过 `sender-footer` 放置模型选择、thinking/search 和 MCP 按钮。
- [ ] 继续复用 CLI 的 `useModel()`、`useMcp()` 和 `TrMcpServerPicker`。
- [ ] 模型切换后重新计算 feature 可用性；不支持的 feature 取消有效激活态。
- [ ] MCP Server 添加失败时恢复 loading/addState。
- [ ] Tool toggle 在功能修复前隐藏或禁用。
- [ ] 验证插槽控件交互不会重建 TrChat、丢失输入草稿或触发提交。

验收：

- 默认 Sender 的输入、提交、取消和失败恢复逻辑未被复制。
- 模型、thinking/search 和 MCP Server 控件可操作。
- 模型/MCP 状态仍归应用层所有，ChatRuntime 顶层结构不变。

阶段结果：完成产品 UI 迁移，但请求仍暂时通过 adapter 闭包读取配置。

### 阶段 4：建立端到端 Run Config 快照

目标：消除 provider、feature 和 MCP 对可变全局选择状态的直接读取。

候选类型：

```ts
export interface ChatRunConfig {
  modelId?: string
  mcpServerIds?: readonly string[]
  mcpToolIds?: readonly string[]
  features?: Readonly<Record<string, boolean>>
  custom?: Readonly<Record<string, unknown>>
}

export interface ChatSubmitPayload {
  text: string
  structuredData?: ChatStructuredData
  runConfig?: ChatRunConfig
}
```

TODO：

- [ ] 明确 `runtime.sender.runConfig?: ChatReadable<ChatRunConfig | undefined>` 的公共类型。
- [ ] `useChatInput.send()` 在调用 action 前复制数组和对象，形成当前轮快照。
- [ ] 显式传入的 payload runConfig 优先于 sender 当前值。
- [ ] Kit adapter 将快照写入本轮 user message metadata，不写入会话摘要。
- [ ] 增加 Kit plugin，在 `onTurnStart/onBeforeRequest` 读取快照并转换请求参数。
- [ ] 确认 message metadata 不进入最终模型 messages。
- [ ] `toolPlugin.getTools(context)` 按快照过滤 Server 和 Tool。
- [ ] 发送中修改模型、feature、Server 和 Tool，仅影响下一轮。
- [ ] 按 conversation ID 和 run ID 验证并发会话配置隔离。
- [ ] 不实现重试快照；等待未来重试协议确定。

验收：

- provider 和 tool plugin 不再直接读取变化中的全局选择状态。
- 当前请求配置在整个 turn 内保持一致。
- 不同会话同时请求时互不污染。
- `runtime.actions.send` 仍是唯一发送入口。

阶段结果：模型和 MCP 从“UI 状态闭包”升级为可测试的逐轮配置协议。

### 阶段 5：下沉 Provider 和 MCP adapter

目标：将网络、凭证、参数转换和工具执行完全移出 UI。

TODO：

- [ ] 先评估 Kit 现有 `OpenAIProvider` 是否可复用，避免再造重复 provider。
- [ ] 若不满足 Vue message `ResponseProvider`，提供最小 OpenAI-compatible adapter。
- [ ] provider adapter 根据 `modelId` 选择 URL、凭证和模型参数。
- [ ] thinking/search 中性 feature 在 adapter 中转换为供应商字段。
- [ ] API Key、Base URL、Headers 只保留在应用配置或 provider adapter。
- [ ] MCP SDK 依赖保留在 MCP adapter，不加入 chat 核心硬依赖。
- [ ] MCP adapter 负责 Server 配置、transport、listTools 和 callTool。
- [ ] Tool 列表按 `mcpServerIds/mcpToolIds` 过滤后再交给 Kit `toolPlugin`。
- [ ] Tool 调用前校验对应 Server 和 Tool 仍在本轮快照中。
- [ ] 补充 Server 连接、工具发现、工具调用、部分 Server 失败和取消测试。
- [ ] 将连接池优化单列任务，不阻塞首期迁移。

验收：

- UI 不读取凭证或 transport。
- Provider 和 MCP 均可被 Existing Kit 或 Custom Runtime 替换。
- Tool toggle 与实际发送工具列表一致。
- 单个 MCP Server 失败不会破坏其他 Server 的工具发现。

阶段结果：CLI basic 的模型请求和 MCP 工具链完成职责下沉。

### 阶段 6：抽取可选 Selector 能力和默认 UI

目标：在 slots 方案经过真实迁移验证后，再形成稳定公共协议。

建议保持在 `sender` 域内：

```ts
export interface ChatRuntimeSender {
  disabled: ChatReadable<boolean>
  runConfig?: ChatReadable<ChatRunConfig | undefined>
  modelSelector?: ChatModelSelector
  mcpSelector?: ChatMcpSelector
}
```

TODO：

- [ ] 收集阶段 3 至 5 的实际字段，删除只服务单一供应商的字段。
- [ ] 模型协议只保留 options、selectedId、select 和中性 capabilities。
- [ ] MCP 协议区分 available、installed、enabled 和 selected，禁止混用语义。
- [ ] 明确异步 select 的 loading、失败回滚和并发覆盖规则。
- [ ] 提供默认 ModelSelector 和 McpSelector。
- [ ] 默认 UI 只读取 selector 协议，不读取 provider/MCP 私有配置。
- [ ] 无对应 capability 时不渲染入口。
- [ ] 保留 `sender-footer` 和完整 `footer` 替换能力。

验收：

- Built-in Kit、Existing Kit、Custom Runtime 使用同一套默认选择器 UI。
- 不接入 selector 的 Runtime 保持现有 Sender 行为。
- 供应商字段、凭证和 transport 不进入公共 selector 类型。

阶段结果：模型和 MCP 从迁移专用 slot 实现升级为可选公共能力。

### 阶段 7：集成、清理和发布验证

目标：删除重复装配并完成发布级验证。

TODO：

- [ ] CLI basic 删除已被 TrChat 替代的 ChatList、ChatSender、ConversationHistory 和 drawer 胶水。
- [ ] 保留应用级模型配置、MCP 配置、主题和凭证注入。
- [ ] 更新 chat architecture、review checklist、示例和公共类型文档。
- [ ] 验证 Built-in Kit、Existing Kit、Custom Runtime 三种入口。
- [ ] 增加桌面和移动端组件测试截图基线。
- [ ] 增加流式期间切换会话、切换模型/MCP、取消和删除测试。
- [ ] 增加 system-only、无 active、Provider 缺失、MCP 部分失败测试。
- [ ] 执行 chat type-check 和 build。
- [ ] 运行 e2e 前先执行 `pnpm build:components`。
- [ ] components 重建后重启测试服务，再执行 e2e。

验收：

- CLI basic 能力矩阵中除明确排除项外全部完成。
- ChatRuntime 顶层仍为四域。
- 默认 UI、slots 和 Custom Runtime 均无行为回归。
- 文档、类型、Demo 和测试结果一致。

阶段结果：迁移完成，可进入发布和后续增量能力开发。

## 6. 最终执行顺序

1. 冻结行为和测试基线。
2. 迁移 Runtime 主链路。
3. 修复默认 UI 等价能力。
4. 增加 Sender 窄插槽并迁移模型/MCP UI。
5. 建立端到端 run config 快照。
6. 下沉 Provider 和 MCP adapter。
7. 抽取可选 selector 协议和默认 UI。
8. 清理 CLI 重复代码并完成三类 Runtime 验证。

不得提前执行：

- 在 run config 传递链路确定前发布 `ChatRunConfig`。
- 在 Tool toggle 真正过滤请求工具前开放该交互。
- 在 slot 迁移验证前发布 Model/MCP selector 协议。
- 为迁移方便向 ChatRuntime 顶层增加模型、MCP 或 provider 域。

## 7. 完成标准

- [ ] CLI basic 的会话、持久化、发送、流式、取消和基础 UI 全部由 TrChat 承接。
- [ ] 模型、thinking/search 和 MCP 配置按 turn 快照，不受发送后状态变化影响。
- [ ] Provider、凭证、MCP transport 和 Tool 执行不进入 ChatRuntime。
- [ ] Tool UI 状态与实际请求工具完全一致。
- [ ] ChatRuntime 保持 `conversations + activeConversation + sender + actions` 四域。
- [ ] 会话 actions 保持必选，abort 在 CLI 迁移 Runtime 中可用。
- [ ] Built-in Kit、Existing Kit、Custom Runtime 全部通过验证。
- [ ] 类型检查、构建、组件测试和 e2e 全部通过。
