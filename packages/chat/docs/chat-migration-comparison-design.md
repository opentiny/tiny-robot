# Chat 产品迁移对比与增强设计

## 1. 目的

本文用于将下列产品逐步迁移到 `@opentiny/tiny-robot-chat` 的 `TrChat` 体系：

- GenUI Chat：`genui-sdk-dev/packages/frameworks/vue/src/chat`
- Next Remoter：`webmcp-sdk-dev/packages/next-remoter`

它记录当前实现差异、迁移边界和后续增强方向。本文不是已实现 API 文档；当前行为仍以 `chat-runtime-design.md` 与 `chat-ui-design.md` 为准。本文中的“目标协议”必须经独立设计、测试和兼容性评估后才可落地。

## 2. 判定原则

### 2.1 进入 Chat 内核

满足以下任一条件的能力属于 Chat 协议或通用运行时：

- 影响消息如何创建、持久化、渲染、重试或发送；
- 影响同一轮请求的模型、工具或能力快照；
- 所有 Chat 产品都需要消费，且不应依赖具体后端、页面或品牌；
- 需要由 `TrChat`、`TrChatUI`、`ChatRuntime` 共同约束。

### 2.2 作为可选扩展

能力依赖特定流格式、渲染 SDK、工具市场或上传策略，但可通过稳定的 Chat 协议接入时，应放入可选扩展包或宿主 Adapter。

### 2.3 留在产品层

扫码、悬浮遥控器、业务 Prompt、品牌文案、特定页面工具、服务端地址、业务权限和产品级浮层不进入 `packages/chat`。Chat 只应为这些产品提供插槽、Adapter 或外层容器可组合的能力。

## 3. 当前基线

```txt
业务数据层 / Kit / 自研 Store
  -> ChatRuntime
  -> TrChat
  -> ChatUIData + ChatUIOptions
  -> TrChatUI
```

当前 Chat 已具备：

- 完整 Workspace 布局：左栏、Header、消息区、Composer、可选右栏；
- 会话 CRUD、草稿恢复、取消、流式请求错误展示；
- 内置模型 Provider、模型选择、深度思考和联网搜索；
- 消息级 `ChatRunConfig` 快照；
- Streamable HTTP MCP 的安装、启用、工具发现和工具选择；
- `TrChatUI` 与 `ChatRuntime` 的明确分层。

当前基线不应被破坏：

- `TrChatUI` 不直接依赖 Kit、Provider 或 MCP Client；
- `ChatUIData` 是展示事实，`ChatUIOptions` 不是业务状态；
- 发送后修改模型、feature、MCP 选择只影响下一轮；
- `TrChat` 消费 Runtime 动作，避免把实现细节泄漏给 UI。

## 4. 能力对比

| 领域 | 当前 Chat | GenUI Chat | Next Remoter | 迁移结论 |
| --- | --- | --- | --- | --- |
| 页面布局 | Workspace + 响应式 Aside | 消息区 + Sender | Dialog/遥控器壳 + 历史抽屉 | Workspace 留在内核；Dialog/遥控器留产品层 |
| 会话 | Runtime 统一 CRUD | IndexedDB 会话补丁 | Kit 会话 + 历史抽屉 | 迁移到现有 Runtime |
| 发送草稿 | 受控/非受控和失败恢复 | 直接写 MessageManager | 直接写 MessageManager | 保持当前 Chat 行为 |
| 用户内容 | `text` + 未落地的 `structuredData` | 文本与附件模板交错 | 文本或多模态数组，另有 `uiContent` | 需要正式内容协议 |
| 助手内容 | 字符串或宽松 `ChatMessagePart[]` | Markdown、推理、工具、Schema Card、错误 | Markdown、推理、工具、图片、Schema Card、usage | 需要正式富消息 Part 协议 |
| 流处理 | Provider SSE 转 Kit 消息 | 可替换 handler 链 | AI SDK StreamVisitor，多 step | 需要可插拔流归一层 |
| 推理 | 模型开关与 request body 映射 | 原生字段和 think tag 解析 | AI SDK reasoning 事件 | 推理作为 Part，模型 feature 仍保留 |
| 工具调用 | MCP Tool Plugin | 流式 tool call/result 展示 | Agent 多 step 工具循环展示 | 工具过程、状态与结果进入消息协议 |
| MCP | 静态列表，默认仅 Streamable HTTP | 无 MCP 管理 UI | 市场、SSE、自定义添加、WebMCP 目录刷新 | Runtime 与市场目录拆分 |
| 模型 | 三种内置 Provider | 自定义 fetch | AI SDK / 自定义 Provider / ReAct | 新增 Adapter，而非扩展内置枚举 |
| GenUI | 可透传底层 renderer | 完整 Schema Card 和卡片 Action | 完整 Schema Card | 作为 `chat-genui` 可选扩展 |
| Skills | 无 | 无 | Skill 元信息和按需读取工具 | 作为 `chat-skills` 可选扩展 |
| 用量 | 无 UI 数据 | 无 | 每轮总用量与细分 token | 增加请求结果与消息 Action 数据 |
| 产品入口 | 无 Dialog/遥控器 | 嵌入式组件 | 悬浮入口、扫码、全屏 | 留在产品层 |

## 5. 必须增强的 Chat 协议

### 5.1 双表示内容

两个对标产品均区分“发给模型的内容”和“界面展示内容”。当前 `ChatSendPayload.structuredData` 已预留入口，但默认 `useKitChatRuntime` 仅将 `text` 写入用户消息，因此附件和结构化内容无法端到端迁移。

目标是让每条消息同时具备：

```ts
interface ChatMessageItem {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  requestContent?: ChatRequestContent
  displayParts: readonly ChatMessagePart[]
  metadata?: Record<string, unknown>
}

type ChatRequestContent = string | readonly ChatContentPart[]

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; mediaType?: string }
  | { type: 'file'; name: string; mediaType: string; data?: string; url?: string }
```

规则：

- `requestContent` 是 Provider/Agent 请求的唯一输入；
- `displayParts` 是 Bubble Renderer 的唯一输入；
- 同一内容可有不同请求表示和显示表示，例如上传文件的服务端 URL 与本地预览；
- 持久化数据必须可序列化，不能保存 `File`、组件实例、AbortController 或 Client；
- 初期可从 `text` 映射为一个 `displayParts: [{ type: 'text' }]`，保证旧 Runtime 兼容。

### 5.2 富消息 Part

`ChatMessagePart` 不能继续只使用 `{ type: string; [key: string]: unknown }`。至少需要稳定的公共类型：

```ts
type ChatMessagePart =
  | { type: 'text'; text: string; streaming?: boolean }
  | { type: 'reasoning'; text: string; status: 'streaming' | 'completed' }
  | { type: 'tool-call'; callId: string; name: string; inputText?: string; input?: unknown; status: 'running' | 'completed' | 'error' }
  | { type: 'tool-result'; callId: string; output?: unknown; error?: unknown }
  | { type: 'attachment'; attachment: ChatAttachment }
  | { type: 'source'; source: ChatSource }
  | { type: 'usage'; usage: ChatUsage }
  | { type: 'error'; error: ChatMessageError }
  | { type: string; [key: string]: unknown }
```

最后一项保留第三方扩展兼容性；内置 Renderer 只依赖已定义的 Part。`schema-card` 不应写入内核联合类型，由 `chat-genui` 注册其扩展 Part 和 Renderer。

### 5.3 流归一和生命周期

Provider 不能将 OpenAI SSE、think tag、AI SDK event 或 GenUI 文本围栏直接泄漏给 `TrChatUI`。需要实例级 Stream Processor，将原始流事件归一为“追加或更新某个 Message Part”的操作。

```txt
Provider / Agent raw stream
  -> Stream Processor
  -> ChatMessagePart patch
  -> ChatRuntime activeConversation.messages
  -> Renderer Registry
  -> TrBubbleList
```

建议生命周期：

- `onTurnStart`：建立本轮消息和 RunConfig；
- `onPart`：追加或更新 Part；
- `onStepStart` / `onStepEnd`：记录 Agent 工具循环；
- `onTurnFinish`：写入 finishReason、usage、sources；
- `onTurnError`：更新请求状态，并按策略写入 `error` Part；
- `onTurnAbort`：结束仍在 streaming 的 Part。

Processor 必须是 Runtime 实例私有对象。不得复用 GenUI Chat 的全局 EventEmitter，否则多个 Chat 实例会互相收到流状态。

### 5.4 请求结果和 Agent Step

当前 `request` 只包含状态、处理状态和当前错误。为支持 Remoter 的工具过程与 Token 用量，应在消息 metadata 或独立只读 View 中增加：

```ts
interface ChatTurnResult {
  finishReason?: string
  usage?: ChatUsage
  steps?: readonly ChatTurnStep[]
  sources?: readonly ChatSource[]
}
```

`steps` 是运行事实，不是 UI 操作状态。Bubble 可在内容内展示 Tool Part，右栏或产品 Slot 可读取完整 step 详情。

### 5.5 消息操作

复制、重新生成是通用 Chat 能力，但具体按钮样式属于 UI 层。应定义可选的 Runtime actions：

```ts
copyMessage?: (messageId: string) => Promise<string> | string
regenerate?: (messageId: string) => Promise<boolean>
```

`regenerate` 必须在设计中选择一种语义：

- 截断当前分支并重发；
- 创建新的会话分支；
- 保留旧答案并追加新的回答。

不要默认采用 Remoter 当前的“截断后重发”实现，因为该行为会删除后续历史。

## 6. Provider、Feature 与 Composer 扩展

### 6.1 Provider Adapter

`useLocalChatRuntime` 的 `openai/deepseek/qwen` 保持为便利入口，不应扩展为所有模型平台的枚举。新增 Adapter 边界：

```ts
interface ChatProviderAdapter {
  createModelRuntime?: (config: unknown) => ChatModelRuntime
  stream: (request: ChatProviderRequest) => AsyncIterable<unknown>
  createStreamProcessor: () => ChatStreamProcessor
}
```

AI SDK Agent、后端 BFF、企业内部模型均通过 Adapter 接入。密钥、OAuth 和服务端策略继续由宿主或 BFF 管理。

### 6.2 通用模型 Feature

当前 `thinking/search` 是内置 feature。GenUI 模式、图像能力和未来的模型控制不应继续硬编码为联合类型。目标模型协议应允许注册 Feature 定义：

```ts
interface ChatModelFeatureDefinition {
  id: string
  label: string
  kind: 'boolean' | 'select'
  visible?: (model: ChatModelOption) => boolean
}
```

`thinking`、`search` 仍为默认实现；`genui` 由产品或 Adapter 注册。Feature 的值必须进入 RunConfig 快照，避免发送中切换造成请求语义漂移。

### 6.3 Composer 输入拦截

Remoter 会把 `/识别码` 解释为连接工具而非聊天消息。此类能力不能写入 `TrChatUI`。增加可选拦截器：

```ts
interface ChatBeforeSendInterceptor {
  beforeSend: (payload: ChatSendPayload) => Promise<'continue' | 'handled' | 'reject'>
}
```

技能快捷命令、业务命令、上传校验均通过此边界接入。`handled` 不创建用户消息；`reject` 保留草稿并报告错误。

## 7. MCP 设计边界

### 7.1 Runtime 与目录分离

现有 `ChatMcpRuntime` 负责已安装 Server、已发现 Tool 和启用状态，应继续承担这部分职责。MCP 市场不是 Runtime 的一部分。

```txt
McpServerCatalogAdapter
  -> 市场、分类、搜索、自定义表单、扫码结果
  -> 选择一个 Server 配置
  -> ChatMcpRuntime.addServer(config/id)

ChatMcpRuntime
  -> installed/enabled/tools/loading/error
  -> ChatRunConfig.mcp 快照
```

`chat-mcp-market` 负责 Remoter 的市场 UI；`packages/chat` 只提供目录数据和交互的可选 Slot/事件边界。

### 7.2 Transport 与生命周期

默认 Adapter 继续只支持 Streamable HTTP。SSE、local、builtin/WebMCP、OAuth 和连接复用通过高级 Adapter 或 transport factory 扩展。所有实现必须满足：

- 同一 Server 并发发现去重；
- 禁用、删除和失败使旧异步结果失效；
- 当前请求使用发送时的 Tool 快照；
- 目录刷新只影响后续请求；
- 安装不应隐式产生违反文档约定的网络发现。

当前实现中 `installed: true` 会触发 `loadTools()`；后续修改 MCP 时需先统一此行为与运行时设计文档。

## 8. UI 布局与 Slot 设计

### 8.1 保留的布局边界

`TrChatUI` 是 Workspace，不是 Dialog 或遥控器。保留五个区域：

```txt
left aside | header | main/messages | footer/composer | right aside
```

产品可将 `TrChat` 放入 Dialog、Drawer 或 Remoter 容器；`show`、`fullscreen`、扫码和悬浮入口不增加到 `TrChatUI` props。

### 8.2 Slot 规则

- 整体替换 Slot 用于接管一个区域；
- 增量 Slot 用于在默认布局内增加控件；
- 所有消息相关 Slot 必须透传稳定、只读的 scoped props；
- Slot 不暴露组件实例、MessageManager、MCP Client 或 Provider；
- 语义内容使用 Renderer，不使用“替换整条 Bubble 内容”的 Slot。

### 8.3 现有 Slot 的问题与目标增量 Slot

| 区域 | 当前问题 | 目标增量 Slot |
| --- | --- | --- |
| Header | `layout-header` 替换后丢失默认移动端操作 | `header-leading`、`header-actions` |
| Left Aside | `layout-left-aside` 只替换展开面板，不能替换 Logo/rail | `left-aside-brand`、`left-aside-rail`、`history-empty` |
| History | 无单项扩展点 | `history-item-prefix`、`history-item-actions` |
| Main | `layout-main` 替换 Welcome、Prompt、消息列表 | `welcome`、`prompts`、`messages-before`、`messages-after` |
| Bubble | `bubble-*` Slot Props 在 Chat 层丢失 | 保持名称，完整透传 scoped props |
| Composer | `sender-footer` 无 Runtime/UI 上下文 | `sender-header`、`sender-actions`、带 props 的 footer Slot |
| MCP | 无市场定制点 | `mcp-trigger`、`mcp-market-header`、`mcp-market-empty` |
| Right Aside | 未建立上下文选择模型 | 先保留正文/标题 Slot，未来增加 Context Panel 数据 |

### 8.4 Bubble Slot Props

底层 BubbleList 已提供消息、角色和内容索引；Chat 必须在 `ChatMessages -> ChatUI -> TrChat` 三层原样透传。目标公开字段：

```ts
interface ChatBubbleSlotProps {
  readonly message: ChatMessageItem
  readonly role?: string
  readonly messageIndexes: readonly number[]
  readonly visibleMessageIndex: number
  readonly contentIndex?: number
}
```

`visibleMessageIndex` 必须与过滤 system 消息后的 UI 列表一致；需要原始索引时另行显式提供，不得让用户猜测索引语义。

### 8.5 Renderer Registry

`ChatBubbleOptions.bubbleProvider` 当前可透传底层 `contentRenderers`，这是兼容入口。后续应增加显式、可类型化的 Registry：

```ts
interface ChatRendererRegistry {
  resolve: (part: ChatMessagePart) => Component | undefined
}
```

内核提供 text、reasoning、tool、attachment、error、usage Renderer；`chat-genui` 注册 schema-card；产品仍可覆盖或新增 Renderer。Renderer 接收 Part 和只读消息上下文，卡片内部动作通过 Emit/Action 进入 Runtime。

## 9. 可选扩展包

| 包 | 负责内容 | 不负责内容 |
| --- | --- | --- |
| `chat-genui` | Schema 流解析、Card Renderer、组件注册、Card Action、状态回写 | 具体业务组件、后端 prompt 格式 |
| `chat-multimodal` | 附件校验、序列化、上传适配、预览 Renderer | 文件存储、业务权限、长期 URL 签发 |
| `chat-skills` | Skill 清单、按需读取工具、临时 Prompt 作用域 | 业务 Skill 内容与权限 |
| `chat-mcp-market` | MCP 市场目录、分类、搜索、自定义 Server 表单 | 扫码协议、企业账号、OAuth 页面 |
| `chat-agent` | AI SDK Agent Adapter、多 step Stream Processor | 页面工具、产品 Prompt、业务工具策略 |

## 10. 产品迁移映射

### 10.1 GenUI Chat

| GenUI 能力 | TrChat 迁移目标 |
| --- | --- |
| `CustomModelProvider` + response handlers | `ChatProviderAdapter` + Stream Processor |
| `reasoning/tool/markdown/schema-card` Renderer | 内核 Part Renderer + `chat-genui` Renderer |
| `continueChat`、`saveState` | `chat-genui` Card Action，调用公开 Runtime action |
| `messages` 中附件模板 | `ChatContentPart` + `chat-multimodal` |
| 自定义 response handler | 实例级 Processor/Renderer 注册 |
| `empty` Slot | `welcome` / `messages-before` Slot |
| 自定义 role slot | Bubble scoped Slot 或 role config Renderer |

迁移时不复制：全局 EventEmitter、`schemaJson` 围栏作为内核协议、直接写入 MessageManager、手动维护 IndexedDB 补丁。

### 10.2 Next Remoter

| Remoter 能力 | TrChat 迁移目标 |
| --- | --- |
| `CustomAgentModelProvider` | `chat-agent` Provider Adapter |
| AI SDK StreamVisitor | Agent Stream Processor，输出 Step/Part/Usage |
| 复制与重新生成 | 内核 Bubble Action + 产品按钮 Renderer |
| 模型切换/GenUI 开关 | 通用 Feature 定义与 Composer Slot |
| MCP 市场和自定义添加 | `chat-mcp-market` |
| 动态 WebMCP Tool 目录 | 高级 MCP Adapter；刷新只作用于下一轮 |
| Skills | `chat-skills` |
| Dialog、遥控器、扫码、识别码 | Remoter 产品壳 + `beforeSend` 拦截器 |

迁移时不复制：`operations` 全替换 Slot、硬编码的 Agent URL、扫码 Session 协议、全局 Toast、业务市场分类。

## 11. 实施顺序与验收

### 阶段 1：协议补齐

- 定义内容、附件、富消息 Part、usage、step、消息操作类型；
- `structuredData` 端到端写入用户消息、请求和存储；
- 建立 Stream Processor，覆盖文本、推理、工具、错误和 abort；
- 为旧 `content: string` 保留兼容映射。

验收：文本聊天原有单测全部通过；多模态用户消息可在刷新后恢复显示；流中途取消不会留下永远 loading 的 Part。

### 阶段 2：UI 扩展边界

- 增加增量 Slot；
- 修复 Bubble Slot Props 三层透传；
- 增加 Renderer Registry 与默认 Renderer；
- 增加 Bubble Action 数据和事件。

验收：产品可新增 Header 操作和 Composer 控件而不替换默认布局；Bubble Slot 获得正确的可见索引与内容索引；移动端 Aside 行为不回归。

### 阶段 3：高级 Runtime

- 引入 Provider/Agent Adapter；
- 将模型 feature 改为可注册定义；
- 拆分 MCP Runtime 与 Catalog；
- 明确 MCP `installed` 的网络副作用。

验收：内置 Provider 不变；自定义 Agent 可展示多 step 工具过程和 usage；MCP 目录刷新不会改变进行中的请求。

### 阶段 4：产品迁移

- 先用 `chat-genui` 迁移 GenUI Chat 的富消息与 Card；
- 再用 `chat-agent`、`chat-mcp-market`、`chat-skills` 迁移 Remoter；
- 最后保留 Remoter 容器、扫码和页面工具为外层产品代码。

验收：两个产品不再直接依赖各自的 MessageManager 补丁；产品差异集中在 Adapter、Renderer、Slot 和外层容器。

## 12. 不纳入本轮内核的内容

- 具体 BFF、API Key、OAuth、企业权限、审计和限流；
- 文件的对象存储、病毒扫描、签名 URL 和业务配额；
- WebMCP 浏览器兼容、页面无障碍树快照、路由级工具注册；
- 二维码、识别码、悬浮入口、语音转写、品牌和业务 Prompt；
- 引用/检索来源的展示，直到实际 Stream Processor 提供稳定 source 数据。
